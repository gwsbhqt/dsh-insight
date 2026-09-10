/**
 * 包名 → 插件轴那一条。归因给出的是包名，跳转要的是 entry id，中间靠 host 插件树
 * 的 name 字段接上。同一个包挂了两次时优先挑活着的那条——跳到一条已经结束的
 * entry 上，右栏讲的是历史。
 */
import { expect, it } from 'vitest'
import { buildPkgIndex } from '../src/client/inspector/pkgIndex.ts'
import type { PluginNode } from '../src/shared/types.ts'

function node(id: string, name: string, state: PluginNode['state'], children: PluginNode[] = []): PluginNode {
  return { id, shortId: id.split(':').pop() ?? id, name, group: false, disabled: false, state, children }
}

it('按包名查到 entry id，嵌套层也能查到', () => {
  const index = buildPkgIndex([
    node('a', '@deepseek-ai/dsh-client-ui-sidebar', 'active'),
    node('group', '', 'active', [node('group:b', '@gwsbhqt/dsh-insight', 'active')]),
  ])
  expect(index.idOf('@deepseek-ai/dsh-client-ui-sidebar')).toBe('a')
  expect(index.idOf('@gwsbhqt/dsh-insight')).toBe('group:b')
})

it('树里没有就返回 undefined（上层据此判定不可跳）', () => {
  const index = buildPkgIndex([node('a', '@deepseek-ai/dsh-client-ui-sidebar', 'active')])
  expect(index.idOf('@someone/not-installed')).toBeUndefined()
  expect(index.idOf(undefined)).toBeUndefined()
})

it('同包多条时挑活着的那条', () => {
  const index = buildPkgIndex([
    node('dead', '@x/dup', 'disposed'),
    node('alive', '@x/dup', 'active'),
  ])
  expect(index.idOf('@x/dup')).toBe('alive')
  // 顺序反过来结论不变
  expect(buildPkgIndex([node('alive', '@x/dup', 'active'), node('dead', '@x/dup', 'failed')]).idOf('@x/dup')).toBe('alive')
})

it('全是坏的也给一条（能跳过去看它为什么坏，比不能跳好）', () => {
  expect(buildPkgIndex([node('bad', '@x/dup', 'failed')]).idOf('@x/dup')).toBe('bad')
})

it('树还没到（undefined）时一律不可跳，不抛', () => {
  expect(buildPkgIndex(undefined).idOf('@x/y')).toBeUndefined()
})

it('无名节点（容器/分组）不进索引', () => {
  const index = buildPkgIndex([node('g', '', 'active')])
  expect(index.idOf('')).toBeUndefined()
})
