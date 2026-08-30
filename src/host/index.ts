/**
 * dsh-insight host 半：cordis 函数插件，注册包私有 RPC 通道。
 * 数据全部在 RPC 调用时实时采集——无缓存、无 watch，重开面板即最新。
 * @module dsh-insight
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-connection'
import { INSIGHT_CHANNEL } from '../shared/types.ts'
import { createInsightHandler } from './rpc.ts'
import { installToolObserver } from './tool-observer.ts'

export const name = 'dsh-insight'

/** loader（对账/插件树）、connection（RPC）、settings（Settings 实况）。 */
export const inject = ['loader', 'connection', 'settings']

export function apply(ctx: Context): void {
  // 工具注册观察器：越早装越全——工具在 agent 构造时才注册，装晚了就漏掉先跑起来的那些。
  // 只改运行时内存里的原型，不写任何文件；见 tool-observer.ts 的头注释。
  ctx.effect(() => installToolObserver(ctx.get('tools')), 'dsh-insight: tool observer')
  ctx.effect(
    () => ctx.connection.rpc.handle(INSIGHT_CHANNEL, createInsightHandler(ctx), { authority: 'loopback' }),
    'dsh-insight: rpc channel',
  )
}
