/**
 * 包的出处：官方 / 三方 / 本地。
 *
 * 判据只有两条，都不依赖任何名单——名单会过期，而且写名单本身就是在替上游做决定：
 *   1. 解析出来的磁盘路径不在 node_modules 里 = **本地目录**（link: 进来的、你自己写的）
 *   2. 包名在 @deepseek-ai 这个 scope 下 = **官方**（npm 的 scope 是有主的，冒充不了）
 * 剩下的就是三方。
 *
 * 本地优先于 scope：把官方包 link 成本地那一份之后，跑的已经是你磁盘上的代码，
 * 这时再说它「官方」是误导。
 *
 * cordis:group / cordis:include 这类虚拟条目**根本不是包**，不参与分类——
 * 给它们贴「三方」是撒谎。同理，解析不出名字的（匿名 entry）也不分类。
 */
export type Vendor = 'official' | 'third-party' | 'local'

/** 官方 scope：dsh 与 cordis 全都发在这个 scope 下。 */
const OFFICIAL_SCOPE = '@deepseek-ai/'

/** loader 用 `cordis:` 前缀表示框架自带的虚拟插件，不对应任何 npm 包。 */
const VIRTUAL = 'cordis:'

const IN_NODE_MODULES = /[\\/]node_modules[\\/]/

export function vendorOf(pkg: { name: string; path?: string | undefined }): Vendor | undefined {
  if (pkg.name === '' || pkg.name.startsWith(VIRTUAL)) return undefined
  if (pkg.path !== undefined && pkg.path !== '' && !IN_NODE_MODULES.test(pkg.path)) return 'local'
  return pkg.name.startsWith(OFFICIAL_SCOPE) ? 'official' : 'third-party'
}

/** 路径里最后一段 node_modules 之后的包名（`node_modules/@scope/pkg/` 或 `node_modules/pkg/`）。 */
const PKG_IN_PATH = /[\\/]node_modules[\\/](@[\w.-]+[\\/][\w.-]+|[\w.-]+)(?=[\\/]|$)/g

/**
 * 只知道一个磁盘目录时的出处判定（预设的 root 就是这种情况：它是目录，不是包）。
 *
 * 与 {@link vendorOf} 是同一条规则的另一种入口——**判据必须只有一份**，否则会出现
 * 「同一个包在这张表是官方、在那张表是三方」。这里比它多做一件事：把包名也认出来，
 * 因为三方预设最该回答的问题是「哪个插件把它带进来的」。
 * @param path - 绝对目录路径。
 * @returns 出处；在 node_modules 里时连带给出包名。
 */
export function vendorOfPath(path: string): { vendor: Vendor; pkg?: string } {
  if (path === '') return { vendor: 'local' }
  // 嵌套 node_modules 时最后一段才是真正拥有这个目录的包
  const hits = [...path.matchAll(PKG_IN_PATH)]
  const pkg = hits.at(-1)?.[1]?.replace(/\\/g, '/')
  if (pkg === undefined) return { vendor: 'local' }
  return pkg.startsWith(OFFICIAL_SCOPE) ? { vendor: 'official', pkg } : { vendor: 'third-party', pkg }
}

/** 值得标出来的出处。官方是常态，常态不该有任何表达。 */
export function isForeign(v: Vendor | undefined): boolean {
  return v === 'third-party' || v === 'local'
}

/**
 * 把出处按几种键预先算好。
 *
 * 各根轴手里的线索不一样——按服务拿到的是提供者的完整 id，按工具拿到的是包名，
 * 按模型拿到的是插件短 id。规则只有一份，查法给三种，免得每根轴各自拼一遍
 * （拼错一处就会出现「同一个包在这张表是官方、在那张表是三方」）。
 */
export interface VendorIndex {
  /** 完整 entry id，如 include:agent-presets:tool-bash。 */
  ofPlugin(id: string): Vendor | undefined
  /** 短 id，如 tool-bash。同名多份时按包名归一，出处必然一致。 */
  ofShort(shortId: string): Vendor | undefined
  /** 包名，如 @deepseek-ai/dsh-tool-bash。 */
  ofPackage(name: string): Vendor | undefined
}

interface VendorSource {
  id: string
  shortId: string
  name: string
  path?: string | undefined
  children: VendorSource[]
}

export function buildVendorIndex(nodes: readonly VendorSource[]): VendorIndex {
  const byId = new Map<string, Vendor>()
  const byShort = new Map<string, Vendor>()
  const byPackage = new Map<string, Vendor>()
  const walk = (list: readonly VendorSource[]): void => {
    for (const n of list) {
      const v = vendorOf(n)
      if (v !== undefined) {
        byId.set(n.id, v)
        if (!byShort.has(n.shortId)) byShort.set(n.shortId, v)
        if (!byPackage.has(n.name)) byPackage.set(n.name, v)
      }
      walk(n.children)
    }
  }
  walk(nodes)
  return {
    ofPlugin: id => byId.get(id),
    ofShort: shortId => byShort.get(shortId),
    ofPackage: name => byPackage.get(name),
  }
}
