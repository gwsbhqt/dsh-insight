// @vitest-environment jsdom
/**
 * 「立即重启」那一行的界面契约：会话在跑就置灰、要点两次才动手、
 * host 太旧没这个端点就整行不显示。
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { RestartRow } from '../src/client/components/RestartRow.tsx'
import { zh } from '../src/client/locale.ts'
import type { HostStatus, RestartAck } from '../src/shared/types.ts'

/** 把词典按 {name} 模板套进去，形状对齐宿主真实的 t。 */
const t = ((key: string, params?: Record<string, unknown>) => {
  const text = zh[key as keyof typeof zh] ?? key
  return params === undefined
    ? text
    : text.replace(/\{(\w+)\}/gu, (whole, name: string) => String(params[name] ?? whole))
}) as never

interface Calls { endpoint: string; }

function fakeCtx(replies: Record<string, unknown>, calls: Calls[] = []) {
  const connection = {
    rpc: {
      call: (_channel: string, endpoint: string) => {
        calls.push({ endpoint })
        const value = replies[endpoint]
        // 端点不存在时旧 host 的信封是坏的，传输层解不出来直接抛——照实模拟这个形状
        if (value === undefined) return Promise.reject(new Error('invalid server-response message'))
        return Promise.resolve({ ok: true, value })
      },
    },
  }
  return { get: (name: string) => (name === 'connection' ? connection : undefined) } as never
}

const mounted: { root: Root; host: HTMLElement }[] = []
afterEach(() => {
  for (const m of mounted.splice(0)) {
    act(() => m.root.unmount())
    m.host.remove()
  }
})

async function render(ctx: never): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  mounted.push({ root, host })
  await act(async () => { root.render(<RestartRow ctx={ctx} t={t} />) })
  // 让轮询那一发 RPC 的 then 链跑完
  await act(async () => { await Promise.resolve() })
  return host
}

const status = (patch: Partial<HostStatus> = {}): HostStatus => ({ boot: '1-1', canRestart: true, running: 0, ...patch })

it('有会话正在执行就置灰，并说清楚在等什么', async () => {
  const host = await render(fakeCtx({ 'host/status': status({ running: 2 }) }))
  const button = host.querySelector('button')
  expect(button?.disabled).toBe(true)
  expect(host.textContent).toContain('2 个会话正在执行')
})

it('空闲时可点；第一下只进确认态，第二下才真去调 host/restart', async () => {
  const calls: Calls[] = []
  const ack: RestartAck = { ok: true, boot: '1-1', pid: 9, logOut: '/tmp/o', logErr: '/tmp/e' }
  const host = await render(fakeCtx({ 'host/status': status(), 'host/restart': ack }, calls))
  const button = host.querySelector('button')
  expect(button?.disabled).toBe(false)
  expect(button?.textContent).toBe(zh['restart.now'])

  await act(async () => { button?.click() })
  expect(button?.textContent).toBe(zh['restart.confirm'])
  // 关键：第一下不许动手
  expect(calls.some(c => c.endpoint === 'host/restart')).toBe(false)

  await act(async () => { button?.click() })
  await act(async () => { await Promise.resolve() })
  expect(calls.some(c => c.endpoint === 'host/restart')).toBe(true)
})

it('被进程守护接管时按不动，且指名道姓说是谁在管', async () => {
  const host = await render(fakeCtx({ 'host/status': status({ canRestart: false, supervisor: 'systemd' }) }))
  expect(host.querySelector('button')?.disabled).toBe(true)
  expect(host.textContent).toContain('systemd')
})

it('问不到 host 状态时照常显示、按不动，并把最可能的原因直说', async () => {
  // 这一条钉住的是一个真实踩过的坑：host 比前端旧时端点不存在，而旧 host 回的
  // 错误信封本身是坏的（少了传输层要求的 details），浏览器拿到的是 schema 校验错、
  // 不是我们的错误码。所以判据只能是「问到了没有」，不能是「错误码是哪一种」。
  const host = await render(fakeCtx({}))
  const button = host.querySelector('button')
  expect(button).not.toBe(null) // 藏起来正好藏在唯一需要它的时刻
  expect(button?.disabled).toBe(true)
  expect(host.textContent).toContain('手动重启一次 dsh')
})

it('按钮上带重启图标', async () => {
  const host = await render(fakeCtx({ 'host/status': status() }))
  expect(host.querySelector('button svg')).not.toBe(null)
})

it('确认态 2 秒不点就自己退回「立即重启」——误点的人什么都不用做', async () => {
  const host = await render(fakeCtx({ 'host/status': status() }))
  const button = host.querySelector('button')
  await act(async () => { button?.click() })
  expect(button?.textContent).toBe(zh['restart.confirm'])
  // 真等一次，钉死的是「会自己回去」这件事本身
  await act(async () => { await new Promise(r => setTimeout(r, 2300)) })
  expect(button?.textContent).toBe(zh['restart.now'])
}, 10000)
