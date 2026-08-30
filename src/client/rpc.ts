/** RPC 调用封装：拿 connection 面、解信封。 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { INSIGHT_CHANNEL, type InsightEndpoint, type InsightResult } from '../shared/types.ts'

/** connection 面的最小本地声明（client 半按需取面，形状对齐 dsh-client-connection 的 ClientConnectionRpc）。 */
interface ConnectionFace {
  rpc: {
    call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<InsightResult<unknown>>
  }
}

export function connectionOf(ctx: ClientContext): ConnectionFace {
  const connection = ctx.get('connection') as ConnectionFace | undefined
  if (connection === undefined) throw new Error('dsh-insight: connection face 不可用')
  return connection
}

/**
 * 端点报错时抛这个：把信封里的 code 一起带出来。
 *
 * 它同时也是一个「host 还活着」的证据——能解出信封，说明对面回了一个完整的
 * 应答。重启流程正是靠这一点分岔：拿到它就把失败原因摆出来，拿到别的（传输层
 * 直接断了）则相反，那多半是 host 已经在换进程了，该继续等新的那个起来。
 */
export class InsightRpcError extends Error {
  constructor(message: string, readonly code: string) {
    super(message)
    this.name = 'InsightRpcError'
  }
}

/** 调端点并解信封；失败抛错交给面板的三态处理。 */
export async function callInsight<T>(ctx: ClientContext, endpoint: InsightEndpoint, payload: unknown = {}, signal?: AbortSignal): Promise<T> {
  const result = await connectionOf(ctx).rpc.call(INSIGHT_CHANNEL, endpoint, payload, signal)
  if (!result.ok) throw new InsightRpcError(result.error.message, result.error.code)
  return result.value as T
}
