/** 全局唯一 Tag：所有徽章/标签/芯片的统一实现。
 * 固定 11px + leading-4 + px-1.5 py-0.5 → 中英文混排下盒高恒等 20px，行高因此一致。
 *
 * 视觉契约（定了就别再改）：**颜色只编码健康度，不编码类别**。
 *   dim  灰   其余一切。正常态零颜色、零标签——正常不需要被标出来。
 *   info 蓝   人动过：用户覆盖、--patch 层、运行时动态注册、某层覆盖了别人。
 *   warn 琥珀 要注意：等待依赖、多个候选提供者、确认不是假阳性的状态差异。
 *   err  红   坏了：加载失败、依赖无人提供（内置不算）、某层把别人关停。
 * 绿色整个删掉：它唯一的意思是「正常」，而正常不需要被标出来。
 * 类别靠位置与字体表达——等宽给 id / 路径 / 服务名，正文灰给包名。
 */
import type { ReactNode } from 'react'

export type TagTone = 'dim' | 'info' | 'warn' | 'err'

/** 纯文本场景（如层行上的动作计数）共用同一套 tone 色，不套 tag 盒。 */
export const TONE_TEXT: Record<TagTone, string> = {
  dim: 'text-tertiary',
  info: 'text-brand-bright',
  warn: 'text-warn',
  err: 'text-err',
}

export interface TagProps {
  tone?: TagTone | undefined
  /** 等宽字体（entry id / 服务名 / hash 等代码类内容）。 */
  mono?: boolean | undefined
  children: ReactNode
}

export function Tag({ tone = 'dim', mono = false, children }: TagProps) {
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] leading-4 bg-hover ${TONE_TEXT[tone]} ${mono ? 'font-mono' : ''}`}>
      {children}
    </span>
  )
}
