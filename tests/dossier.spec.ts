/** buildDossiers 三源 join：骨架以运行时为准、配置作注解、drift 行级标记。 */
import { describe, expect, it } from 'vitest'
import { buildDossiers, walkDossiers } from '../src/shared/dossier.ts'
import type { SettingsView, FinalConfig, PluginGraphNode, PluginNode } from '../src/shared/types.ts'

function treeNode(partial: Partial<PluginNode> & { id: string }): PluginNode {
  return { shortId: partial.id, name: '', group: false, disabled: false, state: 'active', children: [], ...partial }
}

function graphNode(id: string, partial: Partial<PluginGraphNode> = {}): PluginGraphNode {
  return { id, shortId: id, name: '', state: 'active', provides: [], requires: [], ...partial }
}

function finalOf(entries: FinalConfig['entries'], report: Partial<FinalConfig['driftReport']> = {}): FinalConfig {
  const driftReport = { missingInRuntime: [], extraInRuntime: [], disabledMismatch: [], ambiguous: [], unevaluated: [], ...report }
  return { entries, drift: true, driftReport }
}

function settingsNs(ns: string, partial: Partial<SettingsView> = {}): SettingsView {
  return { ns, value: null, applies: 'live', secrets: [], ...partial }
}

describe('buildDossiers', () => {
  it('三源齐全的节点：意图/关系挂到运行时骨架上', () => {
    const tree = [treeNode({ id: 'llm', path: '/pkg/llm', origin: 'base' })]
    const graph = [graphNode('llm', { provides: [{ service: 'llm', consumers: ['agent'] }] })]
    const final = finalOf([{ id: 'llm', name: 'dsh-llm', disabled: false, config: { timeout: 1 }, events: [{ layer: 'base', kind: 'insert' }] }])
    const d = buildDossiers(tree, graph, final)[0]!
    expect(d.state).toBe('active')
    expect(d.path).toBe('/pkg/llm')
    expect(d.provides[0]?.consumers).toEqual(['agent'])
    expect(d.intent?.config).toEqual({ timeout: 1 })
    expect(d.intent?.events?.[0]?.kind).toBe('insert')
    expect(d.drift).toBeUndefined()
  })

  it('配置有、运行时没有 → 顶层幽灵行（missing），只有意图层', () => {
    const final = finalOf(
      [{ id: 'tool-goal', name: 'dsh-tool-goal', disabled: false, config: {}, events: [{ layer: 'base', kind: 'insert' }, { layer: 'profile', kind: 'disable' }] }],
      { missingInRuntime: ['tool-goal'] },
    )
    const ghost = buildDossiers([], [], final)[0]!
    expect(ghost.drift).toBe('missing')
    expect(ghost.state).toBeUndefined()
    expect(ghost.intent?.events).toHaveLength(2)
    expect(ghost.provides).toEqual([])
  })

  it('运行时有、配置没有 → 运行时孤儿（extra），无意图层', () => {
    const tree = [treeNode({ id: 'telemetry' })]
    const final = finalOf([], { extraInRuntime: ['telemetry'] })
    const d = buildDossiers(tree, [], final)[0]!
    expect(d.drift).toBe('extra')
    expect(d.intent).toBeUndefined()
  })

  it('disabled 声明与运行时有效值不一致 → mismatch 标记（意图照常挂载）', () => {
    const tree = [treeNode({ id: 'pwsh', disabled: true, state: 'disabled' })]
    const final = finalOf([{ id: 'pwsh', name: '', disabled: false, config: {} }], { disabledMismatch: ['pwsh'] })
    const d = buildDossiers(tree, [], final)[0]!
    expect(d.drift).toBe('mismatch')
    expect(d.intent?.disabled).toBe(false)
    expect(d.disabled).toBe(true)
  })

  it('短 id 撞名（两个 realm 同名）→ 不挂载意图，不伪造归因', () => {
    const tree = [
      treeNode({ id: 'a', children: [treeNode({ id: 'a:hmr', shortId: 'hmr' })] }),
      treeNode({ id: 'b', children: [treeNode({ id: 'b:hmr', shortId: 'hmr' })] }),
    ]
    const final = finalOf([{ id: 'hmr', name: '', disabled: false, config: { x: 1 } }])
    const dossiers = buildDossiers(tree, [], final)
    const [a, b] = dossiers
    expect(a?.children[0]?.intent).toBeUndefined()
    expect(b?.children[0]?.intent).toBeUndefined()
  })

  it('嵌套层级保留，graph 按完整 id 对齐到子节点', () => {
    const tree = [treeNode({ id: 'include', group: true, children: [treeNode({ id: 'include:hmr', shortId: 'hmr' })] })]
    const graph = [graphNode('include'), graphNode('include:hmr', { requires: [{ service: 'timer', providers: ['timer'] }] })]
    const final = finalOf([{ id: 'hmr', name: '', disabled: false, config: null }])
    const [inc] = buildDossiers(tree, graph, final)
    const hmr = inc?.children[0]
    expect(hmr?.requires[0]?.service).toBe('timer')
    expect(hmr?.intent?.config).toBeNull()
  })

  it('设置命名空间按 ns==短id 挂进档案；user 原文保留', () => {
    const tree = [treeNode({ id: 'locale' })]
    const settings = [settingsNs('locale', { user: { lang: 'zh' } })]
    const [d] = buildDossiers(tree, [], finalOf([]), settings)
    expect(d?.settings?.ns).toBe('locale')
    expect(d?.settings?.user).toEqual({ lang: 'zh' })
  })

  it('无对应 entry 的设置命名空间降级为顶层独立行', () => {
    const tree = [treeNode({ id: 'locale' })]
    const settings = [settingsNs('shell')]
    const dossiers = buildDossiers(tree, [], finalOf([]), settings)
    const orphan = dossiers.find(d => d.id === 'settings:shell')
    expect(orphan?.settings?.ns).toBe('shell')
    expect(orphan?.shortId).toBe('shell')
    expect(dossiers.find(d => d.id === 'locale')?.settings).toBeUndefined()
  })

  it('短 id 撞名时设置不挂载（不伪造归属），命名空间降级为独立行', () => {
    const tree = [treeNode({ id: 'a:dup', shortId: 'dup' }), treeNode({ id: 'b:dup', shortId: 'dup' })]
    const dossiers = buildDossiers(tree, [], finalOf([]), [settingsNs('dup')])
    expect(dossiers.filter(d => d.id === 'a:dup' || d.id === 'b:dup').every(d => d.settings === undefined)).toBe(true)
    expect(dossiers.some(d => d.id === 'settings:dup')).toBe(true)
  })

  it('walkDossiers 拍平整棵树（含幽灵行）', () => {
    const tree = [treeNode({ id: 'g', children: [treeNode({ id: 'g:c', shortId: 'c' })] })]
    const final = finalOf([{ id: 'ghost', name: '', disabled: false, config: null }], { missingInRuntime: ['ghost'] })
    const ids = [...walkDossiers(buildDossiers(tree, [], final))].map(d => d.id)
    expect(ids).toEqual(['g', 'g:c', 'ghost'])
  })
})
