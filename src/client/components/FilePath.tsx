/** 文件路径：换行显示完整路径 + 复制 / IDE 打开两个图标按钮；点击文本弹预览对话框（credentials 除外）。
 *
 * 不截断也不挂 tooltip：它只出现在工作台右侧详情栏里，那里有整整一栏的宽度可以换行。
 * 之前的「头截断 + hover 出全量 tooltip」是给窄单行设计的，搬进详情栏会出两个毛病——
 * tooltip 被 overflow-y-auto 的滚动容器裁掉（长路径反而看不全），且气泡飘到下方无关内容上。
 * 路径直接换行就没这些问题，还能选中、能读全。 */
import { useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { ReadBlock, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { callInsight } from '../rpc.ts'
import { Highlight } from './Highlight.tsx'
import { CheckIcon, CopyIcon, ICON_BTN, IdeIcon } from './icons.tsx'
import { PanelStatus } from './PanelStatus.tsx'
import { PreviewModal } from './PreviewModal.tsx'

export interface FilePreview {
  content: string
  truncated: boolean
}

export interface FilePathProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
  path: string
  /** 搜索词：命中段高亮。 */
  highlight?: string
  /** 目录路径：不可预览（点击不开对话框），复制/IDE 仍可用。 */
  isDir?: boolean | undefined
  /** 敏感文件等不可读取正文的路径。 */
  previewable?: boolean | undefined
  /** 是否允许调用 Host 在编辑器中打开。 */
  openable?: boolean | undefined
}

type PreviewState = { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ok'; preview: FilePreview }


export function FilePath({ ctx, t, path, highlight, isDir = false, previewable = !isDir, openable = true }: FilePathProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [state, setState] = useState<PreviewState>({ kind: 'loading' })
  const [copied, setCopied] = useState(false)
  const [actionError, setActionError] = useState<string | undefined>()
  const fileName = path.split('/').pop() ?? path
  const lang = /\.ya?ml$/.test(path) ? 'yaml' : undefined

  const openPreview = () => {
    setModalOpen(true)
    setState({ kind: 'loading' })
    callInsight<FilePreview>(ctx, 'files/read', { path })
      .then(preview => setState({ kind: 'ok', preview }))
      .catch((error: Error) => setState({ kind: 'error', message: error.message }))
  }
  const copy = () => {
    setActionError(undefined)
    navigator.clipboard.writeText(path).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }).catch((error: unknown) => setActionError(error instanceof Error ? error.message : String(error)))
  }
  const openIde = () => {
    setActionError(undefined)
    callInsight(ctx, 'files/open', { path }).catch((error: unknown) => setActionError(error instanceof Error ? error.message : String(error)))
  }

  const pathText = (
    <span className="block rounded font-mono text-[12px] leading-[1.55] break-all text-tertiary transition-colors duration-150 group-hover/path:text-brand-bright">
      <Highlight text={path} query={highlight} />
    </span>
  )

  // 路径换行占满可用宽度，图标沉在右下角随文字流，不抢行
  return (
    <span className="flex w-full min-w-0 items-start gap-0.5">
      {!previewable
        ? <span className="min-w-0 flex-1">{pathText}</span>
        : (
          <button onClick={openPreview} className="group/path min-w-0 flex-1 cursor-pointer rounded text-left">
            {pathText}
          </button>
        )}
      <span className="ml-1.5 flex shrink-0 items-center gap-0.5">
        <Tooltip label={copied ? t('path.copied') : t('path.copy')} side="top">
          <button aria-label={t('path.copy')} onClick={copy} className={ICON_BTN}>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </Tooltip>
        {openable && (
          <Tooltip label={t('path.openIde')} side="top">
            <button aria-label={t('path.openIde')} onClick={openIde} className={ICON_BTN}>
              <IdeIcon />
            </button>
          </Tooltip>
        )}
      </span>
      {actionError !== undefined && <span role="alert" className="min-w-0 truncate text-[11px] text-err">{actionError}</span>}
      {previewable && (
        <PreviewModal open={modalOpen} onClose={() => setModalOpen(false)} title={fileName} path={path} closeLabel={t('preview.close')} ctx={ctx} t={t}>
        {state.kind === 'loading' && <PanelStatus kind="loading" text={t('status.loading')} />}
        {state.kind === 'error' && <PanelStatus kind="error" text={t('status.error', { message: state.message })} />}
        {state.kind === 'ok' && (
          <div className="flex flex-col gap-2">
            {state.preview.truncated && <PanelStatus kind="empty" text={t('preview.truncated')} />}
            {/* dsh-soft-wrap：预览里长行软换行，不横向滚出 */}
            <div className="dsh-soft-wrap">
            <ReadBlock
              label={fileName}
              lines={state.preview.content.split('\n').map((text, i) => ({ number: i + 1, text }))}
              totalLines={state.preview.content.split('\n').length}
              {...(lang !== undefined ? { lang } : {})}
              maxLines={Number.MAX_SAFE_INTEGER} // 预览要全量：关掉 ReadBlock 的中段折叠，滚动交给对话框
            />
            </div>
          </div>
        )}
        </PreviewModal>
      )}
    </span>
  )
}
