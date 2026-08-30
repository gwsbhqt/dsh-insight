/**
 * 自助重启：按当前进程原来的启动方式再拉起一个 dsh，然后把自己关掉。
 *
 * 做法整体照搬 dsh-market（https://github.com/dsh-market/dsh-market 的
 * src/restart.ts，最早由 #14 @ysyyhhh 贡献）。那边踩过的坑这里一个都不敢省：
 *   - 老进程还占着端口，新进程起来就 EADDRINUSE 当场死掉（#177）；
 *   - Windows 上 detached 起的新进程没有控制台，它再起的每个子进程都会弹黑窗（#40）；
 *   - Windows 默认执行策略会拒绝 dsh.ps1，必须点名 dsh.cmd（#397）；
 *   - systemd 托管时，老进程一死整个 cgroup 跟着死，接力进程也被带走——
 *     结果是「服务被杀掉且再也起不来」（#229）。
 *
 * 安全边界：这个模块只被 RPC 通道调用，而那条通道是 `authority: 'loopback'`
 * ——宿主已经挡掉了非本机、跨站点的请求，这里不再重复做同一件事。
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, resolve } from 'node:path'

/** 本次进程的启动标识：重启后必然换一个，客户端靠它认出「新进程已经起来了」。 */
export const BOOT_ID = `${String(process.pid)}-${String(Date.now())}`

/**
 * 看这台机器上的 dsh 是不是被进程守护托管着。认不出来就返回 null。
 *
 * 为什么要判、又为什么判得这么啰嗦：systemd 默认 `KillMode=control-group`，
 * 老进程一死，同一个 cgroup 里的东西全陪葬——包括本该把新进程拉起来的接力进程。
 * 于是「重启」变成了「杀掉服务并且再也起不来」。
 *
 * 两个信号缺一不可。`INVOCATION_ID` 是**会继承的**：systemd 单元的每个后代都带着它，
 * 在 Linux 上这包括普通桌面终端（shell 本身就挂在用户会话单元下）和 CI runner。
 * 只看它就等于在一大批本来好好的机器上把按钮灰掉，那比要防的问题更糟。
 * `ppid === 1` 才能区分「我就是这个单元的主进程」和「我只是它的后代」——
 * systemd 从 PID 1 fork 服务，而终端里的 node 父进程是 shell。
 *
 * 只认 systemd 是故意的。pm2 的 `pm_id` 同样会继承，而它的守护进程不是 PID 1，
 * 没有等价的第二信号，猜就会把刚才那个误判重新引回来；launchd 干脆什么标记都没有。
 * 这两种情况仍然可以用 DSH_INSIGHT_ALLOW_RESTART=0 显式关掉。
 * @param env - 进程环境变量，测试可注入。
 * @param ppid - 父进程 pid，测试可注入。
 */
export function detectedSupervisor(
  env: NodeJS.ProcessEnv = process.env,
  ppid: number = process.ppid,
): string | null {
  const set = (name: string): boolean => (env[name] ?? '') !== ''
  if ((set('INVOCATION_ID') || set('JOURNAL_STREAM')) && ppid === 1) return 'systemd'
  return null
}

/**
 * 自助重启默认开着；`DSH_INSIGHT_ALLOW_RESTART=0`（或 false/off/no）显式关掉，
 * 认出进程守护时默认也关掉——重启归它管。
 *
 * 显式写 1/true 仍然赢：已经把单元配成 `KillMode=process` 的运维在表态，
 * 这里不该替他们做主。
 * @param env - 进程环境变量，测试可注入。
 * @param ppid - 父进程 pid，测试可注入。
 */
export function restartAllowed(
  env: NodeJS.ProcessEnv = process.env,
  ppid: number = process.ppid,
): boolean {
  const flag = (env.DSH_INSIGHT_ALLOW_RESTART ?? '').trim().toLowerCase()
  if (flag !== '') return !['0', 'false', 'off', 'no'].includes(flag)
  return detectedSupervisor(env, ppid) === null
}

/**
 * 用来起子进程的真 node 可执行文件。
 *
 * Android 上内核是通过动态链接器跑 node 的，`process.execPath` 会是
 * `/apex/.../linker64`——拿它当 node 用，链接器会把第一个参数当成程序路径然后报错。
 * `process.argv0` 里是真正的 node 二进制，是绝对路径且存在时优先用它。
 * @param argv0 - `process.argv0`，测试可注入。
 * @param execPath - `process.execPath`，测试可注入。
 */
export function nodeExecutable(argv0: string | undefined = process.argv0, execPath: string = process.execPath): string {
  if (argv0 !== undefined && argv0 !== '' && isAbsolute(argv0) && existsSync(argv0)) return argv0
  return execPath
}

/** Windows 上裸 `dsh` 是个 .cmd 垫片，只有 shell 能起。 */
const WIN_CMD_SHIM = process.platform === 'win32'

/** 接力进程要原样重放的那条启动命令。 */
export function restartLaunch(): { file: string; args: string[]; cwd: string; viaShell: boolean } {
  const entry = process.argv[1]
  if (entry !== undefined && /[\\/](?:bin\.(?:js|ts)|dsh)$/u.test(entry)) {
    // 必须转成绝对路径：源码方式启动（`pnpm dsh`）传进来的是相对路径，
    // 子进程会拿自己的 cwd 去解析然后 MODULE_NOT_FOUND。cwd 跟着入口走，
    // 是为了让 execArgv 里的 tsx/esm loader 在源码启动时还能解析得到。
    const abs = resolve(entry)
    return { file: nodeExecutable(), args: [...process.execArgv, abs, ...process.argv.slice(2)], cwd: dirname(abs), viaShell: false }
  }
  return { file: 'dsh', args: [...process.argv.slice(2)], cwd: process.cwd(), viaShell: WIN_CMD_SHIM }
}

/**
 * 把启动命令翻译成当前平台真正能用的 spawn 参数。
 *
 * Windows 上 `detached` 会映射成 DETACHED_PROCESS：新进程完全没有控制台，
 * 它之后起的每个控制台子进程（比如 dsh 的沙箱工具）都会弹一个可见的 node 窗口。
 * 套一层 `powershell -WindowStyle Hidden` 能给它一个**隐藏的**控制台，子进程继承即可。
 * POSIX 保持普通的 detached spawn。
 * @param launch - restartLaunch 的结果。
 * @param platform - `process.platform`，测试可注入。
 */
export function respawnInvocation(
  launch: { file: string; args: string[]; viaShell: boolean },
  platform: NodeJS.Platform = process.platform,
): { file: string; args: string[]; viaShell: boolean; detached: boolean } {
  if (platform !== 'win32') {
    return { file: launch.file, args: launch.args, viaShell: launch.viaShell, detached: true }
  }
  // PowerShell 的单引号里只有单引号本身需要转义（写两遍）。必须点名 .cmd 垫片：
  // 裸写 `dsh` 会让 PowerShell 优先挑 dsh.ps1，而默认 Restricted 执行策略直接拒绝它。
  const quote = (part: string): string => `'${part.replace(/'/gu, "''")}'`
  const file = launch.viaShell && !/\.(?:cmd|bat)$/iu.test(launch.file) ? `${launch.file}.cmd` : launch.file
  return {
    file: 'powershell.exe',
    args: ['-NoProfile', '-WindowStyle', 'Hidden', '-Command',
      [`& ${quote(file)}`, ...launch.args.map(quote)].join(' ')],
    viaShell: false,
    detached: false,
  }
}

/**
 * 接力进程的源码：它活得比我们久，负责把替身拉起来。
 *
 * 单独抽出来是为了能**跑起来测**——这类 bug 只有真跑才现形，光看每一行都是对的。
 *
 * 它必须做三件事，一件都不能少：等端口真的静下来、起替身、然后**确认替身起来了**，
 * 没起来就写一份诊断。重启失败必须留下证据——本来该记这笔账的进程，
 * 正是刚刚退出的那个。
 * @param port - 替身必须占回的端口；不知道就退回固定延时，总比什么都不等强。
 */
export function restartHelperSource(
  spawned: { file: string; args: string[]; viaShell: boolean; detached: boolean },
  launch: { cwd: string },
  logs: { out: string; err: string },
  port: number | null,
): string {
  return [
    "const { spawn } = require('node:child_process')",
    "const fs = require('node:fs')",
    "const net = require('node:net')",
    `const file = ${JSON.stringify(spawned.file)}`,
    `const args = ${JSON.stringify(spawned.args)}`,
    `const cwd = ${JSON.stringify(launch.cwd)}`,
    `const viaShell = ${JSON.stringify(spawned.viaShell)}`,
    `const detached = ${JSON.stringify(spawned.detached)}`,
    `const logOut = ${JSON.stringify(logs.out)}`,
    `const logErr = ${JSON.stringify(logs.err)}`,
    `const port = ${JSON.stringify(port)}`,
    'const sleep = (ms) => new Promise(r => setTimeout(r, ms))',
    'const note = (line) => { try { fs.appendFileSync(logErr, `[dsh-insight] ${line}\\n`) } catch {} }',
    // 「端口空了」的判据是连不上，而不是能 bind：用 bind 去试，试探本身就会
    // 在替身最需要它的那一刻占住端口。
    'const listening = () => new Promise((resolve) => {',
    '  const probe = net.connect({ host: "127.0.0.1", port })',
    '  const done = (value) => { probe.destroy(); resolve(value) }',
    '  probe.on("connect", () => done(true))',
    '  probe.on("error", () => done(false))',
    '  setTimeout(() => done(false), 500)',
    '})',
    'const main = async () => {',
    '  if (port) {',
    '    const until = Date.now() + 30000',
    '    while (Date.now() < until && await listening()) await sleep(250)',
    '    if (await listening()) note(`port ${port} was still in use after 30s; starting anyway`)',
    // 刚释放的 socket 在 Windows 上还会在 TIME_WAIT 里待一会儿。
    '    await sleep(300)',
    '  } else {',
    '    await sleep(1500)',
    '  }',
    '  let child',
    '  try {',
    '    const out = fs.openSync(logOut, "a")',
    '    const err = fs.openSync(logErr, "a")',
    '    child = spawn(file, args, { cwd, detached, stdio: ["ignore", out, err], env: process.env, shell: viaShell })',
    // 文件不存在/不可执行，spawn 是**异步**报的；下面的 try/catch 只接得住同步抛，
    // 少了这个监听器，这种失败会和当初那个 bug 一样悄无声息。
    '    child.on("error", (error) => note(`could not start the replacement: ${error && error.message ? error.message : error}`))',
    '    child.unref()',
    '  } catch (error) {',
    '    note(`could not start the replacement: ${error && error.message ? error.message : error}`)',
    '    return',
    '  }',
    // 在 Windows 上，接力进程一 spawn 完就退出会把替身一起带走——替身还在它的
    // 进程组里，还没来得及脱离。有端口的那条路本来就会边轮询边多活一会儿，
    // 这一句是给没有端口可轮询的那条路补上同样的保证。
    '  if (!port) { await sleep(3000); return }',
    '  const upBy = Date.now() + 20000',
    '  while (Date.now() < upBy && !(await listening())) await sleep(500)',
    '  if (!(await listening())) note(`the replacement did not bind port ${port} within 20s — see the output log beside this one`)',
    '}',
    'main()',
  ].join('\n')
}

/** scheduleRestart 回给调用方的记账信息。 */
export interface RestartResult {
  pid: number
  helperPid: number | undefined
  logOut: string
  logErr: string
}

/**
 * 交接给一个脱离出去的接力进程，然后关掉自己。接力进程活得比我们久
 * （detached + unref），会等我们的端口释放再起替身，日志落在临时目录。
 * @param port - 本进程正在服务的端口，交给接力进程去等，不靠猜延时。
 */
export function scheduleRestart(port: number | null = null): RestartResult {
  const launch = restartLaunch()
  const spawned = respawnInvocation(launch)
  const stamp = new Date().toISOString().replace(/[:.]/gu, '-').slice(0, 19)
  const logOut = join(tmpdir(), `dsh-insight-restart-${stamp}.out.log`)
  const logErr = join(tmpdir(), `dsh-insight-restart-${stamp}.err.log`)
  const helper = spawn(nodeExecutable(), ['-e', restartHelperSource(spawned, launch, { out: logOut, err: logErr }, port)], {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  })
  helper.unref()
  // 留出把 202 回执写回浏览器的时间，再给自己发终止信号。
  setTimeout(() => process.kill(process.pid, 'SIGTERM'), 500)
  return { pid: process.pid, helperPid: helper.pid, logOut, logErr }
}
