/**
 * 自助重启：三道闸（谁不许重启）、平台差异（Windows 的隐藏控制台），
 * 以及接力进程「等端口真的空了再起替身」这条最要命的时序——它必须真跑才测得出来。
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { createInsightHandler } from '../src/host/rpc.ts'
import {
  detectedSupervisor,
  respawnInvocation,
  restartAllowed,
  restartHelperSource,
} from '../src/host/restart.ts'
import type { HostStatus, RestartAck } from '../src/shared/types.ts'

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

// ---------- 谁不许重启 ----------

it('systemd 要两个信号都对上：光有继承来的 INVOCATION_ID 不算', () => {
  // 桌面终端、CI runner 都会继承这个变量，只看它就会把一大批好机器的按钮灰掉
  expect(detectedSupervisor({ INVOCATION_ID: 'abc' }, 4242)).toBe(null)
  expect(detectedSupervisor({ INVOCATION_ID: 'abc' }, 1)).toBe('systemd')
  expect(detectedSupervisor({ JOURNAL_STREAM: '8:12345' }, 1)).toBe('systemd')
  expect(detectedSupervisor({}, 1)).toBe(null)
})

it('默认开着；进程守护托管时默认关掉；显式写 1 仍然赢', () => {
  expect(restartAllowed({}, 4242)).toBe(true)
  expect(restartAllowed({ INVOCATION_ID: 'abc' }, 1)).toBe(false)
  expect(restartAllowed({ DSH_INSIGHT_ALLOW_RESTART: '0' }, 4242)).toBe(false)
  expect(restartAllowed({ DSH_INSIGHT_ALLOW_RESTART: 'false' }, 4242)).toBe(false)
  // 已经把单元配成 KillMode=process 的运维在表态，不该被我们的检测推翻
  expect(restartAllowed({ DSH_INSIGHT_ALLOW_RESTART: '1', INVOCATION_ID: 'abc' }, 1)).toBe(true)
})

// ---------- 平台差异 ----------

it('POSIX 直接 detached 起；Windows 套隐藏窗口的 PowerShell 并点名 .cmd', () => {
  const launch = { file: 'dsh', args: ['--profile', "it's"], viaShell: true }
  expect(respawnInvocation(launch, 'linux')).toEqual({ file: 'dsh', args: ['--profile', "it's"], viaShell: true, detached: true })

  const win = respawnInvocation(launch, 'win32')
  expect(win.file).toBe('powershell.exe')
  expect(win.detached).toBe(false) // DETACHED_PROCESS 会让后续每个子进程弹黑窗
  expect(win.args).toContain('-WindowStyle')
  expect(win.args).toContain('Hidden')
  const command = win.args[win.args.length - 1] ?? ''
  // 裸 dsh 会让 PowerShell 优先挑 dsh.ps1，默认执行策略直接拒绝
  expect(command).toContain("'dsh.cmd'")
  // 单引号内的单引号写两遍
  expect(command).toContain("'--profile' 'it''s'")
})

// ---------- 接力进程：等端口空了再起替身 ----------

const cleanup: (() => void)[] = []
afterEach(() => {
  for (const fn of cleanup.splice(0)) fn()
})

function freePort(): Promise<number> {
  return new Promise(resolve => {
    const probe = createServer()
    probe.listen(0, '127.0.0.1', () => {
      const port = (probe.address() as { port: number }).port
      probe.close(() => resolve(port))
    })
  })
}

it('端口还被占着就不起替身，释放之后才起', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-insight-restart-'))
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }))
  const marker = join(dir, 'started')
  const port = await freePort()

  // 老进程的替身：起来就写个记号，好让测试看见它到底起没起
  const replacement = {
    file: process.execPath,
    args: ['-e', `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'up')`],
    viaShell: false,
    detached: true,
  }
  const source = restartHelperSource(replacement, { cwd: dir }, { out: join(dir, 'out.log'), err: join(dir, 'err.log') }, port)

  // 「老进程」还占着端口
  const holder = createServer()
  await new Promise<void>(resolve => holder.listen(port, '127.0.0.1', () => resolve()))

  const helper = spawn(process.execPath, ['-e', source], { stdio: 'ignore' })
  cleanup.push(() => helper.kill('SIGKILL'))

  await sleep(1200)
  // 关键断言：端口没释放就抢着起，替身会 EADDRINUSE 当场死掉且不留任何痕迹
  expect(existsSync(marker)).toBe(false)

  await new Promise<void>(resolve => holder.close(() => resolve()))
  for (let i = 0; i < 40 && !existsSync(marker); i++) await sleep(100)
  expect(existsSync(marker)).toBe(true)
}, 20000)

// ---------- 端点：忙不忙、许不许 ----------

function fakeCtx(running: number, extra: Record<string, unknown> = {}) {
  const agents = { list: () => Array.from({ length: running }, () => ({ status: 'running' })) }
  return {
    get: (name: string) => (name === 'agents' ? agents : extra[name]),
  } as never
}

async function call<T>(ctx: never, endpoint: 'host/status' | 'host/restart'): Promise<T> {
  const result = await createInsightHandler(ctx)(endpoint, {}, new AbortController().signal)
  if (!result.ok) throw new Error(result.error.message)
  return result.value as T
}

it('host/status 报出正在执行的会话数与 boot；agents 缺席算不忙', async () => {
  const busy = await call<HostStatus>(fakeCtx(2), 'host/status')
  expect(busy.running).toBe(2)
  expect(busy.boot).toMatch(/^\d+-\d+$/u)

  const bare = await call<HostStatus>({ get: () => undefined } as never, 'host/status')
  expect(bare.running).toBe(0)
})

it('有会话正在执行时 host/restart 直接拒绝——界面的置灰只是提示，判官在这边', async () => {
  const ack = await call<RestartAck>(fakeCtx(1), 'host/restart')
  expect(ack.ok).toBe(false)
  if (ack.ok) return
  expect(ack.reason).toBe('busy')
  expect(ack.running).toBe(1)
})

it('被环境变量关掉时 host/restart 拒绝，且 status 也照实说', async () => {
  const previous = process.env.DSH_INSIGHT_ALLOW_RESTART
  process.env.DSH_INSIGHT_ALLOW_RESTART = '0'
  cleanup.push(() => {
    if (previous === undefined) delete process.env.DSH_INSIGHT_ALLOW_RESTART
    else process.env.DSH_INSIGHT_ALLOW_RESTART = previous
  })
  expect((await call<HostStatus>(fakeCtx(0), 'host/status')).canRestart).toBe(false)
  const ack = await call<RestartAck>(fakeCtx(0), 'host/restart')
  expect(ack.ok).toBe(false)
  if (ack.ok) return
  expect(ack.reason).toBe('off')
})

it('未知端点的错误信封带齐 details——少了它浏览器连信封都解不出来', async () => {
  const result = await createInsightHandler(fakeCtx(0))('host/nope', {}, new AbortController().signal)
  expect(result.ok).toBe(false)
  if (result.ok) return
  expect(result.error.code).toBe('bad-request')
  // 传输层的 zod schema 对 bad-request 要求 details: { issues: [...] }
  expect(result.error).toHaveProperty('details.issues')
})
