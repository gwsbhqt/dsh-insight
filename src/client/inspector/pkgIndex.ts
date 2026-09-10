/**
 * 包名 → 插件轴那一条。
 *
 * 归因给出的是明文包名（`@deepseek-ai/dsh-client-ui-conversation`），而工作台的
 * 跳转要的是 entry id。两者靠 host 插件树里的 `name` 字段接上：在跑着的 web
 * 客户端上比对过——浏览器端 58 个 client 插件，57 个能按这个名字在 host 树里
 * 找到对应节点（唯一对不上的那个是已经从 profile 里摘掉、但页面还没刷新的
 * 陈旧插件，属于该找不到）。
 *
 * 一个包名可能对应多条 entry（同一个包被挂了两次）。优先挑活着的那条：跳到
 * 一条 disposed 的 entry 上，右栏讲的是一段已经结束的历史。
 */
import type { PluginNode } from '../../shared/types.ts'

export interface PkgIndex {
  /** 这个包在插件轴上的 entry id；树里没有就是 undefined（不可跳）。 */
  idOf(pkg: string | undefined): string | undefined
}

const DEAD: ReadonlySet<string> = new Set(['disposed', 'failed'])

export function buildPkgIndex(tree: readonly PluginNode[] | undefined): PkgIndex {
  const best = new Map<string, PluginNode>()
  const walk = (nodes: readonly PluginNode[]): void => {
    for (const node of nodes) {
      if (node.name !== '') {
        const held = best.get(node.name)
        if (held === undefined || (DEAD.has(held.state) && !DEAD.has(node.state))) best.set(node.name, node)
      }
      walk(node.children)
    }
  }
  walk(tree ?? [])
  return {
    idOf(pkg) {
      if (pkg === undefined) return undefined
      return best.get(pkg)?.id
    },
  }
}
