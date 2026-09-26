/**
 * 摘要卡里「立即重启」那一行。
 *
 * 功能对齐 dsh-market 里的同名按钮——换一个新的 dsh 进程，然后刷新页面。
 * 差别在于它出现的位置：market 那颗只在「有变更等着生效」的横幅里露面，
 * 这颗是常驻的。所以这里多一步二次确认——常驻按钮误点一下就把整个 dsh 关了，
 * 代价太大，而 market 那边点它的人上一秒刚装完插件，本来就是奔着重启去的。
 * 确认态标红、2 秒不点就自己退回去：红色说明这一下是有代价的，
 * 而误点的人什么都不用做，等一下按钮就复原了。
 *
 * 按不动的五种理由分开说，因为用户能做的事完全不同：
 *   有会话在跑 —— 等它跑完，按钮自己会亮；
 *   嵌在别的应用里 —— host 就是那个应用的进程（Electron 桌面应用这类），用它自己的重启；
 *   这台机器不许 —— 等也没用，得去改环境或者让守护进程来重启；
 *   问不到状态 —— 多半是 host 比界面旧，手动重启一次 dsh 就好；
 *   还没问到   —— 刚挂上来，等一下就有了，这时候什么都不该说。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { HelpIcon, RestartIcon } from './icons.tsx'
import { useHostRestart } from './useHostRestart.ts'

export interface RestartRowProps {
  ctx: ClientContext
  t: TranslateNS<'dsh-insight'>
}

/** label / hint / 能不能点：整行版与头部紧凑版共用一份，免得两处各判一套、判出两个答案。 */
function restartView(state: ReturnType<typeof useHostRestart>, t: TranslateNS<'dsh-insight'>) {
  const { phase, status, probed, error } = state
  const off = status !== undefined && !status.canRestart
  const supervisor = status?.supervisor
  // 嵌在别的应用进程里（Electron 桌面应用这类）：这里的「重启」等于把那个应用整个关掉
  const embedded = status?.embeddedIn
  const running = status?.running ?? 0
  const busy = running > 0
  // status 还没到手时也按不动：没有 boot 就没法判断新进程起来没有
  const disabled = status === undefined || off || busy || phase === 'working'

  const label = phase === 'working'
    ? t('restart.working')
    : phase === 'confirm' ? t('restart.confirm') : t('restart.now')

  const hint = error !== undefined ? error
    : phase === 'working' ? t('restart.hintWorking')
      : status === undefined ? (probed ? t('restart.hintUnknown') : t('restart.hintProbing'))
        : embedded !== undefined ? t('restart.hintEmbedded', { name: embedded })
          : off ? (supervisor === undefined ? t('restart.hintOff') : t('restart.hintSupervised', { name: supervisor }))
            : busy ? t('restart.hintBusy', { count: running })
              : phase === 'confirm' ? t('restart.hintConfirm')
                : t('restart.hint')

  return { disabled, label, hint }
}

export function RestartRow({ ctx, t }: RestartRowProps) {
  const state = useHostRestart(ctx, t)
  const { phase, error, click } = state
  const { disabled, label, hint } = restartView(state, t)

  const tone = disabled
    ? 'cursor-not-allowed border-line bg-surface-2 text-tertiary opacity-60'
    : phase === 'confirm'
      ? 'cursor-pointer border-err bg-surface-2 text-err hover:opacity-85'
      : 'cursor-pointer border-line bg-surface-2 text-primary hover:opacity-85'

  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-[13px]">
      <button
        type="button"
        onClick={click}
        disabled={disabled}
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-[15px] py-[7px] text-[13px] font-medium transition-opacity duration-150 ${tone}`}
      >
        {label}
        {/* 图标跟在文字后面，与同一张卡里的「打开洞察 ↗」对齐。
            确认态换成问号：这一下点下去会发生什么，图标先替文案问一句。 */}
        <span aria-hidden="true" className={`inline-flex ${phase === 'working' ? 'dsh-spin' : ''}`}>
          {phase === 'confirm' ? <HelpIcon /> : <RestartIcon />}
        </span>
      </button>
      <span className={`min-w-0 text-[11.5px] leading-[1.5] ${error === undefined ? 'text-secondary' : 'text-err'}`}>
        {hint}
      </span>
    </div>
  )
}

/**
 * 工作台顶栏那颗「立即重启」。
 *
 * 为什么这里也要有一颗：改开关的地方在工作台，而工作台是盖住整页的——摘要卡上那颗
 * 在它后面，看不见也够不着。于是「改完要重启才生效」这句话在唯一需要它的地方无处可点。
 * 行为、守卫、二次确认都复用同一个 hook，只是没地方放那段说明文字，改挂在 title 上。
 */
export function RestartButton({ ctx, t }: RestartRowProps) {
  const state = useHostRestart(ctx, t)
  const { phase, click } = state
  const { disabled, label, hint } = restartView(state, t)

  const tone = disabled
    ? 'cursor-not-allowed text-dimmed'
    : phase === 'confirm' ? 'cursor-pointer text-err hover:bg-hover' : 'cursor-pointer text-secondary hover:bg-hover hover:text-primary'

  return (
    <button
      type="button"
      title={hint}
      onClick={click}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-[12.5px] transition-colors duration-150 ${tone}`}
    >
      {label}
      <span aria-hidden="true" className={`inline-flex ${phase === 'working' ? 'dsh-spin' : ''}`}>
        {phase === 'confirm' ? <HelpIcon /> : <RestartIcon />}
      </span>
    </button>
  )
}
