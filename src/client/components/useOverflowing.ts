/** 元素是否横向溢出（scrollWidth > clientWidth），ResizeObserver 跟踪。
 * 用法：TruncText/FilePath 的 tooltip 只在文本真被截断时出现——短文本 hover 不出气泡。 */
import { useLayoutEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

export function useOverflowing<T extends HTMLElement>(watch: unknown): { ref: MutableRefObject<T | null>; overflowing: boolean } {
  const ref = useRef<T>(null)
  const [overflowing, setOverflowing] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [watch])
  return { ref, overflowing }
}
