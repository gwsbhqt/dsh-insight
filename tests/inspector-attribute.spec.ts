// @vitest-environment jsdom
/**
 * 归因链：去重、方向、缺字段时的诚实降级，以及 fiber 读不到时的 DOM 兜底。
 *
 * 假 fiber 的形状照真实运行时抄（在跑着的 dsh web 上实测过一条 26 层的链）：
 * 一条 entry 会在 SessionEntry 与它外面的 StrictSessionEntry 上重复出现，
 * 拿的是同一个 entry 对象——去重必须按对象引用，不能按 slot 名。
 */
import { expect, it } from 'vitest'
import { attribute, fiberOf, framesFromFiber, ownerOf, type FiberLike } from '../src/client/inspector/attribute.ts'

interface FakeEntry {
  component: () => null
  registrant?: string
  options?: { key?: string; id?: string }
}

function entry(registrant: string | undefined, options?: { key?: string; id?: string }): FakeEntry {
  const e: FakeEntry = { component: () => null }
  if (registrant !== undefined) e.registrant = registrant
  if (options !== undefined) e.options = options
  return e
}

/** 由内向外拼一条链：chain[0] 是最深那层。 */
function chainOf(layers: { entry?: FakeEntry; slotKey?: string }[]): FiberLike {
  let parent: FiberLike | undefined
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]!
    const props: Record<string, unknown> = {}
    if (layer.entry !== undefined) props['entry'] = layer.entry
    if (layer.slotKey !== undefined) props['slotKey'] = layer.slotKey
    parent = { memoizedProps: props, return: parent ?? null }
  }
  return parent!
}

it('一条 entry 在多层重复出现时只算一次，且保留最深那层的 slot 名', () => {
  const inner = entry('read-image-toolview', { key: 'read_image' })
  const outer = entry('Z8', { key: 'tool-call' })
  const frames = framesFromFiber(chainOf([
    { entry: inner, slotKey: 'tool.call.toolview' },
    { slotKey: 'tool.call.toolview' }, // SlotErrorBoundary：有 slotKey 没 entry
    { entry: inner, slotKey: 'tool.call.toolview' }, // StrictSessionEntry：同一个 entry
    { entry: outer, slotKey: 'conversation.chat.node' },
  ]))
  expect(frames).toHaveLength(2)
  expect(frames[0]).toMatchObject({ slotKey: 'tool.call.toolview', entryKey: 'read_image', registrant: 'read-image-toolview' })
  expect(frames[1]).toMatchObject({ slotKey: 'conversation.chat.node', entryKey: 'tool-call', registrant: 'Z8' })
})

it('方向是「当前 → 根」', () => {
  const frames = framesFromFiber(chainOf([
    { entry: entry('a'), slotKey: 'tool.call.toolview' },
    { entry: entry('b'), slotKey: 'main' },
    { entry: entry('c'), slotKey: 'root' },
  ]))
  expect(frames.map(f => f.slotKey)).toEqual(['tool.call.toolview', 'main', 'root'])
})

it('包名由 lookup 提供；查不到就是 undefined，不拿 registrant 顶替', () => {
  const known = entry('Z8', { id: 'chat' })
  const unknown = entry('Q1')
  const frames = framesFromFiber(
    chainOf([{ entry: unknown, slotKey: 'a' }, { entry: known, slotKey: 'b' }]),
    e => (e === known ? '@deepseek-ai/dsh-client-ui-conversation' : undefined),
  )
  expect(frames[0]?.pkg).toBeUndefined()
  expect(frames[1]?.pkg).toBe('@deepseek-ai/dsh-client-ui-conversation')
  // 跳转要的是能落到插件轴上的包：取最内层「有名」的那一层
  expect(ownerOf(frames)).toBe(frames[1])
  expect(ownerOf(framesFromFiber(chainOf([{ entry: unknown, slotKey: 'a' }])))).toBeUndefined()
})

it('自环链不会转死', () => {
  const self: FiberLike = { memoizedProps: { entry: entry('x'), slotKey: 's' } }
  self.return = self
  expect(framesFromFiber(self)).toHaveLength(1)
})

it('缺 slotKey 只是那一层没名字，不影响其余层', () => {
  const frames = framesFromFiber(chainOf([{ entry: entry('x') }, { entry: entry('y'), slotKey: 'root' }]))
  expect(frames[0]?.slotKey).toBeUndefined()
  expect(frames[1]?.slotKey).toBe('root')
})

it('fiber 读不到时退回最近的 [data-slot] 锚点', () => {
  document.body.innerHTML = '<div data-slot="sidebar.workspaces"><button><span>x</span></button></div>'
  const span = document.querySelector('span')!
  const result = attribute(span)
  expect(result.frames).toEqual([])
  expect(result.anchorSlot).toBe('sidebar.workspaces')
})

it('元素本身没挂 fiber 时往上找几层父元素', () => {
  document.body.innerHTML = '<div data-slot="main"><i><b>x</b></i></div>'
  const host = document.querySelector('i')!
  const target = document.querySelector('b')!
  ;(host as unknown as Record<string, unknown>)['__reactFiber$abc'] = chainOf([{ entry: entry('Z8'), slotKey: 'main' }])
  expect(fiberOf(host)).toBeDefined()
  const result = attribute(target)
  expect(result.frames.map(f => f.slotKey)).toEqual(['main'])
  expect(result.anchorSlot).toBe('main')
})
