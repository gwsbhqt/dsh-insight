/**
 * 依赖关系的纯计算：服务索引、插件间的确定边、影响面闭包。
 *
 * 为什么这里没有"画图"：实测这张图是星形而非网状——169 个插件只有 148 条确定边，
 * 75 个不连任何人，无环、最深 4 层，而 60 个服务里 56 个恰好一个提供者。
 * 插件之间不直接相连，是**经由服务**相连的，所以表达形式是服务表 + 一度邻域 + 影响面，
 * 不是全图画布。这三样都只需要下面这几个索引。
 */
import type { PluginGraphNode } from './types.ts'

export interface ServiceEntry {
  service: string
  /** 唯一提供者的插件 id；内置服务或无人提供时没有。 */
  provider?: string
  /** 多提供者时的全部候选（仅当 provider 缺省且候选 > 1）。 */
  candidates?: string[]
  /** 声明依赖该服务的插件 id。 */
  consumers: string[]
  /** 运行时有、但没有插件提供 = cordis/宿主内置，不是缺失。 */
  builtin: boolean
}

export interface GraphIndex {
  /** 插件 id → 它依赖的插件 id（只有唯一候选才连边，不伪造关系）。 */
  dependsOn: Map<string, Set<string>>
  /** 插件 id → 依赖它的插件 id。 */
  dependedBy: Map<string, Set<string>>
  /** 服务表，按消费者数降序——枢纽自然浮到最前。 */
  services: ServiceEntry[]
  /** 服务名 → 服务表项。 */
  serviceOf: Map<string, ServiceEntry>
  /**
   * host 是否给 requires 标了 builtin。老 host（改完没重启）不标，此时分不清
   * 「cordis 内置服务」与「真的没人提供」——就不拿它当信号，宁可少报也不误报。
   */
  knowsBuiltin: boolean
}

export function buildGraphIndex(nodes: PluginGraphNode[]): GraphIndex {
  const dependsOn = new Map<string, Set<string>>()
  const dependedBy = new Map<string, Set<string>>()
  const serviceOf = new Map<string, ServiceEntry>()
  const ensure = (service: string): ServiceEntry => {
    let entry = serviceOf.get(service)
    if (entry === undefined) {
      entry = { service, consumers: [], builtin: false }
      serviceOf.set(service, entry)
    }
    return entry
  }

  for (const node of nodes) {
    dependsOn.set(node.id, new Set())
    dependedBy.set(node.id, new Set())
  }
  for (const node of nodes) {
    for (const provided of node.provides) {
      const entry = ensure(provided.service)
      if (entry.provider === undefined && entry.candidates === undefined) entry.provider = node.id
      else {
        // 第二个提供者出现：降级为候选列表，不选边
        entry.candidates = [...(entry.candidates ?? (entry.provider === undefined ? [] : [entry.provider])), node.id]
        delete entry.provider
      }
    }
  }
  for (const node of nodes) {
    for (const required of node.requires) {
      const entry = ensure(required.service)
      entry.consumers.push(node.id)
      if (required.builtin === true) entry.builtin = true
      if (required.providers.length === 1) {
        const provider = required.providers[0]!
        if (provider !== node.id) {
          dependsOn.get(node.id)?.add(provider)
          dependedBy.get(provider)?.add(node.id)
        }
      }
    }
  }

  const services = [...serviceOf.values()].sort(
    (a, b) => b.consumers.length - a.consumers.length || a.service.localeCompare(b.service),
  )
  const knowsBuiltin = nodes.some(n => n.requires.some(r => r.builtin !== undefined))
  return { dependsOn, dependedBy, services, serviceOf, knowsBuiltin }
}

/**
 * 影响面：禁用某个插件会波及谁，按跳数分组（反向可达的传递闭包）。
 * 这是全场唯一真需要图算法的问题，但输出是分组列表而不是图。
 */
export function impactHops(index: GraphIndex, id: string, maxHops = 8): string[][] {
  const hops: string[][] = []
  const seen = new Set([id])
  let front = new Set([id])
  while (front.size > 0 && hops.length < maxHops) {
    const next = new Set<string>()
    for (const from of front) {
      for (const to of index.dependedBy.get(from) ?? []) {
        if (seen.has(to)) continue
        seen.add(to)
        next.add(to)
      }
    }
    if (next.size === 0) break
    hops.push([...next])
    front = next
  }
  return hops
}

/**
 * 该插件依赖的服务里，没有任何插件提供、且不是内置的——这是真问题。
 * @param knowsBuiltin - host 是否具备内置服务识别能力；不具备时一律返回空，
 *   因为此时「无人提供」既可能是真缺失也可能是内置服务，报出来必然一半是假的。
 */
export function missingProviders(node: PluginGraphNode, knowsBuiltin = true): string[] {
  if (!knowsBuiltin) return []
  return node.requires.filter(r => r.providers.length === 0 && r.builtin !== true).map(r => r.service)
}
