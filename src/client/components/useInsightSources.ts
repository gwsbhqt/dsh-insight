/**
 * 工作台的九个数据源，抽成一处。
 *
 * 为什么抽出来：工作台现在有两个入口——设置页的摘要卡，和 inspector 点界面
 * 之后直接开的那一份（它挂在 shell.overlay 里，够不着设置页那棵组件树）。
 * 两边都要同一套数据，各自抄一遍 useRpc 迟早写歪。
 *
 * `need` 为假时一个请求都不发（useRpc 自己就是这个语义），所以 inspector 的
 * 那份在没被点开之前是零开销。两个入口同时开着会各拉一份——都是只读端点，
 * 换成共享缓存要引一层跨组件状态，不值当。
 */
import { useMemo } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConfigFileInfo, FinalConfig, LayerView, ModelInventory, PluginGraphNode, PluginNode, PresetInventory, SettingsView, ToolInventory } from '../../shared/types.ts'
import { useRpc } from './useRpc.ts'

export interface InsightSources {
  tree: PluginNode[] | undefined
  graph: PluginGraphNode[] | undefined
  final: FinalConfig | undefined
  settings: SettingsView[] | undefined
  layers: LayerView[] | undefined
  files: ConfigFileInfo[] | undefined
  inventory: ToolInventory | undefined
  models: ModelInventory | undefined
  /** host 还不认识 models/list（比前端旧）。 */
  modelsStale: boolean
  presets: PresetInventory | undefined
  /** host 还不认识 presets/list（比前端旧）。 */
  presetsStale: boolean
  loading: boolean
  error: string | undefined
  /** 七个必需源都还没到齐。 */
  incomplete: boolean
  /** 全部重拉（含模型与预设两个可缺席的）。 */
  reload: () => void
}

export function useInsightSources(ctx: ClientContext, need: boolean): InsightSources {
  const tree = useRpc<PluginNode[]>(ctx, 'plugins/tree', need)
  const graph = useRpc<PluginGraphNode[]>(ctx, 'plugins/graph', need)
  const final = useRpc<FinalConfig>(ctx, 'config/final', need)
  const settings = useRpc<SettingsView[]>(ctx, 'settings/list', need)
  const layers = useRpc<LayerView[]>(ctx, 'config/layers', need)
  const files = useRpc<ConfigFileInfo[]>(ctx, 'files/list', need)
  const inventory = useRpc<ToolInventory>(ctx, 'plugins/tools', need)
  // 模型与预设不进必需源：host 比前端旧时这两个端点会 404，那只该让对应那根轴
  // 空着并说明原因，不该把整个工作台染红。
  const models = useRpc<ModelInventory>(ctx, 'models/list', need)
  const presets = useRpc<PresetInventory>(ctx, 'presets/list', need)

  const required = [tree, graph, final, settings, layers, files, inventory]
  const loading = required.some(r => r.loading)
  const error = required.map(r => r.error).find(e => e !== undefined)
  const incomplete = required.some(r => r.data === undefined)

  const reload = useMemo(() => () => {
    models.reload()
    presets.reload()
    for (const r of required) r.reload()
  // eslint 不在这个包里跑；依赖收窄成各自稳定的 reload 引用
  }, [tree.reload, graph.reload, final.reload, settings.reload, layers.reload, files.reload, inventory.reload, models.reload, presets.reload])

  return {
    tree: tree.data,
    graph: graph.data,
    final: final.data,
    settings: settings.data,
    layers: layers.data,
    files: files.data,
    inventory: inventory.data,
    models: models.data,
    modelsStale: !models.loading && models.error !== undefined,
    presets: presets.data,
    presetsStale: !presets.loading && presets.error !== undefined,
    loading,
    error,
    incomplete,
    reload,
  }
}
