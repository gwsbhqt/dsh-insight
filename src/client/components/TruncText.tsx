/** 截断文本：单行 ellipsis + 搜索高亮；Tooltip 全量只在真溢出时出现（useOverflowing）。
 * 标题行的 id/包名/hash 统一用它——Tooltip 无 wrapper（clone 子元素），截断不被破坏。 */
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { Highlight } from './Highlight.tsx'
import { useOverflowing } from './useOverflowing.ts'

export interface TruncTextProps {
  text: string
  /** 搜索词：命中段高亮 */
  query?: string | undefined
  /** 等宽字体（id/包名/hash 等代码类内容） */
  mono?: boolean | undefined
  /** 次要文本：12px tertiary；默认主标题 13px primary */
  dim?: boolean | undefined
}

export function TruncText({ text, query, mono = false, dim = false }: TruncTextProps) {
  const { ref, overflowing } = useOverflowing<HTMLSpanElement>(text)
  return (
    <Tooltip label={text} side="bottom" maxWidth={720} disabled={!overflowing}>
      <span ref={ref} className={`min-w-0 shrink truncate ${mono ? 'font-mono' : ''} ${dim ? 'text-[12px] text-tertiary' : 'text-[13px] text-primary'}`}>
        <Highlight text={text} query={query} />
      </span>
    </Tooltip>
  )
}
