/**
 * 设置页的 Insight 区。
 *
 * 只做两件事：给结论（556px 摘要卡），和开工作台（全屏模态）。
 * 分工的理由见 SummaryCard 与 Workbench 的头注释——一句话是：
 * 设置页只有 556px，主从布局在这个宽度里放不下一个包名，所以过程要另开一块屏幕。
 *
 * 数据也跟着分：摘要走独立的 insight/summary 端点（host 算完只发一小把数字），
 * 打开工作台才拉全量四源。设置页不该为了显示几个数字去拉 174 个节点的树。
 *
 * 版本错位：客户端 bundle 随页面刷新就更新，host 是长驻进程要重启才更新。
 * 改完没重启时，新前端会去调 host 还不认识的端点。这是开发循环里的常态，
 * 不该让面板整块变红——summary 端点缺席就退回用四个老端点在客户端算同一份摘要
 * （buildSummary 本来就是 shared 纯函数），并明说一句「host 比前端旧」。
 */
import { useMemo, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { buildSummary } from '../../shared/summary.ts'
import type { ConfigFileInfo, FinalConfig, InsightSummary, LayerView, ModelInventory, PluginGraphNode, PluginNode, PresetInventory, SettingsView, ToolInventory } from '../../shared/types.ts'
import { PanelStatus } from './PanelStatus.tsx'
import { RestartRow } from './RestartRow.tsx'
import { SummaryCard } from './SummaryCard.tsx'
import { useRpc } from './useRpc.ts'
import { Workbench } from './Workbench.tsx'

export interface InsightSectionProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
}

export function InsightSection({ ctx, t }: InsightSectionProps) {
  const [open, setOpen] = useState(false)
  const summary = useRpc<InsightSummary>(ctx, 'insight/summary', true)

  const stale = !summary.loading && summary.error !== undefined

  // 四源：打开工作台时要；host 旧到没有 summary 端点时也要（退回客户端自算）
  const need = open || stale
  const tree = useRpc<PluginNode[]>(ctx, 'plugins/tree', need)
  const graph = useRpc<PluginGraphNode[]>(ctx, 'plugins/graph', need)
  const final = useRpc<FinalConfig>(ctx, 'config/final', need)
  const settings = useRpc<SettingsView[]>(ctx, 'settings/list', need)
  const layers = useRpc<LayerView[]>(ctx, 'config/layers', need)
  const files = useRpc<ConfigFileInfo[]>(ctx, 'files/list', need)
  const inventory = useRpc<ToolInventory>(ctx, 'plugins/tools', need)
  const sources = [tree, graph, final, settings, layers, files, inventory]
  // 模型清单不进 sources：host 比前端旧时这个端点会 404，那只该让「按模型」那一轴
  // 空着并说明原因，不该把整个工作台染红——同 summary 端点的教训。
  const models = useRpc<ModelInventory>(ctx, 'models/list', need)
  // 预设清单同理不进 sources：host 比前端旧时它会 404，那只该让「按预设」这一轴
  // 空着并说明原因，不该把整个工作台染红
  const presets = useRpc<PresetInventory>(ctx, 'presets/list', need)

  const effective = useMemo((): InsightSummary | undefined => {
    if (summary.data !== undefined) return summary.data
    if (!stale) return undefined
    if (tree.data === undefined || graph.data === undefined || settings.data === undefined || layers.data === undefined) return undefined
    return buildSummary(tree.data, graph.data, settings.data, layers.data, final.data)
  }, [summary.data, stale, tree.data, graph.data, settings.data, layers.data, final.data])

  const reloadAll = () => {
    summary.reload()
    models.reload()
    presets.reload()
    for (const r of sources) r.reload()
  }

  // 退回路径也拿不到数据才算真失败（host 连老端点都没有 = 插件没装上）
  const fatal = stale && effective === undefined && sources.every(r => !r.loading) && sources.some(r => r.error !== undefined)

  return (
    <>
      {summary.loading && effective === undefined && <PanelStatus kind="loading" text={t('status.loading')} />}
      {fatal && <PanelStatus kind="error" text={t('status.error', { message: summary.error ?? '' })} />}
      {effective !== undefined && (
        <SummaryCard
          t={t}
          summary={effective}
          stale={stale}
          onOpen={() => setOpen(true)}
          action={<RestartRow ctx={ctx} t={t} />}
        />
      )}
      <Workbench
        ctx={ctx}
        t={t}
        open={open}
        onClose={() => setOpen(false)}
        tree={tree.data}
        graph={graph.data}
        final={final.data}
        settings={settings.data}
        layers={layers.data}
        files={files.data}
        inventory={inventory.data}
        models={models.data}
        modelsStale={!models.loading && models.error !== undefined}
        presets={presets.data}
        presetsStale={!presets.loading && presets.error !== undefined}
        loading={sources.some(r => r.loading)}
        error={sources.map(r => r.error).find(e => e !== undefined)}
        onReload={reloadAll}
      />
    </>
  )
}
