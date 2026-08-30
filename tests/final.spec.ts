/** 终态组装与 drift 对账。 */
import { expect, it } from 'vitest'
import { toFinalConfig } from '../src/host/final.ts'
import { replayLayers, type PatchLayer } from '../src/host/layers.ts'

const LAYERS: PatchLayer[] = [
  { kind: 'bundle', label: 'b', patches: [{ insert: [
    { id: 'a', name: 'pkg-a', config: { x: 1 } },
    { id: 'g', name: 'pkg-g', group: true },
  ] }] },
  { kind: 'profile', label: 'profile', patches: [{ id: 'a', disabled: true }] },
]

it('终态树含重放结果，disabled 生效', () => {
  const { final } = replayLayers(LAYERS)
  const view = toFinalConfig(final, [{ id: 'a', disabled: true }, { id: 'g', disabled: false }])
  const a = view.entries.find(e => e.id === 'a')
  expect(a?.disabled).toBe(true)
  expect(a?.config).toEqual({ x: 1 })
  expect(view.drift).toBe(false)
  expect(view.driftReport).toEqual({ missingInRuntime: [], extraInRuntime: [], disabledMismatch: [], ambiguous: [], unevaluated: [] })
})

it('实况里缺少重放 entry 时 drift=true', () => {
  const { final } = replayLayers(LAYERS)
  expect(toFinalConfig(final, [{ id: 'a', disabled: true }]).drift).toBe(true)
})

it('结构化报告缺失、额外和 disabled 差异', () => {
  const { final } = replayLayers(LAYERS)
  const view = toFinalConfig(final, [
    { id: 'a', disabled: false },
    { id: 'extra', disabled: false },
  ])
  expect(view.drift).toBe(true)
  expect(view.driftReport).toEqual({
    missingInRuntime: ['g'],
    extraInRuntime: ['extra'],
    disabledMismatch: ['a'],
    ambiguous: [],
    unevaluated: [],
  })
})

it('撞名短 id 不参与 disabled 对账——宿主面禁用、预设 realm 在跑不是 drift', () => {
  const { final } = replayLayers(LAYERS)
  // 运行时两个 a：一个被禁（宿主面），一个在跑（另一个 realm）。归一化后撞名。
  const view = toFinalConfig(final, [
    { id: 'a', disabled: true },
    { id: 'a', disabled: false },
    { id: 'g', disabled: false },
  ])
  expect(view.driftReport.disabledMismatch).toEqual([])
  expect(view.driftReport.ambiguous).toEqual(['a'])
  expect(view.drift).toBe(false)
})

it('disabled 是 !!js 表达式时不声称禁用，也不参与对账', () => {
  const layers: PatchLayer[] = [{ kind: 'bundle', label: 'b', patches: [{ insert: [
    { id: 'x', name: 'pkg-x', disabled: { __jsExpr: "process.platform === 'win32'" } as never },
  ] }] }]
  const { final } = replayLayers(layers)
  const view = toFinalConfig(final, [{ id: 'x', disabled: false }])
  const x = view.entries.find(e => e.id === 'x')
  expect(x?.disabled).toBe(false)                                  // 未求值 → 静态侧不声称禁用
  expect(x?.disabledExpr).toBe("process.platform === 'win32'")
  expect(view.driftReport.disabledMismatch).toEqual([])
  expect(view.driftReport.unevaluated).toEqual(['x'])
  expect(view.drift).toBe(false)
})
