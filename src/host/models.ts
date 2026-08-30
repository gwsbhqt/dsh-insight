/**
 * 模型清单：一行一个模型，回答「它从哪来、现在能不能用、谁把它装进来的」。
 *
 * 和工具那一轴不同——**这一轴不需要任何 hack**。上游 llm 服务本来就提供了三个只读面：
 *   listProviders()            已经接上 adapter 的 provider 路由 = 真能用的那些
 *   listConfigurableProviders() 目录：声明了可配的 provider，且**自带 settingsNs**
 *                              —— provider 反查插件这一跳，上游直接给了答案，
 *                                 不用像工具那样靠调用栈反推
 *   listModels(provider)       该 provider 下的模型清单
 *
 * listModels 是异步签名，但实测三个 adapter 都是 `Promise.resolve(读本地配置)`，
 * 0ms、不发请求。面板是只读的，绝不能因为打开一下就替用户去敲各家 API——所以
 * 这里只调 listModels，不碰 discoverModels（那个是真联网的模型发现）。
 *
 * 激活方式（环境变量 / 存的 API key / OAuth）同样有正经的只读路径：
 * `credentials.listRecords()` 的契约就是「枚举地址与类型，永不带值」，上游写得很明白
 * ——「a surface that cannot list them cannot show what a user is authorized for」。
 * **这里只读 key 与 kind，绝不调 readRecord / resolve**，凭据的值一次也不经手。
 */
import type { ModelInventory, InventoryModel, ProviderRoute } from '../shared/types.ts'

interface LlmLike {
  listProviders(): { id: string; name: string }[]
  listConfigurableProviders(): { provider: string; displayName: string; settingsNs: string; settingsPath: string[] }[]
  listModels(provider: string): Promise<{
    provider: string
    id: string
    name: string
    description?: string
    inputModalities?: string[]
  }[]>
}

/** 凭据记录的地址是 `<scope>/<id>`，scope 就是插件的 settings 命名空间。 */
interface CredentialsLike {
  listRecords(): Promise<readonly { key: string; kind: 'api-key' | 'grant' }[]>
}

interface SettingsLike {
  describe(o: { redactSecrets: boolean }): { ns: string; value: unknown }[]
}

/** 顺着 settingsPath 往下取，拿这条 provider 自己那一段配置。 */
function at(value: unknown, path: readonly string[]): unknown {
  let cur = value
  for (const seg of path) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[seg]
  }
  return cur
}

/** 配置里写的环境变量名（只要名字，不碰值）。 */
function apiKeyEnvOf(settings: SettingsLike | undefined, route: ProviderRoute): string | undefined {
  if (settings === undefined || route.settingsNs === undefined) return undefined
  const ns = settings.describe({ redactSecrets: true }).find(d => d.ns === route.settingsNs)
  const own = at(ns?.value, route.settingsPath ?? [])
  const env = (own as { apiKeyEnv?: unknown } | null)?.apiKeyEnv
  return typeof env === 'string' && env !== '' ? env : undefined
}

interface DefaultModelLike {
  currentSelection(): { provider: string; model: string; reasoningEffort?: string } | undefined
}

function isLlm(value: unknown): value is LlmLike {
  const v = value as Partial<LlmLike> | null
  return v != null && typeof v.listProviders === 'function'
    && typeof v.listConfigurableProviders === 'function' && typeof v.listModels === 'function'
}

/** 采集模型清单。llm 服务缺席（精简 profile）时返回空清单而不是报错。 */
export async function collectModels(ctx: {
  get(name: string): unknown
}): Promise<ModelInventory> {
  const llm = ctx.get('llm')
  if (!isLlm(llm)) return { models: [], providers: [] }

  const wired = llm.listProviders()
  const wiredIds = new Set(wired.map(p => p.id))
  const directory = llm.listConfigurableProviders()
  const declared = new Map(directory.map(d => [d.provider, d]))

  // 接线的排前面；目录里声明了但没接线的（用户还没配）跟在后面
  const providers: ProviderRoute[] = []
  for (const p of wired) {
    const d = declared.get(p.id)
    const route: ProviderRoute = { id: p.id, name: p.name, wired: true }
    if (d !== undefined) {
      route.settingsNs = d.settingsNs
      route.settingsPath = [...d.settingsPath]
      route.displayName = d.displayName
    }
    providers.push(route)
  }
  for (const d of directory) {
    if (wiredIds.has(d.provider)) continue
    providers.push({
      id: d.provider,
      name: d.displayName,
      wired: false,
      settingsNs: d.settingsNs,
      settingsPath: [...d.settingsPath],
      displayName: d.displayName,
    })
  }

  // 只问接线了的 provider——没接线的没有 adapter，问了必然抛错
  const models: InventoryModel[] = []
  for (const p of wired) {
    let listed: Awaited<ReturnType<LlmLike['listModels']>>
    try {
      listed = await llm.listModels(p.id)
    } catch {
      continue // 某个 adapter 出问题不该让整张清单空掉
    }
    for (const m of listed) {
      const model: InventoryModel = { provider: p.id, id: m.id, name: m.name }
      if (m.description !== undefined && m.description !== '') model.description = m.description
      if (m.inputModalities !== undefined && m.inputModalities.length > 0) model.inputModalities = [...m.inputModalities]
      models.push(model)
    }
  }

  // 激活方式：先看凭据库里存没存（存了才分得清 api-key 与 oauth），再看 apiKeyEnv
  let records: readonly { key: string; kind: 'api-key' | 'grant' }[] = []
  try {
    records = await (ctx.get('credentials') as CredentialsLike | undefined)?.listRecords() ?? []
  } catch {
    records = [] // 没挂凭据服务、或者存储读不了，都按「没有记录」处理
  }
  const kindOf = new Map<string, 'api-key' | 'grant'>()
  for (const r of records) {
    const cut = String(r.key).indexOf('/')
    if (cut > 0) kindOf.set(`${String(r.key).slice(0, cut)}/${String(r.key).slice(cut + 1)}`, r.kind)
  }
  const settings = ctx.get('settings') as SettingsLike | undefined
  for (const route of providers) {
    const stored = route.settingsNs === undefined ? undefined : kindOf.get(`${route.settingsNs}/${route.id}`)
    const env = apiKeyEnvOf(settings, route)
    if (stored === 'grant') route.auth = 'oauth'
    else if (stored === 'api-key') route.auth = 'api-key'
    else if (env !== undefined) route.auth = 'env'
    else route.auth = 'none'
    if (env !== undefined) route.authEnv = env
  }

  const inventory: ModelInventory = { models, providers }
  const chosen = (ctx.get('agentDefaultModel') as DefaultModelLike | undefined)?.currentSelection?.()
  if (chosen !== undefined && typeof chosen.provider === 'string' && typeof chosen.model === 'string') {
    inventory.default = { provider: chosen.provider, model: chosen.model }
    if (typeof chosen.reasoningEffort === 'string') inventory.default.reasoningEffort = chosen.reasoningEffort
  }
  return inventory
}
