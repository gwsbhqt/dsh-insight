/**
 * UI 归因：从一个 DOM 元素反查「这块界面是哪个插件插进来的」。
 *
 * 两条信息源，一条不用 hack、一条要读 React 私有字段：
 *
 *   1. `[data-slot]` 锚点——ui-renderer 给每个 slot 出口包了一层
 *      `<div data-slot="<key>" style="display:contents">`（不参与布局，纯粹是
 *      可寻址的锚点）。DOM 里现成的，一句 closest() 就有。但它只说「在哪个
 *      slot 里」：list / keyed slot 里挤着好几个插件的 entry，光靠它分不出
 *      命中的是哪一个。
 *
 *   2. React fiber——每个 entry 外面有 RootEntry / SessionEntry /
 *      SlotErrorBoundary 这几层包装，它们的 props 带着那条 slot 注册记录
 *      （StoredEntry）。从命中元素沿 fiber.return 往上收一遍，就得到一条
 *      「当前 → 根」的归因链，精确到 entry。代价是读 `__reactFiber$*`——
 *      React 没承诺过这个字段（DevTools 也是这么读的），所以读不到时退回
 *      第 1 条，只给 slot 名。
 *
 * 注册者名字（entry.registrant）在生产构建里往往是压缩后的类名（实测是
 * `Z8` 这种），明文包名靠 probe.ts 的记账补上——见那边的头注释与它的边界。
 *
 * 这个模块只做纯遍历：不 import React，不碰组件，输入是「像 fiber 的对象」，
 * 于是可以拿手写的假链条单测。
 */

/** fiber 上挂在 DOM 节点的键前缀（React 18/19 都是这个形状）。 */
const FIBER_KEY_PREFIX = '__reactFiber$'

/** 往上爬的层数上限：够深（实测一条真链 26 层），又不至于在异常环里转死。 */
const MAX_DEPTH = 2000

/** 归因链的一层：一个 slot 出口里的一条 entry。 */
export interface SlotFrame {
  /** slot 名（SlotMap 的键），如 `conversation.chat.node`。 */
  slotKey?: string | undefined
  /** keyed slot 的 cell 键。 */
  entryKey?: string | undefined
  /** list slot 的 cell id。 */
  entryId?: string | undefined
  /** 注册时记下的注册者名。生产构建里常是压缩名，只能当线索，不能当包名。 */
  registrant?: string | undefined
  /** 明文包名（来自 probe 记账）。记不到就是 undefined——照实说未知，不猜。 */
  pkg?: string | undefined
  /**
   * 这一层 slot 出口的锚点元素（`<div data-slot>`）。层级菜单靠它高亮「这一层
   * 管的是哪块地方」。锚点自己是 display:contents，量尺寸要用它的孩子。
   */
  anchor?: Element | undefined
}

/** 一次归因的结果。 */
export interface Attribution {
  /** 从命中元素往根走的链条：第 0 层是最贴近鼠标的那个 entry。 */
  frames: SlotFrame[]
  /** fiber 读不到时的兜底：最近的 `[data-slot]` 锚点名。 */
  anchorSlot?: string | undefined
}

/** 最小 fiber 形状：只用到这三个字段。 */
export interface FiberLike {
  return?: FiberLike | null | undefined
  memoizedProps?: Record<string, unknown> | null | undefined
  /** 宿主节点（HostComponent fiber 上是真实 DOM 元素）。 */
  stateNode?: unknown
}

/** 最小 StoredEntry 形状。 */
interface EntryLike {
  component?: unknown
  registrant?: unknown
  options?: { key?: unknown; id?: unknown } | undefined
}

/** entry → 明文包名的查询函数（由 probe 提供；测试里给假的）。 */
export type PkgLookup = (entry: object) => string | undefined

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function isEntry(value: unknown): value is EntryLike & object {
  return typeof value === 'object' && value !== null && 'component' in value
}

/** 这个宿主节点是不是一个 slot 出口锚点。鸭子类型判断，测试里可以拿假对象喂。 */
function anchorOf(node: unknown): Element | undefined {
  if (typeof node !== 'object' || node === null) return undefined
  const el = node as Element
  return typeof el.hasAttribute === 'function' && el.hasAttribute('data-slot') ? el : undefined
}

/** 取挂在 DOM 节点上的 fiber。节点没被 React 管、或字段改名了都返回 undefined。 */
export function fiberOf(node: object): FiberLike | undefined {
  for (const key of Object.keys(node)) {
    if (key.startsWith(FIBER_KEY_PREFIX)) {
      const value = (node as Record<string, unknown>)[key]
      if (typeof value === 'object' && value !== null) return value as FiberLike
    }
  }
  return undefined
}

/**
 * 沿 fiber.return 收集归因链。
 *
 * 同一条 entry 会在好几层上重复出现（SessionEntry 与它外面的
 * StrictSessionEntry 拿的是同一个 entry 对象），所以按 entry 对象引用去重，
 * 保留最深那一次——那一层的 slotKey 才是它真正被注册进去的 slot。
 */
export function framesFromFiber(start: FiberLike | undefined, lookup?: PkgLookup): SlotFrame[] {
  const frames: SlotFrame[] = []
  const seen = new Set<object>()
  // 还没配上锚点的层：entry 的 fiber 总在它那个 `<div data-slot>` 的**里面**，
  // 所以往上走时先遇到 entry、后遇到锚点，中间用这个队列接上。
  let pending: SlotFrame[] = []
  let fiber = start
  for (let depth = 0; fiber !== undefined && fiber !== null && depth < MAX_DEPTH; depth++) {
    const props = fiber.memoizedProps
    if (props !== undefined && props !== null) {
      const entry: unknown = props['entry']
      if (isEntry(entry) && !seen.has(entry)) {
        seen.add(entry)
        const frame: SlotFrame = {
          slotKey: str(props['slotKey']),
          entryKey: str(entry.options?.key),
          entryId: str(entry.options?.id),
          registrant: str(entry.registrant),
          pkg: lookup?.(entry),
        }
        frames.push(frame)
        pending.push(frame)
      }
    }
    const anchor = anchorOf(fiber.stateNode)
    if (anchor !== undefined && pending.length > 0) {
      for (const frame of pending) frame.anchor = anchor
      pending = []
    }
    fiber = fiber.return ?? undefined
  }
  return frames
}

/**
 * 归因一个 DOM 元素。
 *
 * fiber 从元素自己身上取不到是常态（文本节点的父元素、伪元素命中等），所以
 * 沿 parentElement 往上试几层；实在拿不到就只给 `[data-slot]` 锚点名。
 */
export function attribute(el: Element, lookup?: PkgLookup): Attribution {
  let at: Element | null = el
  let fiber: FiberLike | undefined
  for (let hop = 0; at !== null && fiber === undefined && hop < 8; hop++) {
    fiber = fiberOf(at)
    if (fiber === undefined) at = at.parentElement
  }
  const anchor = el.closest('[data-slot]')
  const anchorSlot = anchor === null ? undefined : str(anchor.getAttribute('data-slot'))
  return { frames: framesFromFiber(fiber, lookup), anchorSlot }
}

/**
 * 归因链里第一个能给出明文包名的层。
 *
 * 为什么不是直接取第 0 层：最贴近鼠标的那条 entry 可能是我们记不到账的
 * （比我们早加载），而它外面那层往往记得到。跳转要的是「一个能落到插件轴上
 * 的包」，所以取最内层的**有名**归因，拿不到就返回 undefined，让上层照实
 * 显示未知，而不是拿压缩名去插件轴里瞎猜。
 */
export function ownerOf(frames: readonly SlotFrame[]): SlotFrame | undefined {
  return frames.find(f => f.pkg !== undefined)
}
