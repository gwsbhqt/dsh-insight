/** 来源归因：运行时短 ID 唯一才返回重放来源。 */
import { expect, it } from 'vitest'
import { originResolver } from '../src/host/rpc.ts'
import type { PatchLayer } from '../src/host/layers.ts'

const layers: PatchLayer[] = [{
  kind: 'bundle',
  label: 'base',
  patches: [{ insert: [{ id: 'same', name: 'pkg-same' }, { id: 'unique', name: 'pkg-unique' }] }],
}]

it('唯一短 ID 可归因', () => {
  const resolve = originResolver(layers, ['group:unique'])
  expect(resolve('unique')).toBe('base')
})

it('跨 realm 同名短 ID 不做错误归因', () => {
  const resolve = originResolver(layers, ['left:same', 'right:same'])
  expect(resolve('same')).toBeUndefined()
})
