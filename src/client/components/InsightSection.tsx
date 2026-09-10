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
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { buildSummary } from '../../shared/summary.ts'
import type { InsightSummary } from '../../shared/types.ts'
import { InspectorRow } from './InspectorRow.tsx'
import { PanelStatus } from './PanelStatus.tsx'
import { RestartRow } from './RestartRow.tsx'
import { SummaryCard } from './SummaryCard.tsx'
import { useInsightSources } from './useInsightSources.ts'
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

  // 九源：打开工作台时要；host 旧到没有 summary 端点时也要（退回客户端自算）。
  // 同一套源 inspector 那份工作台也用，所以抽在 useInsightSources 里。
  const need = open || stale
  const sources = useInsightSources(ctx, need)

  const effective = useMemo((): InsightSummary | undefined => {
    if (summary.data !== undefined) return summary.data
    if (!stale) return undefined
    if (sources.tree === undefined || sources.graph === undefined || sources.settings === undefined || sources.layers === undefined) return undefined
    return buildSummary(sources.tree, sources.graph, sources.settings, sources.layers, sources.final)
  }, [summary.data, stale, sources.tree, sources.graph, sources.settings, sources.layers, sources.final])

  const reloadAll = () => {
    summary.reload()
    sources.reload()
  }

  // 退回路径也拿不到数据才算真失败（host 连老端点都没有 = 插件没装上）
  const fatal = stale && effective === undefined && !sources.loading && sources.error !== undefined

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
      {/* inspector 是个会改变页面手感的开关，所以单独一块，不混进只读的摘要卡 */}
      <InspectorRow t={t} />
      <Workbench
        ctx={ctx}
        t={t}
        open={open}
        onClose={() => setOpen(false)}
        tree={sources.tree}
        graph={sources.graph}
        final={sources.final}
        settings={sources.settings}
        layers={sources.layers}
        files={sources.files}
        inventory={sources.inventory}
        models={sources.models}
        modelsStale={sources.modelsStale}
        presets={sources.presets}
        presetsStale={sources.presetsStale}
        loading={sources.loading}
        error={sources.error}
        onReload={reloadAll}
      />
    </>
  )
}
