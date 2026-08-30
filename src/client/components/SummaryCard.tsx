/**
 * 设置页的 Insight 区：556px 摘要卡 + 「打开工作台」入口。
 *
 * 为什么是摘要而不是完整面板：宿主设置弹窗写死 800×800，左侧导航吃掉 188px，
 * 这里只有 556px。而最长的包名就要 316px、最长的完整 id 要 354px——左右各 278px
 * 的主从布局连一个包名都放不下。556px 做它擅长的事：一句话结论 + 六个数字 + 一个按钮。
 * 打开设置第一眼就知道系统健不健康，这恰好是旧面板完全没有的东西。
 */
import type { ReactNode } from 'react'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { InsightSummary } from '../../shared/types.ts'

/** 一格：数字 + 标签 +（可选）右对齐的点名。 */
function Cell({ value, label, example, tone }: {
  value: number
  label: string
  example?: string | undefined
  tone?: 'info' | 'warn' | undefined
}) {
  const color = tone === 'warn' ? 'text-warn' : tone === 'info' ? 'text-brand-bright' : 'text-primary'
  return (
    <div className="flex min-w-0 items-baseline gap-2.5 border-b border-line px-4 py-[11px] not-nth-2n:border-r">
      <span className={`shrink-0 text-[17px] leading-[1.3] font-semibold tabular-nums ${color}`}>{value}</span>
      <span className="shrink-0 text-[12.5px] text-tertiary">{label}</span>
      {example !== undefined && example !== '' && (
        <span className="ml-auto min-w-0 truncate font-mono text-[11.5px] text-tertiary">{example}</span>
      )}
    </div>
  )
}

export interface SummaryCardProps {
  t: TranslateNS<'dsh-insight'>
  summary: InsightSummary
  /** host 比前端旧、摘要是客户端退回算出来的：数字一样，但值得说一句。 */
  stale?: boolean | undefined
  onOpen: () => void
  /**
   * 「打开洞察」上面那一行（重启入口）。做成插槽而不是内建，是为了让这张卡
   * 保持纯展示——它只认 props，不认 ctx，也就不用为了一颗按钮去碰 RPC。
   */
  action?: ReactNode
}

export function SummaryCard({ t, summary, stale = false, onOpen, action }: SummaryCardProps) {
  const healthy = summary.attention === 0
  return (
    <div className="dsh-insight flex flex-col gap-3 p-4 text-primary">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        {/* 结论先行：健不健康是一句话，不是让你自己从列表里数出来 */}
        <div className="border-b border-line px-4 pt-3.5 pb-[13px]">
          <p className="m-0 text-[19px] leading-[1.35] font-semibold tracking-[-0.015em]">
            {healthy ? t('summary.healthy') : t('summary.needsAttention', { count: summary.attention })}
            <span className="text-[14px] font-normal text-tertiary">
              {' · '}
              {healthy
                ? t('summary.healthyNote', { count: summary.plugins })
                : summary.attentionIds.join('、')}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2">
          <Cell value={summary.active} label={t('summary.active')} />
          <Cell value={summary.disabled} label={t('summary.disabled')} />
          <Cell
            value={summary.attention}
            label={t('summary.attention')}
            {...(summary.attention > 0 ? { tone: 'warn' as const } : {})}
          />
          <Cell
            value={summary.userOverrides}
            label={t('summary.overrides')}
            example={summary.userOverrideIds[0]}
            {...(summary.userOverrides > 0 ? { tone: 'info' as const } : {})}
          />
          <Cell value={summary.runtimeOnly} label={t('summary.runtimeOnly')} />
          <Cell value={summary.layers} label={t('summary.layers')} example={t('summary.lastLayer', { label: summary.lastLayer })} />
        </div>

        {/* 短暂且可操作的提示，重启就消失——与被删掉的那条常驻警告不是一回事 */}
        {stale && (
          <p className="m-0 border-b border-line px-4 py-2 text-[11.5px] leading-[1.55] text-brand-bright">
            {t('summary.staleHost')}
          </p>
        )}
        {action}
        <div className="flex items-center gap-3 px-4 py-[13px]">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand bg-brand px-[15px] py-[7px] text-[13px] font-medium text-surface transition-opacity duration-150 hover:opacity-85"
          >
            {t('summary.open')}
            <span aria-hidden="true">↗</span>
          </button>
          <span className="text-[11.5px] leading-[1.5] text-secondary">{t('summary.openHint')}</span>
        </div>
      </div>
    </div>
  )
}
