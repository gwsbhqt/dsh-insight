/**
 * 工作台与它开出来的子对话框（文件预览）共用的画布尺寸与开合行为。
 *
 * 抽成常量是因为这两处必须一致：预览是从工作台里点开的，尺寸不同会让人觉得
 * 「跳到了另一个地方」。历史上预览窗是 800×800（当年跟着宿主设置框定的），
 * 工作台独立成全屏模态之后就对不上了。
 */
import { useEffect, useState } from 'react'

export const SURFACE_SIZE = { width: 'min(1600px, 92vw)', height: 'min(1100px, 88vh)' } as const

/** 开合过渡时长，和 duration-200 保持一致。 */
export const SURFACE_ANIM_MS = 200

/**
 * 开合动画跑完之后把 transform 卸掉，返回「是否已经落定」。
 *
 * `scale-100` 视觉上等于没有，但**带 transform / scale 的祖先会成为
 * `position: fixed` 的定位基准**（`filter`、`backdrop-filter` 同理）。房子的
 * Tooltip 是 fixed + 视口坐标定位的，于是对话框里每一个 tooltip 都被整体平移了
 * 对话框左上角那么多，飘到别的行上去。
 *
 * 注意 Tailwind 4 的 `scale-*` 编译成**独立的 `scale` 属性**而不是 `transform`，
 * 所以 `transform: none` 压不住它——只能把 class 本身摘掉。
 * 动画结束才摘，开合效果不受影响；定位基准随即回落到 overlay——它是
 * `fixed inset-0`，和视口重合，坐标就对上了。
 */
export function useSettled(shown: boolean): boolean {
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    if (!shown) {
      setSettled(false)
      return undefined
    }
    const id = setTimeout(() => setSettled(true), SURFACE_ANIM_MS + 20)
    return () => clearTimeout(id)
  }, [shown])
  return settled
}

/** 开合动画的 class。落定后不带任何缩放，避免劫持 tooltip 的定位基准。 */
export function surfaceMotion(shown: boolean, settled: boolean): string {
  if (!shown) return 'scale-95 opacity-0'
  return settled ? 'opacity-100' : 'scale-100 opacity-100'
}
