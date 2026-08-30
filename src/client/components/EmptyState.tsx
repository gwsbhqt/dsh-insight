/**
 * 一整栏空掉时的样子。
 *
 * 之前这里是一行贴着左上角的灰字，一大片白里孤零零挂着七个字——它既没告诉你
 * 为什么空，也没告诉你接下来能做什么。空态是这个面板最该好好说话的时刻：
 * 列表里有东西的时候，数据自己会解释自己；空的时候，只剩这段文案了。
 *
 * 所以固定三段：**是什么**（一句结论）、**为什么**（一句原因）、**然后呢**
 * （可选的一个动作）。没有插画、没有大图标——面板通篇的规矩是正常态零装饰，
 * 空态也不该突然热闹起来。居中是为了让它在一大片空里有个落点。
 */
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  /** 一句结论。 */
  title: string
  /** 为什么会这样；没有就不给。 */
  detail?: string | undefined
  /** 接下来能做什么（一个链接或按钮）。 */
  action?: ReactNode
}

export function EmptyState({ title, detail, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-8 py-14 text-center">
      {/* 一道短横：给这段文字一个视觉落点，不至于飘在正中间无依无靠 */}
      <span aria-hidden="true" className="mb-1 h-px w-8 bg-line-2" />
      <p className="m-0 text-[13.5px] font-medium text-secondary">{title}</p>
      {detail !== undefined && detail !== '' && (
        <p className="m-0 max-w-[440px] text-[12.5px] leading-[1.65] text-tertiary">{detail}</p>
      )}
      {action !== undefined && <span className="mt-1.5">{action}</span>}
    </div>
  )
}
