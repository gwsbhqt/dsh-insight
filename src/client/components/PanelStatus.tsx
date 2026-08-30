/** 统一的加载/空/错状态渲染（颜色字号一致，文案由调用方给词典化文本）。 */
export function PanelStatus({ kind, text }: { kind: 'loading' | 'error' | 'empty'; text: string }) {
  const cls = kind === 'error' ? 'text-err' : 'text-tertiary'
  return <p className={`${cls} text-[13px]`}>{text}</p>
}
