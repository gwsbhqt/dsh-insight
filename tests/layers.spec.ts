/**
 * 重放语义对账：逐层 applyEntryPatches 的终态必须等于 composeEntries 一把梭——
 * 这是"溯源可信"的地基。分层语义与启动同一份实现（@deepseek-ai/dsh-app-boot +
 * @deepseek-ai/cordis-plugin-include），对账测试盯的是我们重放的正确性。
 */
import { composeEntries } from '@deepseek-ai/dsh-app-boot'
import { expect, it } from 'vitest'
import { replayLayers, type PatchLayer } from '../src/host/layers.ts'

const LAYERS: PatchLayer[] = [
  {
    kind: 'bundle', label: '@deepseek-ai/dsh-base',
    patches: [{ insert: [
      { id: 'settings', name: '@deepseek-ai/dsh-settings-file' },
      { id: 'hmr', name: '@deepseek-ai/dsh-hmr' },
      { id: 'web', name: '@deepseek-ai/dsh-web', config: { port: 3080 } },
    ] }],
  },
  {
    kind: 'bundle', label: '@deepseek-ai/dsh-web-app',
    patches: [
      { id: 'hmr', disabled: true },
      { id: 'web', config: { port: 3081 } },
    ],
  },
  {
    kind: 'profile', label: 'profile',
    patches: [{ insert: [{ id: 'dsh-insight', name: 'dsh-insight' }] }],
  },
]

it('逐层重放终态 === composeEntries 直接合成', () => {
  const { final } = replayLayers(LAYERS)
  expect(final).toEqual(composeEntries(LAYERS.map(l => l.patches)))
})

it('每层命中标注正确', () => {
  const { hits } = replayLayers(LAYERS)
  const ids = (i: number) => (hits[i] ?? []).map(h => h.id)
  expect(ids(0).sort()).toEqual(['hmr', 'settings', 'web'])
  expect(ids(1).sort()).toEqual(['hmr', 'web'])
  expect(ids(2)).toEqual(['dsh-insight'])
  // 命中带动作分类：web 在第二层是 update（覆盖第一层的 port）
  expect(hits[1]?.find(h => h.id === 'web')?.kind).toBe('update')
  expect(hits[1]?.find(h => h.id === 'hmr')?.kind).toBe('disable')
})

it('禁用在重放终态中可见', () => {
  const { final } = replayLayers(LAYERS)
  expect(final.find(e => e.id === 'hmr')?.disabled).toBe(true)
  expect(final.find(e => e.id === 'web')?.config).toEqual({ port: 3081 })
})

it('溯源事件流：insert / update / disable 分类正确且按层序排列', () => {
  const { events } = replayLayers(LAYERS)
  expect(events['settings']).toEqual([{ layer: '@deepseek-ai/dsh-base', kind: 'insert' }])
  expect(events['hmr']).toEqual([
    { layer: '@deepseek-ai/dsh-base', kind: 'insert' },
    { layer: '@deepseek-ai/dsh-web-app', kind: 'disable' },
  ])
  expect(events['web']).toEqual([
    { layer: '@deepseek-ai/dsh-base', kind: 'insert' },
    { layer: '@deepseek-ai/dsh-web-app', kind: 'update' },
  ])
  expect(events['dsh-insight']).toEqual([{ layer: 'profile', kind: 'insert' }])
})

it('溯源事件流：被后续层重新启用记 enable', () => {
  const layers: PatchLayer[] = [
    { kind: 'bundle', label: 'b', patches: [{ insert: [{ id: 'a', name: 'pkg-a', disabled: true }] }] },
    { kind: 'profile', label: 'profile', patches: [{ id: 'a', disabled: false }] },
  ]
  const { events } = replayLayers(layers)
  expect(events['a']).toEqual([
    { layer: 'b', kind: 'insert' },
    { layer: 'profile', kind: 'enable' },
  ])
})

it('表达式 disabled 被后层钉成 true 时算「禁用」，不是「覆盖」', () => {
  // dsh-base 里 tool-bash 写的是 disabled: !!js …，web-app 层把它钉成 true。
  // 旧实现 Boolean({__jsExpr}) 恒为 true → true→true → 误判成 update，「被关掉」这件事就丢了。
  const layers: PatchLayer[] = [
    { kind: 'bundle', label: 'base', patches: [{ insert: [
      { id: 'tool-bash', name: 'pkg', disabled: { __jsExpr: "process.platform === 'win32'" } as never },
      { id: 'tool-jobs', name: 'pkg2' },
    ] }] },
    { kind: 'bundle', label: 'web-app', patches: [{ id: 'tool-bash', disabled: true }, { id: 'tool-jobs', disabled: true }] },
  ]
  const { hits } = replayLayers(layers)
  const second = new Map(hits[1]!.map(h => [h.id, h.kind]))
  expect(second.get('tool-bash')).toBe('disable')   // 表达式 → 显式 true 也是一次关停
  expect(second.get('tool-jobs')).toBe('disable')   // 原来就没有 disabled，行为不变
})
