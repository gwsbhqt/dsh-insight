/**
 * 插件档案（dossier）：把四个现有数据源按"实体 = 插件 entry"join 成一个模型——
 *   实况层 ← plugins/tree（运行时骨架：状态/路径/来源/错误/层级）
 *   关系层 ← plugins/graph（服务提供/依赖，已解析到具体插件）
 *   意图层 ← config/final（重放终态：config 全文 + 跨层溯源事件流）
 *   设置层 ← settings/list（插件注册的设置命名空间：生效值/base/user/secret 位）
 * 骨架以运行时为准，配置作注解；drift 降解为行级标记：
 *   missing  = 配置有、运行时没有（幽灵行，挂顶层）
 *   extra    = 运行时有、配置没有（运行时动态注册）
 *   mismatch = 配置声明 disabled 与运行时有效 disabled 不一致
 * 纯函数、无 cordis 依赖，两端可用，host 测试可直接构造输入。
 */
import type {
  AttributionEvent,
  FinalConfig,
  FinalEntry,
  PluginGraphNode,
  PluginNode,
  PluginNodeState,
  ProvidedService,
  RequiredService,
  SettingsView,
} from './types.ts'

export type DossierDrift = 'missing' | 'extra' | 'mismatch'

/** 一个插件的完整档案：一行能回答"它是什么、怎么了、接线如何、配置怎么来的"。 */
export interface PluginDossier {
  /** 完整嵌套 id；幽灵行只有短 id（配置层不知嵌套位置）。 */
  id: string
  shortId: string
  /** 模块说明符（EntryOptions.name）。 */
  name: string
  group: boolean
  /** 运行时有效 disabled；幽灵行用配置声明值。 */
  disabled: boolean
  /** 运行时状态；幽灵行（missing）没有。 */
  state?: PluginNodeState
  rawState?: number
  error?: { message: string; stack?: string }
  origin?: string
  path?: string
  /** 关系层：解析到具体插件的提供/依赖（无接线为空数组，不省略）。 */
  provides: ProvidedService[]
  requires: RequiredService[]
  /** 意图层：重放终态 + 溯源事件流；运行时孤儿没有。 */
  intent?: { disabled: boolean; config: unknown; events?: AttributionEvent[] }
  /** 设置层：该插件注册的 settings 命名空间实况；没注册设置或 ns 撞名时没有。 */
  settings?: SettingsView
  /**
   * 这一行根本不是插件，只是一个挂不上插件的 settings 命名空间。
   * 成因：ns 与 loader entry 的短 id 不一样（`shell` 的设置归 `shell-env`），
   * 或者注册它的插件压根不在 host 的插件树里（客户端插件）。上游的
   * `settings.describe()` 不带注册者，所以只能如实标出来，不能猜。
   */
  settingsOnly?: true
  drift?: DossierDrift
  children: PluginDossier[]
}

/** 统计短 id 出现次数：短 id 在运行时/重放里都可能跨 realm 撞名，唯一时才允许按短 id 归并。 */
function shortIdCounts(ids: Iterable<string>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  return counts
}

function* walkTree(nodes: PluginNode[]): Generator<PluginNode> {
  for (const n of nodes) {
    yield n
    yield* walkTree(n.children)
  }
}

/**
 * 三源 join。意图挂载规则与 originResolver 同样谨慎：
 * 短 id 在运行时与重放两侧都唯一时才把 config/事件流挂到该节点，撞名则放弃（不伪造归因）。
 */
export function buildDossiers(tree: PluginNode[], graph: PluginGraphNode[], final: FinalConfig, settings: SettingsView[] = []): PluginDossier[] {
  const graphById = new Map(graph.map(g => [g.id, g]))
  const runtimeCounts = shortIdCounts([...walkTree(tree)].map(n => n.shortId))
  const finalCounts = shortIdCounts(final.entries.map(e => e.id))
  const finalByShort = new Map<string, FinalEntry>(final.entries.map(e => [e.id, e]))
  const extra = new Set(final.driftReport.extraInRuntime)
  const mismatch = new Set(final.driftReport.disabledMismatch)

  const convert = (node: PluginNode): PluginDossier => {
    const g = graphById.get(node.id)
    const dossier: PluginDossier = {
      id: node.id,
      shortId: node.shortId,
      name: node.name,
      group: node.group,
      disabled: node.disabled,
      state: node.state,
      provides: g?.provides ?? [],
      requires: g?.requires ?? [],
      children: node.children.map(convert),
    }
    if (node.rawState !== undefined) dossier.rawState = node.rawState
    if (node.error !== undefined) dossier.error = node.error
    if (node.origin !== undefined) dossier.origin = node.origin
    if (node.path !== undefined) dossier.path = node.path
    if (extra.has(node.shortId)) {
      dossier.drift = 'extra'
    } else {
      const entry = finalByShort.get(node.shortId)
      if (entry !== undefined && runtimeCounts.get(node.shortId) === 1 && finalCounts.get(node.shortId) === 1) {
        dossier.intent = { disabled: entry.disabled, config: entry.config }
        if (entry.events !== undefined && entry.events.length > 0) dossier.intent.events = entry.events
      }
      if (mismatch.has(node.shortId)) dossier.drift = 'mismatch'
    }
    return dossier
  }

  const dossiers = tree.map(convert)
  // 幽灵行：重放有、运行时没有。配置层只有短 id，挂顶层；提供/依赖无从解析（没跑起来）。
  for (const shortId of final.driftReport.missingInRuntime) {
    const entry = finalByShort.get(shortId)
    if (entry === undefined) continue
    const ghost: PluginDossier = {
      id: shortId,
      shortId,
      name: entry.name,
      group: false,
      disabled: entry.disabled,
      provides: [],
      requires: [],
      intent: { disabled: entry.disabled, config: entry.config },
      drift: 'missing',
      children: [],
    }
    if (entry.events !== undefined && entry.events.length > 0) ghost.intent!.events = entry.events
    dossiers.push(ghost)
  }
  // 设置层：ns == 短 id 且在 dossier 全集与 settings 两侧都唯一时才挂载，撞名/无对应 entry
  // 则降级为顶层独立行（不伪造归属，也不丢命名空间——例如核心模块注册的 shell）。
  const all = [...walkDossiers(dossiers)]
  const dossierCounts = shortIdCounts(all.map(d => d.shortId))
  const nsCounts = shortIdCounts(settings.map(s => s.ns))
  const byShort = new Map(all.map(d => [d.shortId, d]))
  for (const s of settings) {
    const target = byShort.get(s.ns)
    if (target !== undefined && dossierCounts.get(s.ns) === 1 && nsCounts.get(s.ns) === 1) {
      target.settings = s
    } else {
      // 找不到对应插件的设置命名空间：仍然要列出来（你改过的设置得看得见），
      // 但它不是插件——界面上必须说清楚，否则就是一行没有包名的「坏插件」。
      dossiers.push({
        id: `settings:${s.ns}`,
        shortId: s.ns,
        name: '',
        group: false,
        disabled: false,
        provides: [],
        requires: [],
        settings: s,
        settingsOnly: true,
        children: [],
      })
    }
  }
  return dossiers
}

/** 拍平 dossier 树（搜索/跳转用）。 */
export function* walkDossiers(nodes: PluginDossier[]): Generator<PluginDossier> {
  for (const n of nodes) {
    yield n
    yield* walkDossiers(n.children)
  }
}
