/**
 * 工具注册观察器：在运行时给 `tools.register` 包一层，记下「谁注册了哪个工具」。
 *
 * 为什么要这么做——上游没有这个信息，而且拿不到：
 *   1. 工具不在插件加载时注册，是 agent 构造、预设挂成 scope 之后才 register 进去的。
 *      静止实例上 tools 的 global 层和 scoped 层都是 Map(0)。
 *   2. ToolDefinition 不带注册者字段。即便读到工具名也反查不回插件。
 * 所以只能在注册发生的那一刻旁听，并用调用栈反查是哪个包调的。
 * 已经给上游提了需求（docs/upstream/tool-provenance.md）——有了 registrant 字段
 * 这个文件就可以删掉。
 *
 * 边界，务必守住：
 *   - **只改运行时内存里的原型对象，不写任何文件。** 不碰 node_modules，不碰 dsh 仓库。
 *   - 包装层坐在所有工具注册的必经之路上，所以记账**绝不允许影响注册本身**：
 *     全部包在 try 里，且先透传再记账的顺序不能反（记账抛错也不能吞掉注册）。
 *   - 幂等：HMR 重复 apply 不能套娃，用原型上的标记位挡住。
 *   - 可回收：dispose 时还原原方法。
 */
import type { ObservedTool } from '../shared/types.ts'

/** 打在原型上的标记，防止 HMR 反复 apply 时层层套娃。 */
const PATCHED = Symbol.for('dsh-insight.toolObserver')

/** 调用栈里这些包是框架自己，跳过——真正的注册者在它们下面一层。 */
const FRAMEWORK = new Set([
  '@deepseek-ai/cordis',
  '@deepseek-ai/cordis-plugin-loader',
  '@deepseek-ai/cordis-plugin-group',
  '@deepseek-ai/cordis-plugin-include',
  '@deepseek-ai/dsh',
  '@deepseek-ai/dsh-tools',
])

const PKG = /node_modules\/(@[\w.-]+\/[\w.-]+|[\w.-]+)\//g

/** 描述长度上限：够放完整的工具说明，又不至于让某个失控的字符串撑爆 RPC。 */
const MAX_DESC = 4000

/** 从调用栈里挑出第一个不是框架的包名 = 注册这个工具的插件包。 */
export function callerPackage(stack: string): string | undefined {
  for (const line of stack.split('\n').slice(1)) {
    for (const m of line.matchAll(PKG)) {
      const pkg = m[1]!
      if (!FRAMEWORK.has(pkg)) return pkg
    }
  }
  return undefined
}

interface ToolsLike {
  register(definition: unknown): unknown
}

/** 本次进程观察到的工具，键 = `包名\0工具名`（同名工具可能来自不同包）。
 *  分隔符用转义写法而不是真的 NUL 字符——真字符会让 git 把整个文件判成二进制，
 *  从此 diff 不了也 grep 不到。 */
const observed = new Map<string, ObservedTool>()

export function observedTools(): ObservedTool[] {
  return [...observed.values()].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * 装上观察器。返回还原函数交给 ctx.effect。
 * @param tools - 运行时的 tools 服务实例；缺席（精简 profile）时什么也不做。
 */
export function installToolObserver(tools: unknown): () => void {
  if (tools === null || tools === undefined) return () => {}
  const proto = Object.getPrototypeOf(tools) as (ToolsLike & Record<symbol, unknown>) | null
  if (proto === null || typeof proto.register !== 'function') return () => {}
  if (proto[PATCHED] === true) return () => {} // 已经装过（HMR 重入），别套娃

  const original = proto.register
  proto.register = function observedRegister(this: unknown, definition: unknown) {
    // 先透传：注册是正事，记账是旁听。顺序反了的话记账抛错会吞掉注册。
    const result = original.call(this, definition)
    try {
      const name = (definition as { name?: unknown } | null)?.name
      if (typeof name === 'string' && name !== '') {
        const pkg = callerPackage(new Error('trace').stack ?? '')
        const key = `${pkg ?? ''}\0${name}`
        if (!observed.has(key)) {
          const entry: ObservedTool = { name, source: 'runtime' }
          if (pkg !== undefined) entry.pkg = pkg
          const description = (definition as { description?: unknown }).description
          if (typeof description === 'string' && description !== '') {
            // 上限只是防失控，不是排版手段：砍到一半的句子看起来像 bug（本来就是）。
            // 真被砍到时补省略号，让「这里还有」是明说的。
            entry.description = description.length > MAX_DESC
              ? `${description.slice(0, MAX_DESC).trimEnd()}…`
              : description
          }
          observed.set(key, entry)
        }
      }
    } catch {
      // 观察器出任何问题都不许影响运行时——宁可少记一条
    }
    return result
  }
  proto[PATCHED] = true

  return () => {
    proto.register = original
    delete proto[PATCHED]
  }
}
