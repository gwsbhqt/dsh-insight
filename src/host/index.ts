/**
 * dsh-insight host 半：cordis 函数插件，注册包私有 RPC 通道。
 * 数据全部在 RPC 调用时实时采集——无缓存、无 watch，重开面板即最新。
 * @module dsh-insight
 */
import type { Context } from '@deepseek-ai/cordis'
import type { ConnectionRpcHandler } from '@deepseek-ai/dsh-client-connection'
import { INSIGHT_CHANNEL } from '../shared/types.ts'
import { createInsightHandler } from './rpc.ts'
import { installToolObserver } from './tool-observer.ts'

export const name = 'dsh-insight'

/**
 * loader（对账/插件树）、connection（RPC）、settings（Settings 实况）、webServer（RPC 通道的落地路由）。
 * webServer 从 dsh 0.1.5-rc.1 起是硬要求：通道注册最终是 `owner.webServer.register(route)`，
 * owner 就是本插件的 ctx，不声明就抛 `cannot get property "webServer" without inject`。
 */
export const inject = ['loader', 'connection', 'settings', 'webServer']

/**
 * 通道注册绕开 `ctx.connection.rpc.handle`，直接调服务上的 register 并把本插件 ctx 当 owner 传进去。
 *
 * 0.1.5-rc.1 的 handle 在宿主侧走不通：register 改成读 `owner.webServer`，而 `rpc` 是 getter，
 * cordis 取 getter 时会把服务里的 `this.ctx` 换成一个「影子上下文」——服务解析于是落到
 * client-connection 插件自己的 fiber 上，那边只 inject 了 credentials，于是必抛
 * `cannot get property "webServer" without inject`，跟调用方声明了什么无关。
 * 本机实测：handle 失败，register 直传 ctx 成功。register 在 d.ts 里是 private，故窄转型一次。
 *
 * 退出条件：上游把 rpc.handle 修好（dsh web 能起来即可判定）后，这里换回
 * `ctx.connection.rpc.handle(INSIGHT_CHANNEL, createInsightHandler(ctx))`，inject 里的 webServer 保留——
 * 那条依赖本来就是真的。
 */
type ChannelRegistrar = {
  register(owner: Context, channel: string, handler: ConnectionRpcHandler): () => Promise<void>
}

export function apply(ctx: Context): void {
  // 工具注册观察器：越早装越全——工具在 agent 构造时才注册，装晚了就漏掉先跑起来的那些。
  // 只改运行时内存里的原型，不写任何文件；见 tool-observer.ts 的头注释。
  ctx.effect(() => installToolObserver(ctx.get('tools')), 'dsh-insight: tool observer')
  ctx.effect(
    () => (ctx.connection as unknown as ChannelRegistrar).register(
      ctx,
      INSIGHT_CHANNEL,
      createInsightHandler(ctx),
    ),
    'dsh-insight: rpc channel',
  )
}
