/**
 * 摘要：设置页那 556px 要显示的全部内容。
 *
 * 存在的理由是"打开设置第一眼就该知道系统健不健康"——这恰好是旧面板完全没有的东西。
 * 它必须能独立于工作台计算，因为设置页不该为了显示六个数字去拉 174 个节点的全量树。
 */
import { buildGraphIndex, missingProviders } from './graph.ts'
import type { FinalConfig, InsightSummary, LayerView, PluginGraphNode, PluginNode, SettingsView } from './types.ts'

function* walk(nodes: PluginNode[]): Generator<PluginNode> {
  for (const node of nodes) {
    yield node
    yield* walk(node.children)
  }
}

/** 需要人处理的：加载失败、卡在等待、依赖的服务没有任何插件提供（内置不算）。 */
function attentionOf(nodes: PluginNode[], graph: PluginGraphNode[], knowsBuiltin: boolean): string[] {
  const graphById = new Map(graph.map(g => [g.id, g]))
  const ids: string[] = []
  for (const node of nodes) {
    if (node.group) continue
    if (node.state === 'failed' || node.state === 'pending' || node.state === 'loading' || node.state === 'unknown') {
      ids.push(node.shortId)
      continue
    }
    const g = graphById.get(node.id)
    if (g !== undefined && missingProviders(g, knowsBuiltin).length > 0) ids.push(node.shortId)
  }
  return [...new Set(ids)].sort()
}

export function buildSummary(
  tree: PluginNode[],
  graph: PluginGraphNode[],
  settings: SettingsView[],
  layers: LayerView[],
  final?: FinalConfig,
): InsightSummary {
  const all = [...walk(tree)].filter(node => !node.group)
  const index = buildGraphIndex(graph)
  const attention = attentionOf([...walk(tree)], graph, index.knowsBuiltin)
  const overrides = settings.filter(s => s.user !== undefined).map(s => s.ns).sort()
  const extra = new Set(final?.driftReport.extraInRuntime ?? [])
  const last = layers[layers.length - 1]
  return {
    plugins: all.length,
    active: all.filter(n => n.state === 'active').length,
    disabled: all.filter(n => n.state === 'disabled').length,
    attention: attention.length,
    attentionIds: attention.slice(0, 8),
    userOverrides: overrides.length,
    userOverrideIds: overrides.slice(0, 8),
    // 运行时注册 = 重放里没有、运行时有（对账结论），不是「没解析出来源层」——
    // 后者只说明短 id 撞名导致归因放弃，把两者混为一谈会虚报几十条
    runtimeOnly: final === undefined
      ? 0
      : all.filter(n => extra.has(n.shortId)).length,
    services: index.services.length,
    layers: layers.length,
    lastLayer: last?.label ?? '',
    lastLayerWritable: last !== undefined && !last.readonly,
  }
}
