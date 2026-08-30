/**
 * 工具插件：把注册工具的插件 entry 归并成「一行一个工具插件」。
 *
 * 为什么是「工具插件」而不是「工具」——这个区别很重要，别在 UI 上含糊：
 * 用户真正想看的是工具名（LLM 看到的 `Bash`、`Read`），一个插件可能注册好几个。
 * 但那份数据在静止状态下**不存在**：实测 `tools.schemas()` 返回 0、
 * `layers.global.tools.data` 是 Map(0)、`layers.scoped` 也是 Map(0)。
 * 工具是 agent 跑起来、预设被 mount 成一个 scope 之后才 register 进去的，
 * 而且 ToolDefinition 不带 owner 字段——即便读到了工具名也反查不回注册它的插件。
 * 所以这里只做插件粒度，并在界面上明说这一层的边界，不假装是工具清单。
 *
 * 归并的价值在于消歧：同一个工具插件在运行时常有两份——宿主面一份（多半被
 * bundle 层禁用）、agent 预设 realm 里一份（活着）。按插件看是困惑的
 * （同名两行，一禁一开），按工具插件看才知道净结果到底能不能用。
 */
import { walkDossiers, type PluginDossier } from './dossier.ts'
import type { PluginNodeState } from './types.ts'

/** dsh 的硬约定：注册工具的插件 entry 一律以 tool- 开头。 */
const TOOL_ID = /^tool-/

/** 工具插件的一份运行时 entry。 */
export interface ToolEntry {
  /** 完整嵌套 id，如 include:agent-presets:tool-bash。 */
  id: string
  /** 所在容器的短名：宿主面为空串，预设 realm 为 agent-presets 等。 */
  realm: string
  state: PluginNodeState | undefined
  disabled: boolean
  origin?: string
}

export interface ToolPlugin {
  /** 短 id，如 tool-bash。 */
  id: string
  /** 模块说明符（取第一份非空的）。 */
  name: string
  /** 同名的全部 entry，按 realm 排序（宿主面在前）。 */
  entries: ToolEntry[]
  /** 任一份在跑 = agent 拿得到它注册的工具。 */
  enabled: boolean
  /** 各份状态不一致（典型：宿主面禁用、预设里启用）——最有信息量的一档。 */
  split: boolean
  path?: string
}

/** 完整 id 里去掉自己和最外层 include 之后的容器名，用来区分宿主面与预设 realm。 */
function realmOf(fullId: string, shortId: string): string {
  const parts = fullId.split(':').filter(p => p !== '' && p !== shortId)
  const inner = parts[parts.length - 1]
  return inner === undefined || inner === 'include' ? '' : inner
}

export function buildToolPlugins(dossiers: PluginDossier[]): ToolPlugin[] {
  const byShort = new Map<string, ToolPlugin>()
  for (const d of walkDossiers(dossiers)) {
    if (d.group || !TOOL_ID.test(d.shortId)) continue
    let tool = byShort.get(d.shortId)
    if (tool === undefined) {
      tool = { id: d.shortId, name: '', entries: [], enabled: false, split: false }
      byShort.set(d.shortId, tool)
    }
    if (tool.name === '' && d.name !== '') tool.name = d.name
    if (tool.path === undefined && d.path !== undefined) tool.path = d.path
    const entry: ToolEntry = {
      id: d.id,
      realm: realmOf(d.id, d.shortId),
      state: d.state,
      disabled: d.disabled,
    }
    if (d.origin !== undefined) entry.origin = d.origin
    tool.entries.push(entry)
  }

  const tools = [...byShort.values()]
  for (const tool of tools) {
    tool.entries.sort((a, b) => a.realm.localeCompare(b.realm))
    tool.enabled = tool.entries.some(e => e.state === 'active')
    tool.split = new Set(tool.entries.map(e => e.state === 'active')).size > 1
  }
  // 可用的排前面（要处理的是「本以为开着其实关了」这类），同档按名字
  return tools.sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.id.localeCompare(b.id))
}

export interface ToolCounts {
  total: number
  enabled: number
  disabled: number
  /** 两份状态不一致的条数。 */
  split: number
}

export function countTools(tools: ToolPlugin[]): ToolCounts {
  return {
    total: tools.length,
    enabled: tools.filter(t => t.enabled).length,
    disabled: tools.filter(t => !t.enabled).length,
    split: tools.filter(t => t.split).length,
  }
}
