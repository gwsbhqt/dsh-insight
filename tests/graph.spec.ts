/** 依赖图采集（host）与依赖关系索引 / 影响面（shared，纯计算）。 */
import { expect, it } from 'vitest'
import { collectGraph } from '../src/host/graph.ts'
import { buildGraphIndex, impactHops, missingProviders } from '../src/shared/graph.ts'
import type { PluginGraphNode } from '../src/shared/types.ts'

function node(id: string, provides: string[] = [], requires: [string, string[]][] = [], builtin: string[] = []): PluginGraphNode {
  return {
    id,
    shortId: id,
    name: `pkg-${id}`,
    state: 'active',
    provides: provides.map(service => ({ service, consumers: [] })),
    requires: requires.map(([service, providers]) => ({
      service,
      providers,
      ...(builtin.includes(service) ? { builtin: true } : {}),
    })),
  }
}

function entry(id: string, provides: string[] = [], requires: string[] = []) {
  const fiber = { state: 2, inject: Object.fromEntries(requires.map(name => [name, {}])), store: {} as Record<string, { fiber?: unknown }> }
  const value = { id, disabled: false, options: { name: `pkg-${id}` }, fiber }
  fiber.store = Object.fromEntries(provides.map(name => [name, { fiber }]))
  return value
}

it('唯一 provider 建立确定候选关系', () => {
  const provider = entry('provider', ['svc'])
  const consumer = entry('consumer', [], ['svc'])
  const ctx = { loader: { *entries() { yield provider; yield consumer } } }
  const graph = collectGraph(ctx)
  // builtin 恒发：有提供者时必然是 false
  expect(graph.find(node => node.id === 'consumer')?.requires).toEqual([{ service: 'svc', providers: ['provider'], builtin: false }])
})

it('同名服务保留全部候选 provider，不按遍历顺序覆盖', () => {
  const first = entry('first', ['svc'])
  const second = entry('second', ['svc'])
  const consumer = entry('consumer', [], ['svc'])
  const ctx = { loader: { *entries() { yield first; yield second; yield consumer } } }
  const graph = collectGraph(ctx)
  expect(graph.find(node => node.id === 'consumer')?.requires).toEqual([{ service: 'svc', providers: ['first', 'second'], builtin: false }])
})

it('唯一候选才连边，多候选不伪造关系', () => {
  const index = buildGraphIndex([
    node('a', ['svc']),
    node('b', ['svc']),
    node('c', [], [['svc', ['a', 'b']]]),
    node('d', [], [['svc', ['a']]]),
  ])
  expect([...index.dependsOn.get('c')!]).toEqual([])       // 两个候选 → 不连
  expect([...index.dependsOn.get('d')!]).toEqual(['a'])
  expect([...index.dependedBy.get('a')!]).toEqual(['d'])
  // 两个提供者 → 降级为候选列表，不擅自选一个
  expect(index.serviceOf.get('svc')?.provider).toBeUndefined()
  expect(index.serviceOf.get('svc')?.candidates).toEqual(['a', 'b'])
})

it('服务表按被依赖数降序——枢纽自己浮到最前', () => {
  const index = buildGraphIndex([
    node('hub', ['tools']),
    node('rare', ['odd']),
    ...['x', 'y', 'z'].map(id => node(id, [], [['tools', ['hub']]])),
    node('w', [], [['odd', ['rare']]]),
  ])
  expect(index.services.map(s => [s.service, s.consumers.length])).toEqual([
    ['tools', 3],
    ['odd', 1],
  ])
})

it('影响面按跳数分组，且不把自己算进去', () => {
  const index = buildGraphIndex([
    node('base', ['b']),
    node('mid', ['m'], [['b', ['base']]]),
    node('leaf1', [], [['m', ['mid']]]),
    node('leaf2', [], [['m', ['mid']]]),
  ])
  expect(impactHops(index, 'base')).toEqual([['mid'], ['leaf1', 'leaf2']])
  expect(impactHops(index, 'leaf1')).toEqual([])
})

it('内置服务不算「缺提供者」；host 不具备该能力时一律不报', () => {
  const withBuiltin = node('x', [], [['loader', []]], ['loader'])
  const withReal = node('y', [], [['ghost', []]])
  expect(missingProviders(withBuiltin)).toEqual([])
  expect(missingProviders(withReal)).toEqual(['ghost'])
  expect(missingProviders(withReal, false)).toEqual([])   // 老 host：分不清就不报
  expect(buildGraphIndex([withBuiltin]).knowsBuiltin).toBe(true)
  expect(buildGraphIndex([{ ...withReal, requires: [{ service: 'ghost', providers: [] }] }]).knowsBuiltin).toBe(false)
})

it('collectGraph 把「运行时取得到但没插件提供」标成内置', () => {
  const entries = [
    { id: 'a', disabled: false, options: { name: 'pkg-a', inject: ['loader', 'ghost'] } },
  ]
  const ctx = {
    loader: { entries: () => entries },
    get: (name: string) => (name === 'loader' ? {} : undefined),
  }
  const [first] = collectGraph(ctx)
  const byService = new Map(first!.requires.map(r => [r.service, r]))
  expect(byService.get('loader')?.builtin).toBe(true)  // 运行时取得到 → 内置
  expect(byService.get('ghost')?.builtin).toBe(false)  // 运行时也没有 → 真缺（字段恒在，值为 false）
})
