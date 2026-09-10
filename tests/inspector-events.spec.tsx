// @vitest-environment jsdom
/**
 * 按住修饰键时的事件路由。
 *
 * 这个文件的存在是为了一个具体的教训：浮层接管指针之后，**每一个真实鼠标事件
 * 的 target 都是浮层根节点**，而不是鼠标底下那个页面元素。曾经用
 * 「target 是不是我们的元素」来放行菜单点击，于是按住期间的一切事件都被放过去
 * ——右键弹不出层级菜单、左键也不跳转。当时的手测用 dispatchEvent 直接派发到
 * 页面元素上，target 是"对的"，把这个坑整个盖住了。
 *
 * 所以这里的每一发事件都**从浮层根节点派发**，照真实情形来。
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { INSPECTOR_ATTR, INSPECTOR_UI_ATTR, useInspector, type ForeignMark, type InspectorMenu } from '../src/client/inspector/useInspector.ts'
import type { SlotFrame } from '../src/client/inspector/attribute.ts'
import { installRegistrantProbe } from '../src/client/inspector/probe.ts'

const mounted: { root: Root; host: HTMLElement }[] = []
afterEach(() => {
  for (const m of mounted.splice(0)) {
    act(() => m.root.unmount())
    m.host.remove()
  }
  document.body.innerHTML = ''
})

interface Harness {
  overlay: HTMLElement
  menuUI: HTMLElement
  picks: SlotFrame[]
  menus: (InspectorMenu | undefined)[]
  armedLog: boolean[]
}

/**
 * 挂一个用 useInspector 的宿主，外加：
 *   一个页面元素（鼠标"底下"的东西，带假 fiber 让归因有东西可收）；
 *   一个浮层根（带 INSPECTOR_ATTR）——真实事件的 target 就是它；
 *   一个菜单区（带 INSPECTOR_UI_ATTR）——只有它上面的事件该被放行。
 */
function mount(): Harness {
  const page = document.createElement('div')
  page.setAttribute('data-slot', 'conversation.chat.node')
  const inner = document.createElement('button')
  page.appendChild(inner)
  document.body.appendChild(page)
  const entry = { component: () => null, registrant: 'ui-chat', options: { key: 'text' } }
  ;(inner as unknown as Record<string, unknown>)['__reactFiber$test'] = {
    memoizedProps: { entry, slotKey: 'conversation.chat.node' },
    stateNode: page,
    return: null,
  }
  // jsdom 没有真正的布局与命中测试，两者都要自己顶上
  inner.getBoundingClientRect = () => ({ top: 10, left: 10, width: 50, height: 20, right: 60, bottom: 30, x: 10, y: 10, toJSON: () => ({}) }) as DOMRect
  page.getBoundingClientRect = () => ({ top: 10, left: 10, width: 50, height: 20, right: 60, bottom: 30, x: 10, y: 10, toJSON: () => ({}) }) as DOMRect

  const overlay = document.createElement('div')
  overlay.setAttribute(INSPECTOR_ATTR, '')
  const menuUI = document.createElement('div')
  menuUI.setAttribute(INSPECTOR_UI_ATTR, '')
  overlay.appendChild(menuUI)
  document.body.appendChild(overlay)
  // 接管指针后命中栈的栈顶是浮层，底下才是页面元素——照这个顺序返回
  document.elementsFromPoint = () => [overlay, inner, page]

  const picks: SlotFrame[] = []
  const menus: (InspectorMenu | undefined)[] = []
  const armedLog: boolean[] = []

  function Harnessed() {
    const state = useInspector({
      prefs: { enabled: true, modifiers: ['alt'] },
      onPick: frame => { picks.push(frame) },
    })
    menus.push(state.menu)
    armedLog.push(state.armed)
    return null
  }

  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(<Harnessed />))
  mounted.push({ root, host })
  return { overlay, menuUI, picks, menus, armedLog }
}

/** 稳定引用的 prefs（真实用法来自 store，引用是稳的）。 */
const PREFS = { enabled: true, modifiers: ['alt'] as const } as never

const at = (x: number, y: number, alt = true) => ({ clientX: x, clientY: y, altKey: alt, bubbles: true, cancelable: true })

/** 按住修饰键：真实情形下 mousemove 的 target 也是浮层。 */
function arm(h: Harness): void {
  act(() => { h.overlay.dispatchEvent(new MouseEvent('mousemove', at(20, 20))) })
}

it('按住修饰键右键：层级菜单要弹出来（事件 target 是浮层根）', () => {
  const h = mount()
  arm(h)
  expect(h.armedLog.at(-1)).toBe(true)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('contextmenu', at(20, 20))) })
  const menu = h.menus.at(-1)
  expect(menu).toBeDefined()
  expect(menu?.levels.map(l => l.frame.slotKey)).toEqual(['conversation.chat.node'])
})

it('按住修饰键左键：选中并回调（事件 target 是浮层根）', () => {
  const h = mount()
  arm(h)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('click', at(20, 20))) })
  expect(h.picks).toHaveLength(1)
  expect(h.picks[0]?.registrant).toBe('ui-chat')
})

it('右键要吃掉浏览器菜单，左键要吃掉页面上的那一下', () => {
  const h = mount()
  arm(h)
  const ctx = new MouseEvent('contextmenu', at(20, 20))
  act(() => { h.overlay.dispatchEvent(ctx) })
  expect(ctx.defaultPrevented).toBe(true)
  const click = new MouseEvent('click', at(20, 20))
  act(() => { h.overlay.dispatchEvent(click) })
  expect(click.defaultPrevented).toBe(true)
})

it('落在菜单上的事件放行，交给菜单自己处理', () => {
  const h = mount()
  arm(h)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('contextmenu', at(20, 20))) })
  expect(h.menus.at(-1)).toBeDefined()
  // 菜单区里的点击不该被当成「点了页面」而关掉菜单
  const inMenu = new MouseEvent('click', at(20, 20))
  act(() => { h.menuUI.dispatchEvent(inMenu) })
  expect(inMenu.defaultPrevented).toBe(false)
  expect(h.menus.at(-1)).toBeDefined()
})

it('菜单开着时点遮罩：关菜单，且这一下不落到页面上', () => {
  const h = mount()
  arm(h)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('contextmenu', at(20, 20))) })
  const outside = new MouseEvent('click', at(200, 200))
  act(() => { h.overlay.dispatchEvent(outside) })
  expect(outside.defaultPrevented).toBe(true)
  expect(h.menus.at(-1)).toBeUndefined()
  expect(h.picks).toHaveLength(0)
})

it('没按修饰键：一个事件都不拦', () => {
  const h = mount()
  const click = new MouseEvent('click', at(20, 20, false))
  act(() => { h.overlay.dispatchEvent(click) })
  expect(click.defaultPrevented).toBe(false)
  const ctx = new MouseEvent('contextmenu', at(20, 20, false))
  act(() => { h.overlay.dispatchEvent(ctx) })
  expect(ctx.defaultPrevented).toBe(false)
  expect(h.menus.at(-1)).toBeUndefined()
  expect(h.picks).toHaveLength(0)
})

it('关着的时候连监听都不装', () => {
  const clicks: MouseEvent[] = []
  function Off() {
    useInspector({ prefs: { enabled: false, modifiers: ['alt'] }, onPick: () => {} })
    return null
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(<Off />))
  mounted.push({ root, host })
  const click = new MouseEvent('click', at(20, 20))
  clicks.push(click)
  act(() => { document.body.dispatchEvent(click) })
  expect(click.defaultPrevented).toBe(false)
})

it('prefs 每次渲染都是新对象时不会转成死循环', () => {
  let renders = 0
  function Unstable() {
    renders++
    // 调用方这么写完全合理：字面量 prefs，每次渲染都是新引用、新数组
    useInspector({ prefs: { enabled: true, modifiers: ['alt'] }, onPick: () => {} })
    return null
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(<Unstable />))
  mounted.push({ root, host })
  const settled = renders
  act(() => { document.body.dispatchEvent(new MouseEvent('mousemove', at(5, 5))) })
  // 渲染次数必须收敛：曾经这里会无限渲染，把 Node 的堆吃光
  expect(settled).toBeLessThan(5)
  expect(renders - settled).toBeLessThan(5)
})

/**
 * 走一遍真实的记账流程，拿一条**账本里认得出包名**的 slot 注册记录。
 *
 * 照真实运行时的形状搭：方法在原型上（补丁打在那儿），调用时 this 是被 cordis
 * traced 过的调用方——插件 fiber 上挂着它的 loader entry，包名就在那里。
 */
function registeredEntry(pkg: string): object {
  const store: { component: unknown; registrant?: string; options: object }[] = []
  class Slots {
    register(_options: unknown, component: unknown): () => void {
      const entry = { component, registrant: 'Z8', options: {} }
      store.push(entry)
      return () => {}
    }
    entries(): readonly object[] {
      return store
    }
  }
  const instance = new Slots()
  const restore = installRegistrantProbe(instance)
  const register = Object.getPrototypeOf(instance).register as (this: unknown, o: unknown, c: unknown) => () => void
  register.call(
    { ctx: { fiber: { entry: { options: { name: pkg } } } }, entries: () => store },
    { name: 'probe' },
    () => null,
  )
  restore()
  return store[store.length - 1]!
}

/** 造一屏东西：一个第三方 entry、一个官方 entry，外加一个被盖住的第三方 entry。 */
function mountScreen(): { marks: () => readonly ForeignMark[]; overlay: HTMLElement; covered: HTMLElement } {
  const overlay = document.createElement('div')
  overlay.setAttribute(INSPECTOR_ATTR, '')
  document.body.appendChild(overlay)

  const make = (slot: string, pkg: string, rect: { top: number; left: number; width: number; height: number }) => {
    const anchor = document.createElement('div')
    anchor.setAttribute('data-slot', slot)
    const child = document.createElement('div')
    anchor.appendChild(child)
    document.body.appendChild(anchor)
    // 走真实的记账路径拿 entry：包名只能从账本里查（registrant 是压缩名、会撞车，
    // 当不了包名——这正是 probe 存在的理由，测试不该绕过它）
    const entry = registeredEntry(pkg)
    ;(child as unknown as Record<string, unknown>)['__reactFiber$test'] = {
      memoizedProps: { entry, slotKey: slot },
      stateNode: anchor,
      return: null,
    }
    child.getBoundingClientRect = () => ({
      ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top, toJSON: () => ({}),
    }) as DOMRect
    return child
  }

  const third = make('sidebar.footer.action', '@ychris12138/dsh-usage-stats', { top: 10, left: 10, width: 100, height: 30 })
  const official = make('sidebar.brand.mark', '@deepseek-ai/dsh-client-ui-brand-official', { top: 50, left: 10, width: 100, height: 30 })
  const covered = make('conversation.composer', 'dsh-codex-subscription', { top: 90, left: 10, width: 100, height: 30 })

  // 命中测试：第三方与官方那两块露着（栈顶是自己），covered 那块被别人盖住
  document.elementsFromPoint = (x: number, y: number) => {
    if (y >= 90) return [overlay, document.body] // 盖住 covered 的东西
    const hit = y >= 50 ? official : third
    return [overlay, hit]
  }

  let latest: readonly ForeignMark[] = []
  function Screen() {
    const state = useInspector({
      prefs: PREFS,
      onPick: () => {},
      // 判据照 vendor.ts 的规则：@deepseek-ai 之外都算非官方
      isForeignPkg: pkg => !pkg.startsWith('@deepseek-ai/'),
    })
    latest = state.foreign
    return null
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(<Screen />))
  mounted.push({ root, host })
  return { marks: () => latest, overlay, covered }
}

it('按住时只标非官方、且只标看得见的', () => {
  const screen = mountScreen()
  act(() => { screen.overlay.dispatchEvent(new MouseEvent('mousemove', at(20, 20))) })
  const pkgs = screen.marks().map(m => m.pkg)
  // 第三方那块要标出来
  expect(pkgs).toContain('@ychris12138/dsh-usage-stats')
  // 官方的是常态，不标
  expect(pkgs.some(p => p.startsWith('@deepseek-ai/'))).toBe(false)
  // 被别的东西盖住的那块不标——画上去就是凭空一个框
  expect(pkgs).not.toContain('dsh-codex-subscription')
})

it('松开修饰键，整屏标记跟着撤掉', () => {
  const screen = mountScreen()
  act(() => { screen.overlay.dispatchEvent(new MouseEvent('mousemove', at(20, 20))) })
  expect(screen.marks().length).toBeGreaterThan(0)
  act(() => { screen.overlay.dispatchEvent(new MouseEvent('mousemove', at(20, 20, false))) })
  expect(screen.marks()).toHaveLength(0)
})

it('菜单自己的列表在滚，不该把菜单关掉', () => {
  const h = mount()
  arm(h)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('contextmenu', at(20, 20))) })
  expect(h.menus.at(-1)).toBeDefined()
  // 菜单里那个 overflow-y-auto 的列表滚动：scroll 不冒泡，我们在捕获阶段听，
  // 于是它也会走到 viewport 那条路上去——曾经因此一滚就关。
  act(() => { h.menuUI.dispatchEvent(new Event('scroll', { bubbles: false })) })
  expect(h.menus.at(-1)).toBeDefined()
})

it('页面滚动仍然要关菜单（记下的框已经错位了）', () => {
  const h = mount()
  arm(h)
  act(() => { h.overlay.dispatchEvent(new MouseEvent('contextmenu', at(20, 20))) })
  expect(h.menus.at(-1)).toBeDefined()
  act(() => { document.body.dispatchEvent(new Event('scroll', { bubbles: false })) })
  expect(h.menus.at(-1)).toBeUndefined()
})
