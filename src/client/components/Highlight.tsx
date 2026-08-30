/** 搜索命中高亮：按 query 大小写不敏感切分文本，命中段包 <mark>（房子气泡高亮色）。 */
import type { ReactNode } from 'react'

export function Highlight({ text, query = '' }: { text: string; query?: string | undefined }) {
  const q = query.trim().toLowerCase()
  if (q === '') return <>{text}</>
  const lower = text.toLowerCase()
  const parts: ReactNode[] = []
  let i = 0
  let k = 0
  for (;;) {
    const j = lower.indexOf(q, i)
    if (j < 0) {
      parts.push(text.slice(i))
      break
    }
    if (j > i) parts.push(text.slice(i, j))
    parts.push(
      <mark key={k++} className="bg-transparent font-medium text-brand-bright">
        {text.slice(j, j + q.length)}
      </mark>,
    )
    i = j + q.length
  }
  return <>{parts}</>
}
