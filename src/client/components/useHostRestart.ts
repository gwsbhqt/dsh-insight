/**
 * 「立即重启」这颗按钮背后的全部状态：host 忙不忙、能不能重启、正在重启到哪一步。
 *
 * 四件事值得说清楚：
 *
 * 1. **为什么要轮询。** 忙不忙是随时会变的（对话跑起来、跑完），而这条 RPC 通道
 *    没有订阅面，只能自己隔几秒问一次。摘要卡本身是「打开设置看一眼」的东西，
 *    5 秒的粒度够用，代价也就是几个数字。
 *
 * 2. **为什么每次调用都带超时。** host 正在被自己杀掉的那几百毫秒里，请求会挂着
 *    不回。不设上限的话第一次挂住就再也轮不到下一次，界面会永远停在「正在重启」。
 *
 * 3. **为什么重启后是靠 boot 变了才刷新，而不是收到回执就刷新。** 回执只说明
 *    「接力进程已经派出去了」，新进程可能几秒后才真正起来。太早刷新只会撞上一个
 *    还没人监听的端口。所以拿重启前的 boot 当锚，问到不一样的那个值才刷新——
 *    那时候新进程一定已经在服务了，因为它刚回答了我们。
 *
 * 4. **为什么问不到状态时不把这一行藏起来。** 藏起来看着干净，但它恰好藏在了
 *    唯一需要它的时刻：host 进程比界面旧（改完没重启）时这个端点还不存在，
 *    而「手动重启一次 dsh」正是解法。藏掉按钮，用户只会以为功能没做出来。
 *    所以照常显示、按不动，并把最可能的原因直说。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import type { HostStatus, RestartAck } from '../../shared/types.ts'
import { callInsight, InsightRpcError } from '../rpc.ts'

/** 面板挂着时问一次 host 忙不忙的间隔。 */
const POLL_MS = 5000
/** 单次 RPC 的耐心上限。 */
const CALL_MS = 2500
/** 换进程期间问「起来没有」的间隔。 */
const WAIT_MS = 1500
/** 等新进程起来的总耐心。 */
const DEADLINE_MS = 60000
/** 二次确认的有效期，过了自动退回「立即重启」。 */
const CONFIRM_MS = 2000

/** idle = 待命；confirm = 已经点过一次、等第二次；working = 已经在换进程了。 */
export type RestartPhase = 'idle' | 'confirm' | 'working'

export interface HostRestartState {
  phase: RestartPhase
  /** 最近一次问到的 host 实况；一次都没问到时是 undefined。 */
  status?: HostStatus
  /**
   * 至少问过一轮了（不管成没成）。用来区分「刚挂上来还没问」和「问过但问不到」——
   * 前者不该急着下结论，后者才该把原因说出来。
   */
  probed: boolean
  /** 重启动作本身失败的原因（已翻好的人话）。问不到状态不算，那是 status 缺席。 */
  error?: string
  /** 按钮的点击入口：第一次进确认态，第二次真动手。 */
  click: () => void
}

/**
 * @param ctx - 客户端 ctx，用来拿 connection 面。
 * @param t - 词典，用来把失败翻成人话。
 */
export function useHostRestart(ctx: ClientContext, t: TranslateNS<'dsh-insight'>): HostRestartState {
  const [status, setStatus] = useState<HostStatus | undefined>(undefined)
  const [probed, setProbed] = useState(false)
  const [phase, setPhase] = useState<RestartPhase>('idle')
  const [error, setError] = useState<string | undefined>(undefined)
  // 词典每次渲染都可能是新函数，进依赖数组会把轮询 effect 反复重启；用 ref 现读。
  const tRef = useRef(t)
  tRef.current = t

  // 常态轮询。换进程期间停掉，交给下面那条自己的等待循环，免得两路打架。
  useEffect(() => {
    if (phase === 'working') return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = (): void => {
      callInsight<HostStatus>(ctx, 'host/status', {}, AbortSignal.timeout(CALL_MS))
        .then(next => { if (alive) setStatus(next) })
        // 失败一律按「这一轮没问到」处理，不去猜是哪一种失败。
        // 端点不存在时，旧 host 回的信封本身就是坏的（少了传输层要求的 details），
        // 浏览器拿到的是 schema 校验错而不是我们的错误码——照错误码分支走只会走空。
        .catch(() => { if (alive) setStatus(undefined) })
        .finally(() => {
          if (!alive) return
          setProbed(true)
          timer = setTimeout(tick, POLL_MS)
        })
    }
    tick()
    return () => {
      alive = false
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [ctx, phase])

  // 确认态自己过期：按钮长期停在「确认重启」上等于没有确认，而且误点的人
  // 还得再想办法取消。2 秒不点就自己回去，什么都不用做。
  useEffect(() => {
    if (phase !== 'confirm') return
    const timer = setTimeout(() => setPhase('idle'), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [phase])

  /** 派出重启，然后一直问到 boot 换了为止。 */
  const run = useCallback(() => {
    const previousBoot = status?.boot
    if (previousBoot === undefined) return // 没有锚点就没法判断新进程起来没有
    setError(undefined)
    setPhase('working')
    const deadline = Date.now() + DEADLINE_MS
    const waitForNewBoot = (): void => {
      if (Date.now() > deadline) {
        setPhase('idle')
        setError(tRef.current('restart.timeout'))
        return
      }
      callInsight<HostStatus>(ctx, 'host/status', {}, AbortSignal.timeout(CALL_MS))
        .then(next => {
          // boot 变了 = 回答我们的已经是新进程，这时候刷新才刷得到东西
          if (next.boot !== previousBoot) location.reload()
          else setTimeout(waitForNewBoot, WAIT_MS)
        })
        // 老进程正在死，连不上是意料之中的，继续等
        .catch(() => setTimeout(waitForNewBoot, WAIT_MS))
    }
    callInsight<RestartAck>(ctx, 'host/restart', {}, AbortSignal.timeout(CALL_MS))
      .then(ack => {
        if (ack.ok) {
          waitForNewBoot()
          return
        }
        // 界面的置灰只是提示，host 才是判官；它说不行就把理由原样摆出来
        setPhase('idle')
        setError(tRef.current('restart.fail', { message: ack.message }))
      })
      .catch((cause: unknown) => {
        // 收到 InsightRpcError 说明 host 还活着、只是这次没做成，直接报出来；
        // 传输层失败（连不上）则相反——host 很可能在回执写回来之前就死了，
        // 那正说明重启已经开始，继续等新进程。
        if (cause instanceof InsightRpcError) {
          setPhase('idle')
          setError(tRef.current('restart.fail', { message: cause.message }))
          return
        }
        waitForNewBoot()
      })
  }, [ctx, status?.boot])

  const click = useCallback(() => {
    if (phase === 'working') return
    if (phase === 'idle') {
      setError(undefined)
      setPhase('confirm')
      return
    }
    run()
  }, [phase, run])

  return {
    phase,
    ...(status === undefined ? {} : { status }),
    probed,
    ...(error === undefined ? {} : { error }),
    click,
  }
}
