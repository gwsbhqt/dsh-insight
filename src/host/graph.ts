/**
 * 插件依赖图采集：复用插件树的节点采集，再把"服务名"解析成插件间的关系——
 * 提供者的 provides 挂每项服务的消费者列表，消费者的 requires 保留全部候选提供者。
 * 拍平视图无法可靠还原 group/isolate realm 的就近解析，因此多 provider 时不伪造唯一关系。
 */
import type { PluginGraphNode } from '../shared/types.ts'
import { collectNodes, type CollectContext } from './tree.ts'

export function collectGraph(ctx: CollectContext): PluginGraphNode[] {
  // 没有插件提供、但运行时取得到 = cordis / 宿主内置（loader、web、storageDomain…），
  // 不是缺失。不做这一步的话 13 处内置依赖会被当成 13 个「缺提供者」的假警报。
  const resolvable = (service: string): boolean => {
    const get = (ctx as { get?: (name: string) => unknown }).get
    if (typeof get !== 'function') return false
    try {
      return get.call(ctx, service) !== undefined
    } catch {
      return false
    }
  }
  const nodes = collectNodes(ctx)
  // 服务 → 候选提供者列表。仅凭拍平遍历顺序无法还原 realm 内真实注入，不能擅自选“最后一个”。
  const providersOf = new Map<string, string[]>()
  for (const n of nodes) {
    for (const service of n.provides ?? []) {
      const providers = providersOf.get(service) ?? []
      providers.push(n.id)
      providersOf.set(service, providers)
    }
  }
  // 服务 → 消费者 id 列表（声明 inject 该服务的插件）
  const consumersOf = new Map<string, string[]>()
  for (const n of nodes) {
    for (const service of n.requires ?? []) {
      const list = consumersOf.get(service) ?? []
      list.push(n.id)
      consumersOf.set(service, list)
    }
  }
  return nodes.map(n => ({
    id: n.id,
    shortId: n.shortId,
    name: n.name,
    state: n.state,
    provides: (n.provides ?? []).map(service => ({ service, consumers: consumersOf.get(service) ?? [] })),
    requires: (n.requires ?? []).map(service => {
      const providers = providersOf.get(service) ?? []
      // 恒发 builtin（哪怕是 false）：客户端靠「字段在不在」判断 host 是否具备这个能力，
      // 老 host 不发 → undefined → 客户端不拿「缺提供者」当信号，而不是误报一堆内置依赖
      return { service, providers, builtin: providers.length === 0 && resolvable(service) }
    }),
  }))
}
