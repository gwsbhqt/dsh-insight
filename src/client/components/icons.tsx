/** 路径操作的内联 SVG 图标与按钮样式（FilePath / PreviewModal 共用）。 */

export function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.5 8.5 6 12 13.5 4" />
    </svg>
  )
}

export function IdeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" />
      <path d="M9.5 2H14v4.5" />
      <path d="M14 2 8 8" />
    </svg>
  )
}

/** 折叠指示 chevron（▸），配合 rotate-90 表示展开态。 */
export function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

/** 与设置对话框同款 ×（两条交叉路径，14×14）。 */
export function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14.1168 13.197 13.197 14.1167 1.8833 2.80303 2.80309 1.88324 14.1168 13.197Z" />
      <path d="M13.197 1.88326 14.1168 2.80305 2.80309 14.1168 1.8833 13.197 13.197 1.88326Z" />
    </svg>
  )
}

export const ICON_BTN = 'shrink-0 cursor-pointer rounded p-0.5 text-tertiary transition-colors duration-150 hover:text-brand-bright'

/** 列头的「这一列怎么读」提示。笔画比正文更轻——它是随手可查的注解，不是内容。 */
export function HelpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.2" />
      <path d="M6.35 6.5a1.7 1.7 0 1 1 1.65 2v.85" />
      <path d="M8 11.35v.05" strokeWidth="1.6" />
    </svg>
  )
}

/**
 * 重启用的环形箭头（⟳）：绕一圈再回到原点，正好是「同一个东西重新来一遍」。
 * 和 dsh-market 重启横幅上的那颗是同一个意思。
 */
export function RestartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.6 8a5.6 5.6 0 1 1-1.64-3.96" />
      <path d="M13.6 2.2v3.2h-3.2" />
    </svg>
  )
}
