/**
 * Inspector 的交互内核：按住修饰键 → 悬停归因 → 点击选中 / 右键出层级菜单。
 *
 * 按住修饰键的那几秒里，浮层**接管全部指针事件**（`pointer-events: auto` 铺满
 * 视口），页面收不到任何鼠标事件——这是 Chrome DevTools 选取模式的同一招，
 * 也是唯一能同时挡住三类干扰的办法：
 *   点击的副作用  「按住 Option 点一下」在这个页面里可能是发消息、切会话、
 *                 删附件，必须在它发生之前截住；
 *   JS 的 hover   宿主的 tooltip 挂在 mouseenter 上，光拦 click 挡不住；
 *   CSS 的 :hover 按钮变色、浮出更多控件——这类根本没有事件可拦，只有让底下
 *                 的元素不再是 :hover 的目标才治得了。
 * 事件仍装在 window 的捕获阶段兜一道（接管切换有一帧的缝），命中测试因此不能
 * 用 elementFromPoint（会命中浮层自己），改用 elementsFromPoint 取第一个不属于
 * 浮层的元素。松开修饰键，接管立刻撤掉，页面一切照旧。
 *
 * 高亮画两层：命中的那个元素（你指的那一小块），外加它所属 entry 的**地盘**
 * ——那个 slot 锚点下所有子元素的包围盒。锚点自己是 `display: contents`，
 * getBoundingClientRect 恒为 0，所以地盘只能靠孩子们的并集算。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { attribute, fiberOf, framesFromFiber, ownerOf, type SlotFrame } from './attribute.ts'
import { pkgOfEntry } from './probe.ts'
import { matchesModifiers, type InspectorPrefs } from './prefs.ts'

/** 视口坐标下的一个框（JSON 化的 DOMRect 子集，方便测试里造假）。 */
export interface Box {
  top: number
  left: number
  width: number
  height: number
}

export interface InspectorHit {
  /** 命中的那个元素。 */
  box: Box
  /** 命中时的鼠标位置：提示牌贴着它放，而不是贴高亮框。 */
  pointer: { x: number; y: number }
  /** 归因链第 0 层所属 slot 锚点的地盘；算不出就没有。 */
  territory?: Box | undefined
  /** 「当前 → 根」的归因链。 */
  frames: SlotFrame[]
  /** fiber 读不到时的兜底 slot 名。 */
  anchorSlot?: string | undefined
}

/** 层级菜单里的一层：一条归因 + 它管的那块地方。 */
export interface MenuLevel {
  frame: SlotFrame
  /** 这一层 slot 出口的范围；锚点里没有可量的孩子时没有。 */
  box?: Box | undefined
}

/**
 * 一处「非官方插入」的标记：按住修饰键时整屏扫一遍，把第三方与本地插件插进来的
 * 界面全框出来。回答的是「这一屏里哪些东西不是 dsh 自带的」——不用一块块去指。
 */
export interface ForeignMark {
  pkg: string
  slotKey?: string | undefined
  box: Box
}

export interface InspectorMenu {
  x: number
  y: number
  levels: MenuLevel[]
  anchorSlot?: string | undefined
}

/** 浮层根节点带这个属性：命中测试要跳过它，才能问到它底下是什么。 */
export const INSPECTOR_ATTR = 'data-dsh-inspector'

/**
 * 浮层里**真正可交互**的部分（只有层级菜单）带这个属性。
 *
 * 为什么要跟 INSPECTOR_ATTR 分开：按住修饰键时浮层接管了指针，于是**每一个**
 * 真实鼠标事件的 target 都是浮层根节点。如果按「是不是我们的元素」来放行，
 * 就等于把按住期间的所有事件全放过去——右键弹不出层级菜单、左键也不跳转
 * （这个坑踩过一次：合成事件的 target 是页面元素，测不出来）。
 * 判据必须是「落在菜单里吗」：遮罩、高亮框、提示牌一律当透明的看。
 */
export const INSPECTOR_UI_ATTR = 'data-dsh-inspector-ui'

/**
 * 空标记列表的**唯一**实例。
 *
 * 每次都 `setForeign([])` 会喂给 React 一个新引用，于是「清空」也算一次状态变化。
 * 调用方要是每次渲染都传一个新的 prefs 对象（合理的写法），effect 就会重跑、又清
 * 一次、又渲染一次——转成死循环，实测能把 Node 的堆吃光。下面的依赖也因此按**值**
 * 比较修饰键，不按数组引用。
 */
const NO_MARKS: ForeignMark[] = []

/** 按住期间一并截住的原始鼠标事件（click / contextmenu 另有各自的处理）。 */
const RAW_MOUSE_EVENTS = ['mousedown', 'mouseup', 'dblclick', 'auxclick', 'pointerdown', 'pointerup'] as const

function boxOf(rect: DOMRect): Box {
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
}

/** 一个 display:contents 锚点的地盘：它所有孩子的包围盒并集。 */
function territoryOf(anchor: Element | null): Box | undefined {
  if (anchor === null) return undefined
  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity
  // 不用 for...of：tsconfig 的 lib 没带 DOM.Iterable，HTMLCollection 不可迭代
  for (let i = 0; i < anchor.children.length; i++) {
    const r = anchor.children[i]!.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) continue
    top = Math.min(top, r.top)
    left = Math.min(left, r.left)
    right = Math.max(right, r.right)
    bottom = Math.max(bottom, r.bottom)
  }
  if (top === Infinity) return undefined
  return { top, left, width: right - left, height: bottom - top }
}

/** 命中测试用：这个节点属于浮层（要跳过，去看它底下）。 */
function isOurs(node: EventTarget | null): boolean {
  return node instanceof Element && node.closest(`[${INSPECTOR_ATTR}]`) !== null
}

/** 事件放行用：这一下落在层级菜单上（交给菜单自己处理，别拦）。 */
function isMenuUI(node: EventTarget | null): boolean {
  return node instanceof Element && node.closest(`[${INSPECTOR_UI_ATTR}]`) !== null
}

/**
 * 进入探索模式时，把鼠标底下那些元素的 hover **卸掉**。
 *
 * 为什么需要这一步：浏览器只在指针移动时重做命中测试。如果鼠标已经悬停在某个
 * 按钮上、然后才按下修饰键，浮层虽然接管了指针，那个按钮却收不到任何离开事件
 * ——宿主挂在 mouseleave 上的 tooltip 就一直挂在屏幕上（正是「按住热键还能 hover
 * 出『在本地打开』」那个毛病）。所以按下的那一刻主动补一轮离开事件。
 *
 * 只补 JS 的那一半：CSS `:hover` 由浏览器自己维护，派发合成事件动不了它，得等
 * 指针真的动一下。那部分只是变色，不会弹出东西挡住视线，可以接受。
 */
function shedHover(x: number, y: number): void {
  const stack = document.elementsFromPoint(x, y)
  for (const el of stack) {
    if (isOurs(el)) continue
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: null }))
    el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }))
    el.dispatchEvent(new PointerEvent('pointerout', { bubbles: true }))
    el.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
  }
}

/**
 * 命中测试：视口坐标 → 归因结果。
 *
 * 按住时浮层接管了指针，elementFromPoint 只会返回浮层自己，所以取整条命中栈里
 * 第一个不属于浮层的元素。
 */
function probeAt(x: number, y: number): InspectorHit | undefined {
  const stack = document.elementsFromPoint(x, y)
  let el: Element | undefined
  for (const candidate of stack) {
    if (!isOurs(candidate)) { el = candidate; break }
  }
  if (el === undefined) return undefined
  const result = attribute(el, pkgOfEntry)
  const anchor = el.closest('[data-slot]')
  const hit: InspectorHit = { box: boxOf(el.getBoundingClientRect()), pointer: { x, y }, frames: result.frames }
  const territory = territoryOf(anchor)
  if (territory !== undefined) hit.territory = territory
  if (result.anchorSlot !== undefined) hit.anchorSlot = result.anchorSlot
  return hit
}

/** 这个框在视口里露出来了吗（屏外的不用画，也不用算）。 */
function onScreen(r: DOMRect): boolean {
  return r.width >= 1 && r.height >= 1 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth
}

/** 画上去了也看不见的：自己藏起来了。 */
function isHiddenBySelf(el: Element): boolean {
  const style = getComputedStyle(el)
  return style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0
}

/**
 * 这块地方是不是**整块**被别的东西盖住了。
 *
 * 光看 getBoundingClientRect 不够：设置面板背后的元素、滚出了滚动容器可视区的
 * 行，坐标都还在视口里，画个框上去就是凭空一个框。所以在框里取五个采样点做命中
 * 测试——只要有一点命中的是自己或自己的后代，就算露着（部分露出也画，那是对的）。
 *
 * 命中栈要跳过我们自己的浮层：按住修饰键时它接管着指针，栈顶永远是它。
 */
function isOccluded(el: Element, r: DOMRect): boolean {
  const points: [number, number][] = [
    [r.left + r.width / 2, r.top + r.height / 2],
    [r.left + 2, r.top + 2],
    [r.right - 2, r.top + 2],
    [r.left + 2, r.bottom - 2],
    [r.right - 2, r.bottom - 2],
  ]
  for (const [x, y] of points) {
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue
    for (const candidate of document.elementsFromPoint(x, y)) {
      if (isOurs(candidate)) continue
      if (candidate === el || el.contains(candidate)) return false
      break // 这一点最上面的不是它，说明这点被盖住了，换下一点
    }
  }
  return true
}

/**
 * 整屏扫一遍非官方插入。
 *
 * 走的是每个 `[data-slot]` 锚点的**直接子元素**：那一层就是「这个出口里此刻装
 * 着谁」的边界，从它往上收一次归因，第 0 层就是占着这个格子的 entry。
 *
 * 一个子元素一个框，**不做并集**：曾经按「包名 + 出口 + 格子」把同一条 entry 的
 * 兄弟节点合成一个框，结果一条 entry 铺在每条消息左侧的图标列上时，并集出来是一
 * 根贯穿全屏的竖线——看着像「这一整段都是第三方的」，正好是这个功能最不该给出的
 * 误导。宁可多几个小框。
 *
 * 只标**这一屏真的看得见的**：屏外的、自己藏起来的、被别的东西整块盖住的
 * （设置面板背后那些、滚出滚动容器的行）都不画——否则满屏是凭空的框。
 *
 * 判据由调用方给（insight 的 vendor.ts 那份，靠磁盘路径与 npm scope，不靠名单），
 * 这个模块因此不必知道什么叫「官方」。
 */
function scanForeign(isForeignPkg: (pkg: string) => boolean): ForeignMark[] {
  const marks = new Map<string, ForeignMark>()
  const anchors = document.querySelectorAll('[data-slot]')
  for (let a = 0; a < anchors.length; a++) {
    const anchor = anchors[a]!
    if (isOurs(anchor)) continue
    for (let c = 0; c < anchor.children.length; c++) {
      const child = anchor.children[c]!
      const rect = child.getBoundingClientRect()
      if (!onScreen(rect)) continue
      const own = framesFromFiber(fiberOf(child), pkgOfEntry)[0]
      if (own?.pkg === undefined || !isForeignPkg(own.pkg)) continue
      // 可见性检查放在最后：这两步（computedStyle、命中测试）比前面都贵，
      // 只对真的要画框的那几个候选做。
      if (isHiddenBySelf(child) || isOccluded(child, rect)) continue
      // 坐标进 key：同一块地方只画一次，不同地方各画一个
      const box = boxOf(rect)
      const key = `${own.pkg}|${own.slotKey ?? ''}|${box.top},${box.left},${box.width},${box.height}`
      if (marks.has(key)) continue
      const mark: ForeignMark = { pkg: own.pkg, box }
      if (own.slotKey !== undefined) mark.slotKey = own.slotKey
      marks.set(key, mark)
    }
  }
  return [...marks.values()]
}

export interface UseInspectorOptions {
  prefs: InspectorPrefs
  /** 点击（或菜单里选一层）时调用：frame 是被选中的那一层。 */
  onPick(frame: SlotFrame, hit: InspectorHit | InspectorMenu): void
  /**
   * 这个包算不算「非官方」（三方或本地）。按住时整屏标出来靠它。
   * 插件树还没到手时给个恒 false 的，标记那一轮就空着。
   */
  isForeignPkg?: ((pkg: string) => boolean) | undefined
}

export interface InspectorState {
  /** 修饰键正按着（菜单开着时也算，好让浮层保持可见）。 */
  armed: boolean
  /** 按住期间这一屏里所有非官方插入。 */
  foreign: ForeignMark[]
  hit: InspectorHit | undefined
  menu: InspectorMenu | undefined
  closeMenu(): void
  /** 菜单里点某一层。 */
  pickFrame(frame: SlotFrame): void
}

export function useInspector({ prefs, onPick, isForeignPkg }: UseInspectorOptions): InspectorState {
  const [armed, setArmed] = useState(false)
  const [foreign, setForeign] = useState<ForeignMark[]>(NO_MARKS)
  const [hit, setHit] = useState<InspectorHit | undefined>()
  const [menu, setMenu] = useState<InspectorMenu | undefined>()
  const pointer = useRef({ x: 0, y: 0 })
  const frame = useRef<number | undefined>(undefined)
  // 事件回调里要读最新值又不想反复重装监听，统一走 ref。
  const state = useRef({ prefs, armed: false, menuOpen: false, onPick, isForeignPkg })
  state.current = { prefs, armed, menuOpen: menu !== undefined, onPick, isForeignPkg }

  const closeMenu = useCallback(() => setMenu(undefined), [])

  const pickFrame = useCallback((picked: SlotFrame) => {
    const at = state.current.menuOpen ? menu : hit
    if (at !== undefined) state.current.onPick(picked, at)
    setMenu(undefined)
  }, [hit, menu])

  useEffect(() => {
    if (!prefs.enabled) {
      setArmed(false)
      setHit(undefined)
      setMenu(undefined)
      setForeign(NO_MARKS)
      return undefined
    }

    /** 非官方标记只在按住时算：布局可能刚变过，所以每次进入都重扫。 */
    const remark = () => {
      const judge = state.current.isForeignPkg
      const marks = judge === undefined ? NO_MARKS : scanForeign(judge)
      setForeign(marks.length === 0 ? NO_MARKS : marks)
    }

    /** 合并到下一帧再做命中测试：mousemove 一秒能来上百次。 */
    const schedule = () => {
      if (frame.current !== undefined) return
      frame.current = requestAnimationFrame(() => {
        frame.current = undefined
        if (!state.current.armed || state.current.menuOpen) return
        setHit(probeAt(pointer.current.x, pointer.current.y))
      })
    }

    const sync = (event: Pick<KeyboardEvent, 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey'>) => {
      const next = matchesModifiers(event, state.current.prefs.modifiers)
      // 菜单开着就按住不放：这时松开修饰键是为了去点菜单。
      if (state.current.menuOpen) return
      const entering = next && !state.current.armed
      setArmed(next)
      if (!next) {
        setHit(undefined)
        setForeign(NO_MARKS)
      } else {
        // 刚按下：把鼠标底下已经亮着的 hover 卸掉（见 shedHover 的注释）
        if (entering) {
          shedHover(pointer.current.x, pointer.current.y)
          remark()
        }
        schedule()
      }
    }

    const onMove = (event: MouseEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
      sync(event)
      if (state.current.armed) schedule()
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.current.menuOpen) {
        setMenu(undefined)
        setArmed(false)
        setHit(undefined)
        return
      }
      sync(event)
    }

    const onClick = (event: MouseEvent) => {
      if (isMenuUI(event.target)) return
      if (state.current.menuOpen) {
        // 菜单开着时点别处 = 关菜单，这一下不该落到页面上
        event.preventDefault()
        event.stopImmediatePropagation()
        setMenu(undefined)
        setArmed(false)
        setHit(undefined)
        return
      }
      if (!state.current.armed) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const current = probeAt(event.clientX, event.clientY)
      if (current === undefined) return
      const picked = ownerOf(current.frames) ?? current.frames[0]
      if (picked !== undefined) state.current.onPick(picked, current)
      setArmed(false)
      setHit(undefined)
    }

    const onContextMenu = (event: MouseEvent) => {
      if (isMenuUI(event.target) || !state.current.armed) return
      event.preventDefault()
      event.stopImmediatePropagation()
      const current = probeAt(event.clientX, event.clientY)
      if (current === undefined) return
      // 每层的范围在开菜单这一刻量好：菜单开着时页面不动，量一次就够，
      // 而且滑过菜单项时要立刻能高亮，不能等重新命中测试。
      const levels: MenuLevel[] = current.frames.map(frame => {
        const box = territoryOf(frame.anchor ?? null)
        return box === undefined ? { frame } : { frame, box }
      })
      const next: InspectorMenu = { x: event.clientX, y: event.clientY, levels }
      if (current.anchorSlot !== undefined) next.anchorSlot = current.anchorSlot
      setMenu(next)
    }

    /**
     * 滚动、改窗口大小之后框就错位了；重算比清掉体验好，但只在按住时算。
     *
     * scroll 装在捕获阶段（滚动事件不冒泡，只能这么听），于是**菜单自己那个列表
     * 在滚**也会走到这里。那正是它该做的事——层级深的时候列表本来就要滚——不能
     * 当成「页面动了」把菜单关掉。
     */
    const onViewportChange = (event: Event) => {
      if (isMenuUI(event.target)) return
      if (state.current.menuOpen) {
        setMenu(undefined)
        return
      }
      if (state.current.armed) {
        schedule()
        remark()
      }
    }

    const onBlur = () => {
      setArmed(false)
      setHit(undefined)
      setMenu(undefined)
      setForeign([])
    }

    /**
     * 接管切换有一帧的缝，这些事件在缝里仍可能落到页面上（mousedown 会开始
     * 选中文本、按下按钮的 active 态；dblclick 会选词）。按住时一律截住。
     */
    const onRawMouse = (event: MouseEvent) => {
      if (isMenuUI(event.target) || (!state.current.armed && !state.current.menuOpen)) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    window.addEventListener('mousemove', onMove, true)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('keyup', onKey, true)
    window.addEventListener('click', onClick, true)
    window.addEventListener('contextmenu', onContextMenu, true)
    for (const name of RAW_MOUSE_EVENTS) window.addEventListener(name, onRawMouse, true)
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('keyup', onKey, true)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('contextmenu', onContextMenu, true)
      for (const name of RAW_MOUSE_EVENTS) window.removeEventListener(name, onRawMouse, true)
      window.removeEventListener('scroll', onViewportChange, true)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('blur', onBlur)
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
      frame.current = undefined
    }
  // 修饰键按值比较：调用方每次渲染新建一个 modifiers 数组是完全合理的写法，
  // 按引用比较会让监听反复重装（配合状态更新还会转成死循环，见 NO_MARKS）。
  }, [prefs.enabled, prefs.modifiers.join(',')])

  return { armed, foreign, hit, menu, closeMenu, pickFrame }
}
