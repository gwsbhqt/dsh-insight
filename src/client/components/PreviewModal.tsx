/** 文件预览对话框：自写而非房子 Modal——需要打开/关闭过渡动画。
 * 宽高/圆角/关闭按钮全部 follow 设置对话框（800×800、24px 圆角、28px 圆形 ×）。
 * mask 点击 / Esc / × 关闭；200ms ease-out 过渡；Esc 用捕获阶段拦截不透传设置框。
 * 注意：portal 到 body，脱离 .dsh-insight 作用域，故根节点自己带上该类吃按钮 reset 与 token。 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { callInsight } from '../rpc.ts'
import { SURFACE_SIZE, surfaceMotion, useSettled } from './surface.ts'
import { CheckIcon, CloseIcon, CopyIcon, ICON_BTN, IdeIcon } from './icons.tsx'

export interface PreviewModalProps {
  open: boolean
  onClose: () => void
  title: string
  /** 完整路径：不截断，换行显示全量，尾部带复制/IDE 按钮。 */
  path: string
  closeLabel: string
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
  children?: ReactNode
}

export function PreviewModal({ open, onClose, title, path, closeLabel, ctx, t, children }: PreviewModalProps) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  // 动画落定后卸掉 transform，否则它会劫持 tooltip 的 fixed 定位（见 surface.ts）
  const settled = useSettled(shown)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // 双 rAF：先挂载再翻 shown，让 transition 有起点
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const id = setTimeout(() => setMounted(false), 200) // 播完出场动画再卸载
    return () => clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!mounted) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // capture + stopImmediatePropagation：宿主设置对话框也在 document 上听 Esc，
      // 不拦住的话按一下会把两层一起关掉
      e.stopImmediatePropagation()
      onClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [mounted, onClose])

  const copy = () => {
    navigator.clipboard.writeText(path).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }).catch(() => {})
  }
  const openIde = () => {
    callInsight(ctx, 'files/open', { path }).catch(() => {})
  }

  if (!mounted) return null
  return createPortal(
    <div
      role="presentation"
      onClick={onClose}
      className={`dsh-insight fixed inset-0 z-[1010] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${shown ? 'opacity-100' : 'opacity-0'}`} // 设置对话框 overlay 是 z-1000，必须压过它
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={e => e.stopPropagation()}
        style={SURFACE_SIZE}
        className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all duration-200 ease-out ${surfaceMotion(shown, settled)}`}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-primary">{title}</p>
            {/* 图标内联在段落里：路径换行到多长，按钮就跟在最后一行末尾，不错位 */}
            <p className="mt-0.5 break-all font-mono text-[12px] leading-5 text-tertiary">
              {path}
              <Tooltip label={copied ? t('path.copied') : t('path.copy')} side="top">
                <button aria-label={t('path.copy')} onClick={copy} className={`${ICON_BTN} ml-1 inline-flex align-middle`}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </Tooltip>
              <Tooltip label={t('path.openIde')} side="top">
                <button aria-label={t('path.openIde')} onClick={openIde} className={`${ICON_BTN} inline-flex align-middle`}>
                  <IdeIcon />
                </button>
              </Tooltip>
            </p>
          </div>
          {/* 与设置对话框同款 ×：28×28 正圆、透明底、hover 淡灰 */}
          <button
            aria-label={closeLabel}
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-tertiary transition-colors duration-150 hover:bg-hover hover:text-primary"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
