/**
 * 端点路由：把 INSIGHT_CHANNEL 上的 (endpoint, payload) 分发到对应采集器。
 * 信封格式参考 dsh-codex-subscription 的 publicError 模式。
 */
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { EntryTree } from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-app-boot'
import type { HostStatus, InsightEndpoint, InsightResult, InsightSummary, ModelInventory, PresetInventory, RestartAck, SettingsView, ToggleResult, ToolInventory } from '../shared/types.ts'
import { buildSummary } from '../shared/summary.ts'
import { collectFiles, profileNameOf, readFilePreview, assertAllowedPath, authorizePreviewPath } from './files.ts'
import { openInEditor } from './open.ts'
import { collectPresets, presetPaths } from './presets.ts'
import { applyToggle } from './toggle.ts'
import { BOOT_ID, detectedSupervisor, restartAllowed, scheduleRestart } from './restart.ts'
import { layerViews, ownAnchor, rebuildLayers, replayLayers, type PatchLayer } from './layers.ts'
import { toFinalConfig, type LiveEntryState } from './final.ts'
import { collectGraph } from './graph.ts'
import { collectModels } from './models.ts'
import { observedTools } from './tool-observer.ts'
import { scannedTools } from './tool-scan.ts'
import { collectNodes, collectTree } from './tree.ts'

export type InsightProducer = (payload: unknown, signal: AbortSignal) => Promise<unknown> | unknown

/** 当前进程的 dsh home：从运行时拿，兜底环境变量与默认路径。 */
function homeOf(ctx: Context): string {
  return ctx.dshHomePath?.() ?? process.env.DSH_HOME ?? join(homedir(), '.dsh')
}

/** 当前进程的重建上下文：home 与 profile 名都从运行时拿。 */
function layersOf(ctx: Context): PatchLayer[] {
  return rebuildLayers({ profileName: profileNameOf(ctx), anchor: ownAnchor(), home: homeOf(ctx) })
}

/** 每条 entry 的来源层：短 ID 在运行时唯一时才归因，避免不同 realm 的同名节点串线。 */
export function originResolver(layers: PatchLayer[], runtimeIds: Iterable<string>): (shortId: string) => string | undefined {
  const { hits } = replayLayers(layers)
  const counts = new Map<string, number>()
  for (const id of runtimeIds) {
    const sep = id.lastIndexOf(EntryTree.sep)
    const shortId = sep < 0 ? id : id.slice(sep + 1)
    counts.set(shortId, (counts.get(shortId) ?? 0) + 1)
  }
  const origin = new Map<string, string>()
  hits.forEach((layerHits, i) => {
    const label = layers[i]?.label
    if (label === undefined) return
    for (const h of layerHits) if (!origin.has(h.id)) origin.set(h.id, label)
  })
  return id => counts.get(id) === 1 ? origin.get(id) : undefined
}

/** 模块说明符 → 包磁盘目录：从 profile 根 require.resolve（软链/层级 node_modules 都覆盖）。 */
function pathResolverOf(ctx: Context): (name: string) => string | undefined {
  const require = createRequire(join(homeOf(ctx), 'profiles', profileNameOf(ctx), 'noop.js'))
  return name => {
    if (name === '' || name.startsWith('cordis:')) return undefined
    try {
      return dirname(require.resolve(`${name}/package.json`))
    } catch {
      return undefined // file URL、裸路径、运行时动态名等解析不到的就不标
    }
  }
}

/** loader 实况投影：归一化 id（嵌套 id 取最后一段，如 include:llm → llm）+ 有效 disabled（Entry.disabled 含父级传递）。 */
function liveStates(ctx: Context): LiveEntryState[] {
  const states: LiveEntryState[] = []
  for (const entry of ctx.loader.entries()) {
    if (entry.options.group) continue // group 行是容器，不是插件
    const sep = entry.id.lastIndexOf(EntryTree.sep)
    states.push({ id: sep < 0 ? entry.id : entry.id.slice(sep + 1), disabled: entry.disabled })
  }
  return states
}

/**
 * 现在有几个会话正在执行。
 *
 * 判据是 agent 自己报的状态（idle / running），不是「有没有打开的会话」——
 * 开着一个对话窗口不算忙，只有真在跑的那一轮才算。子 agent 也算：它在跑，
 * 就说明有活正在进行，重启一样会把它打断。
 * agents 服务缺席（精简 profile）时没有 agent，自然也没有在跑的会话。
 */
function runningAgents(ctx: Context): number {
  const agents = ctx.get('agents') as { list(): { status: string }[] } | undefined
  if (agents === undefined) return 0
  try {
    return agents.list().filter(a => a.status === 'running').length
  } catch {
    return 0 // 读不到就当不忙——这里只用来置灰按钮，不该把整个端点拖垮
  }
}

/** 本进程正在服务的端口，交给接力进程去等；webServer 缺席就返回 null（退回固定延时）。 */
function servingPort(ctx: Context): number | null {
  const server = ctx.get('webServer') as { port?: unknown } | undefined
  const port = server?.port
  return typeof port === 'number' && Number.isInteger(port) && port > 0 && port < 65536 ? port : null
}

/** 创建 Connection RPC handler。 */
export function createInsightHandler(ctx: Context) {
  // 一次进程只排一次重启：第二次点击落进来时老进程已经在往下走了。
  let restarting = false
  const requestedPath = (payload: unknown): string => String((payload as { path?: unknown } | null)?.path ?? '')
  const configFiles = async () => collectFiles(ctx, layersOf(ctx))
  const allowedFile = async (payload: unknown): Promise<string> => {
    const [files, presets] = await Promise.all([configFiles(), presetPaths(ctx)])
    // 预设的两个文件也是配置，且都是纯文本；它们不经过 collectFiles（那份只管
    // 宿主面的分层），所以在这里单独并进来
    return authorizePreviewPath(requestedPath(payload), files, presets.files)
  }
  const allowedOpenPath = async (payload: unknown): Promise<string> => {
    const layers = layersOf(ctx)
    const [files, presets] = await Promise.all([collectFiles(ctx, layers), presetPaths(ctx)])
    const nodes = collectNodes(ctx, { resolvePath: pathResolverOf(ctx) })
    const pluginDirs = nodes.flatMap(node => node.path === undefined ? [] : [node.path])
    return assertAllowedPath(requestedPath(payload), [
      ...files.filter(file => file.role !== 'credentials').map(file => file.path),
      ...pluginDirs,
      ...presets.dirs,
      ...presets.files,
    ])
  }
  const settingsViews = (): SettingsView[] => {
    // settings 服务缺席（精简 profile）时返回空清单而不是报错
    const settings = ctx.get('settings') as { describe(o: { redactSecrets: boolean }): { ns: string; value: unknown; base?: unknown; user?: unknown; applies: string; secrets?: { path: string[]; set: boolean }[] }[] } | undefined
    if (settings === undefined) return []
    return settings.describe({ redactSecrets: true }).map(d => {
      const view: SettingsView = {
        ns: String(d.ns),
        value: d.value ?? null,
        applies: d.applies,
        secrets: (d.secrets ?? []).map(s => ({ path: s.path.join('.'), set: s.set })),
      }
      if (d.base !== undefined) view.base = d.base
      if (d.user !== undefined) view.user = d.user
      return view
    })
  }
  const pluginTree = () => {
    const layers = layersOf(ctx)
    return collectTree(ctx, { originOf: originResolver(layers, [...ctx.loader.entries()].map(entry => entry.id)), resolvePath: pathResolverOf(ctx) })
  }
  const producers: Partial<Record<InsightEndpoint, InsightProducer>> = {
    'files/open': async payload => openInEditor(await allowedOpenPath(payload)),
    'files/read': async payload => readFilePreview(await allowedFile(payload)),
    'config/layers': () => layerViews(layersOf(ctx)),
    // 配置文件 tab：只列非 patch 文件（root 主配置/settings/credentials）；
    // patch 层的文件已经在分层合并的行上，不重复列
    'files/list': async () => (await collectFiles(ctx, layersOf(ctx))).filter(f => f.role !== 'patch'),
    'config/final': () => {
      const { final, events } = replayLayers(layersOf(ctx))
      return toFinalConfig(final, liveStates(ctx), events)
    },
    'settings/list': () => settingsViews(),
    /**
     * 唯一的写路径：在 profile 补丁层里禁用 / 启用一个插件。
     *
     * 「运行时有几份」这一步在这边算而不在客户端算：撞名判断决定要不要落盘，
     * 这种判断不能建立在浏览器传上来的数字上。
     */
    'config/toggle': async (payload): Promise<ToggleResult> => {
      const body = (payload ?? {}) as { id?: unknown; disabled?: unknown }
      const id = typeof body.id === 'string' ? body.id : ''
      const disabled = body.disabled === true
      const layers = layersOf(ctx)
      const profile = layers.find(l => l.kind === 'profile')
      const home = homeOf(ctx)
      const path = profile?.patchPath ?? join(home, 'profiles', profileNameOf(ctx), 'cordis.patch.yml')
      // 这一条在**重放出来的配置**里出现几次——0 是补丁命不中，>1 才是真撞名。
      //
      // 判据必须是配置而不是运行时。补丁作用的对象就是这份配置（宿主面那一份），
      // 而运行时那棵树里还混着预设挂载时另起的一套：tool-bash 在运行时有两份
      // （include:tool-bash 与 include:agent-presets:tool-bash），但配置里只有一份，
      // profile 补丁根本够不着预设那一份。拿运行时计数会同时犯两个相反的错——
      // 把一批本来能写的拦下来，又放行 persona 这种只存在于预设里的（配置里 0 份），
      // 给它写一条永远命不中的补丁。
      const { final: replayed } = replayLayers(layers)
      const matches = replayed.filter(e => e.id === id).length
      // 「不写这一行的话会是什么状态」：把我们要写的那一层摘掉再重放一遍。
      // 目标状态跟它一样，这一行就是废话——交给 applyToggle 走删除而不是写 false。
      // disabled 是 `!!js` 表达式时判不了（Boolean({__jsExpr}) 恒为 true），一律不删。
      const { final: base } = replayLayers(layers.filter(l => l !== profile))
      const baseEntry = base.find(e => e.id === id)
      const isExpr = typeof baseEntry?.disabled === 'object' && baseEntry.disabled !== null
      const redundant = !isExpr && Boolean(baseEntry?.disabled) === disabled
      return applyToggle({ path, home, id, disabled, matches, redundant })
    },
    // 预设清单：会话开起来时挑的那份 agent 组合，从哪来、谁写的、里面装了什么
    'presets/list': (): Promise<PresetInventory> => collectPresets(ctx),
    'plugins/tree': () => pluginTree(),
    'plugins/graph': () => collectGraph(ctx),
    // 模型清单：全部走 llm 服务的只读面，不联网、不碰 discoverModels
    'models/list': (): Promise<ModelInventory> => collectModels(ctx),
    // 工具清单：运行时观察优先，没观察到的插件退回扫它的构建产物。
    // 两个来源都带 source 标记透传给界面，不混为一谈。
    'plugins/tools': (): ToolInventory => {
      const resolvePath = pathResolverOf(ctx)
      const nodes = collectNodes(ctx, { resolvePath })
      const graph = collectGraph(ctx)
      // 包名 → 插件短 id；同名短 id 有多份时，只要有一份在跑就算可用
      const pluginOfPkg = new Map<string, string>()
      const enabledOf = new Map<string, boolean>()
      for (const n of nodes) {
        if (n.name !== '' && !pluginOfPkg.has(n.name)) pluginOfPkg.set(n.name, n.shortId)
        enabledOf.set(n.shortId, (enabledOf.get(n.shortId) ?? false) || n.state === 'active')
      }
      // 扫描候选取并集，两条判据各补对方的盲区：
      //   注入 tools 服务 —— 准，但禁用的插件没有 fiber、读不到 inject，会漏
      //   名字以 tool- 开头 —— 覆盖禁用的那些，而它们恰恰是最该被看到的
      // 只有前者会漏掉 plan-mode（注册了 exit_plan_mode，名字不带 tool-）
      const injectsTools = new Set(
        graph.filter(g => g.requires.some(r => r.service === 'tools')).map(g => g.id),
      )
      const canRegister = (n: { id: string; shortId: string }): boolean =>
        injectsTools.has(n.id) || n.shortId.startsWith('tool-')
      const runtime = observedTools()
      const seen = new Set(runtime.map(t => `${t.pkg ?? ''} ${t.name}`))
      const fallback: ReturnType<typeof observedTools> = []
      for (const n of nodes) {
        if (!canRegister(n) || n.path === undefined || n.name === '') continue
        if (runtime.some(t => t.pkg === n.name)) continue // 运行时已覆盖，不必扫
        for (const t of scannedTools(n.path, n.name)) {
          const key = `${t.pkg ?? ''} ${t.name}`
          if (seen.has(key)) continue
          seen.add(key)
          fallback.push(t)
        }
      }
      const tools = [...runtime, ...fallback]
        .map(t => {
          const plugin = t.pkg === undefined ? undefined : pluginOfPkg.get(t.pkg)
          const enabled = plugin === undefined ? undefined : enabledOf.get(plugin)
          return {
            ...t,
            ...(plugin === undefined ? {} : { plugin }),
            ...(enabled === undefined ? {} : { enabled }),
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name))
      return { tools, observed: runtime.length > 0 }
    },
    // 设置页那 556px 只要六个数字：全在 host 算完，不把 174 个节点发给客户端
    'insight/summary': (): InsightSummary => {
      const layers = layersOf(ctx)
      const { final, events } = replayLayers(layers)
      return buildSummary(
        pluginTree(),
        collectGraph(ctx),
        settingsViews(),
        layerViews(layers),
        toFinalConfig(final, liveStates(ctx), events),
      )
    },
    // 「立即重启」那颗按钮要不要置灰，全看这一份：进程身份 + 能不能重启 + 忙不忙
    'host/status': (): HostStatus => {
      const supervisor = detectedSupervisor()
      return {
        boot: BOOT_ID,
        canRestart: restartAllowed(),
        ...(supervisor === null ? {} : { supervisor }),
        running: runningAgents(ctx),
      }
    },
    // 真正动手：拉一个脱离出去的接力进程，然后给自己发 SIGTERM。
    // 三道闸都在这里再判一次——界面的置灰只是提示，不能当成保护。
    'host/restart': (): RestartAck => {
      const supervisor = detectedSupervisor()
      if (!restartAllowed()) {
        return {
          ok: false,
          reason: 'off',
          message: supervisor === null
            ? 'self-restart is turned off (DSH_INSIGHT_ALLOW_RESTART)'
            : `self-restart is off under ${supervisor}`,
          ...(supervisor === null ? {} : { supervisor }),
        }
      }
      const running = runningAgents(ctx)
      if (running > 0) {
        return { ok: false, reason: 'busy', message: `${String(running)} session(s) still running`, running }
      }
      if (restarting) return { ok: false, reason: 'scheduled', message: 'a restart is already under way' }
      restarting = true
      try {
        // helperPid 可能是 undefined（spawn 没拿到 pid），exactOptionalPropertyTypes
        // 下不能直接铺进去——有值才带上这个键
        const { helperPid, ...result } = scheduleRestart(servingPort(ctx))
        return { ok: true, boot: BOOT_ID, ...result, ...(helperPid === undefined ? {} : { helperPid }) }
      } catch (error) {
        restarting = false
        return { ok: false, reason: 'failed', message: error instanceof Error ? error.message : String(error) }
      }
    },
  }
  return async (endpoint: string, payload: unknown, signal: AbortSignal): Promise<InsightResult<unknown>> => {
    const produce = producers[endpoint as InsightEndpoint]
    if (produce === undefined) {
      // 错误码必须落在传输层的枚举内，**且 details 必须按那个 code 的形状写全**，
      // 否则客户端连信封都解不出来，只能吐一坨 zod 校验残骸。
      // 端点不存在的现实成因只有一个：host 进程比前端 bundle 旧（改完没重启），所以直说。
      return {
        ok: false,
        error: {
          code: 'bad-request',
          message: `endpoint ${endpoint} not found — host 可能比前端旧，重启 dsh 后生效`,
          details: { issues: [] },
        },
      }
    }
    try {
      signal.throwIfAborted()
      return { ok: true, value: await produce(payload, signal) }
    } catch (error) {
      if (signal.aborted) throw error
      return { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error), details: {} } }
    }
  }
}
