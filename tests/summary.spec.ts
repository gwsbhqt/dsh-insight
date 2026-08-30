/** 设置页摘要：结论必须来自数据，不能让人自己从列表里数。 */
import { expect, it } from 'vitest'
import { buildSummary } from '../src/shared/summary.ts'
import type { LayerView, PluginGraphNode, PluginNode, SettingsView } from '../src/shared/types.ts'

const plugin = (id: string, p: Partial<PluginNode> = {}): PluginNode => ({
  id, shortId: id, name: `pkg-${id}`, group: false, disabled: false, state: 'active', children: [], ...p,
})
const gnode = (id: string, requires: { service: string; providers: string[]; builtin?: boolean }[] = []): PluginGraphNode => ({
  id, shortId: id, name: `pkg-${id}`, state: 'active', provides: [], requires,
})
const layer = (label: string, readonly = true): LayerView => ({ kind: 'bundle', label, hits: [], readonly })
const ns = (name: string, user?: unknown): SettingsView =>
  ({ ns: name, value: null, applies: 'live', secrets: [], ...(user === undefined ? {} : { user }) })

it('健康的 profile：0 需要注意', () => {
  const s = buildSummary(
    [plugin('a', { origin: 'base' }), plugin('b', { origin: 'base', state: 'disabled', disabled: true })],
    [gnode('a'), gnode('b')],
    [ns('a')],
    [layer('base'), layer('profile', false)],
  )
  expect(s).toMatchObject({ plugins: 2, active: 1, disabled: 1, attention: 0, userOverrides: 0, layers: 2, lastLayer: 'profile', lastLayerWritable: true })
})

it('内置服务不算缺提供者——否则 13 处内置依赖会变成 13 个假警报', () => {
  const s = buildSummary(
    [plugin('a', { origin: 'base' })],
    [gnode('a', [{ service: 'loader', providers: [], builtin: true }])],
    [], [layer('base')],
  )
  expect(s.attention).toBe(0)
})

it('真缺提供者、加载失败、等待依赖都点名', () => {
  const s = buildSummary(
    [plugin('a'), plugin('b', { state: 'failed' }), plugin('c', { state: 'pending' })],
    [gnode('a', [{ service: 'ghost', providers: [], builtin: false }]), gnode('b'), gnode('c')],
    [], [layer('base')],
  )
  expect(s.attention).toBe(3)
  expect(s.attentionIds).toEqual(['a', 'b', 'c'])
})

it('group 容器不计入插件数；运行时注册取自对账结论，不是「没解析出来源层」', () => {
  const s = buildSummary(
    [plugin('include', { group: true, children: [plugin('a', { origin: 'base' }), plugin('dyn')] })],
    [gnode('a'), gnode('dyn')],
    [ns('a', { x: 1 })],
    [layer('base')],
    { entries: [], drift: true, driftReport: { missingInRuntime: [], extraInRuntime: ['dyn'], disabledMismatch: [], ambiguous: [], unevaluated: [] } },
  )
  expect(s.plugins).toBe(2)
  expect(s.runtimeOnly).toBe(1)
  expect(s.userOverrides).toBe(1)
  expect(s.userOverrideIds).toEqual(['a'])
})

it('撞名导致来源层归因放弃时，不当成运行时注册', () => {
  const s = buildSummary(
    [plugin('a'), plugin('b')],  // 两个都没有 origin
    [gnode('a'), gnode('b')],
    [], [layer('base')],
    { entries: [], drift: false, driftReport: { missingInRuntime: [], extraInRuntime: [], disabledMismatch: [], ambiguous: ['a', 'b'], unevaluated: [] } },
  )
  expect(s.runtimeOnly).toBe(0)
})

it('host 不带 builtin 标记时不报「缺提供者」——宁可少报也不误报', () => {
  // 老 host（改完没重启）的 graph：requires 上没有 builtin 字段
  const legacy: PluginGraphNode = {
    id: 'a', shortId: 'a', name: 'pkg-a', state: 'active', provides: [],
    requires: [{ service: 'loader', providers: [] }],
  }
  const s = buildSummary([plugin('a')], [legacy], [], [layer('base')])
  expect(s.attention).toBe(0)

  // 新 host 恒发 builtin：false 才是「真缺提供者」
  const modern: PluginGraphNode = { ...legacy, requires: [{ service: 'ghost', providers: [], builtin: false }] }
  expect(buildSummary([plugin('a')], [modern], [], [layer('base')]).attention).toBe(1)
})

it('状态类信号不受 builtin 能力位影响', () => {
  const legacy: PluginGraphNode = { id: 'a', shortId: 'a', name: '', state: 'failed', provides: [], requires: [] }
  expect(buildSummary([plugin('a', { state: 'failed' })], [legacy], [], [layer('base')]).attention).toBe(1)
})
