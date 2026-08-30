/** tab 首次激活拉一次 + 手动刷新；无订阅无轮询。 */
import { useCallback, useEffect, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { InsightEndpoint } from '../../shared/types.ts'
import { callInsight } from '../rpc.ts'

export interface RpcState<T> {
  data?: T
  error?: string
  loading: boolean
  reload: () => void
}

export function useRpc<T>(ctx: ClientContext, endpoint: InsightEndpoint, active: boolean): RpcState<T> {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: false })
  const [generation, setGeneration] = useState(0)
  const reload = useCallback(() => setGeneration(g => g + 1), [])
  useEffect(() => {
    if (!active) return
    const controller = new AbortController()
    setState(s => s.data === undefined ? { loading: true } : { data: s.data, loading: true })
    callInsight<T>(ctx, endpoint, {}, controller.signal)
      // 传输层可能忽略 AbortSignal 照常 resolve：成功路径也要挡 aborted，否则旧的慢响应会盖掉新数据
      .then(data => { if (!controller.signal.aborted) setState({ data, loading: false }) })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ error: error instanceof Error ? error.message : String(error), loading: false })
      })
    return () => controller.abort()
  }, [ctx, endpoint, active, generation])
  return { ...state, reload }
}
