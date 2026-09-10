/**
 * 注册者记账：给 slot 注册记录补上明文包名。
 *
 * ## 为什么需要它
 *
 * ui-renderer 记下的 registrant 是 `options.registrant ?? ctx.fiber.name`，
 * 而 cordis 的 fiber 名来自插件模块的 `name` 导出——没写的退回函数名，生产
 * 构建里被压成 `Z8` 这种，认不出是哪个包。
 *
 * 更要紧的是**压缩名在包之间会撞车**：在跑着的 web 客户端上枚举
 * `ctx.get('loader').entries()`（58 个 client 插件），`dsh-api-gateway`、
 * `dsh-client-ui-open-in-app`、`dsh-api-workspace-files`、`dsh-client-modules`
 * 的 fiber 名全都是 `Z8`。所以 registrant 只能当线索，反查包名这条路是死的——
 * 明文包名必须在注册发生的那一刻、从调用方身上取。
 *
 * ## 怎么补
 *
 * cordis 服务方法里的 `this.ctx` 指向**调用方**插件（服务是 caller-traced 的），
 * 而 loader 给插件 fiber 挂了它自己的 entry，`entry.options.name` 就是明文的
 * 模块说明符——也就是包名，与浏览器 boot 表里的 id 一致（实测 58 个 client
 * 插件里 57 个能按这个名字在 host 插件树里找到对应节点）。
 *
 * 所以：在 slots 服务原型的 `register` 外面包一层，注册发生时把
 * 「StoredEntry → 包名」记进 WeakMap。
 *
 * ## 这是「插件从外面伸手」，不是改核心
 *
 * 补丁只存在于内存里的那个原型对象上：包一层、转调原方法、dispose 时按栈
 * 还原。dsh 的任何文件、产物、配置都不动。原方法的行为不被改变——记账在它
 * 返回之后做，并且整段包在 try/catch 里：记账失败只是少一条账，绝不能让别人
 * 的注册失败。
 *
 * ## 边界（必须说清楚，否则会被当成完整归因用）
 *
 *   - **只记得到装上补丁之后的注册。** 比我们早加载的插件（boot 表里
 *     `immediately` 的那批）记不到账，归因链上那几层就只有 slot 名和压缩的
 *     registrant，包名显示为「未知」——照实说，不拿压缩名去猜。
 *   - 补丁幂等：同一个原型只包一层。
 *   - 还原之后已经记下的账继续有效（键是 entry 对象本身，插件卸载时跟着
 *     一起被回收）。
 */

/** entry / 组件 → 明文包名。键是别人的对象，用 WeakMap 不留生命周期。 */
const LEDGER = new WeakMap<object, string>()

/** 幂等标记：打在被包过的原型上。 */
const PATCHED = Symbol.for('dsh-insight.inspector.registrant-probe')

/** 记账所需的最小服务形状。 */
interface SlotsLike {
  register?: unknown
  entries?: unknown
}

/** 被 traced 之后的 this：cordis 把调用方的 ctx 放在这里。 */
interface CallerThis {
  ctx?: { fiber?: { entry?: { options?: { name?: unknown } } | undefined } | undefined } | undefined
  entries?: ((key: string) => readonly unknown[]) | undefined
}

function pkgOfCaller(self: CallerThis): string | undefined {
  const name: unknown = self.ctx?.fiber?.entry?.options?.name
  return typeof name === 'string' && name !== '' ? name : undefined
}

/**
 * 把刚注册进去的那条 StoredEntry 找出来记账。
 *
 * register 的返回值只有 disposer，拿不到 StoredEntry 本身，所以注册完再从
 * `entries(slotKey)` 里按组件引用倒着找——同一个组件重复注册时，最后一条就是
 * 刚加进去的那条。找不到（服务没有 entries、或 key 不可读）就退一步，只按
 * 组件引用记账。
 */
function record(self: CallerThis, options: unknown, component: unknown, pkg: string): void {
  if (typeof component === 'function' || (typeof component === 'object' && component !== null)) {
    LEDGER.set(component as object, pkg)
  }
  const slotKey: unknown = typeof options === 'object' && options !== null ? (options as { name?: unknown }).name : undefined
  if (typeof slotKey !== 'string' || typeof self.entries !== 'function') return
  const list = self.entries(slotKey)
  for (let i = list.length - 1; i >= 0; i--) {
    const entry = list[i]
    if (typeof entry === 'object' && entry !== null && (entry as { component?: unknown }).component === component) {
      LEDGER.set(entry, pkg)
      return
    }
  }
}

/**
 * 装上记账补丁。
 * @param slots - `ctx.get('slots')` 拿到的服务实例（补丁打在它的原型上，
 *   于是对所有调用方生效——这正是目的：我们要记的是**别人**的注册）。
 * @returns 还原函数（幂等；已经被别人包过时返回一个空操作）。
 */
export function installRegistrantProbe(slots: object): () => void {
  const proto = Object.getPrototypeOf(slots) as (SlotsLike & Record<symbol, unknown>) | null
  if (proto === null || typeof proto.register !== 'function') return () => {}
  if (proto[PATCHED] === true) return () => {}

  const original = proto.register as (this: CallerThis, ...args: unknown[]) => unknown
  function patched(this: CallerThis, ...args: unknown[]): unknown {
    const result = original.apply(this, args)
    try {
      const pkg = pkgOfCaller(this)
      if (pkg !== undefined) record(this, args[0], args[1], pkg)
    } catch {
      // 记账是附加品：读不到调用方、entries 抛错，都只意味着少一条账。
    }
    return result
  }

  Object.defineProperty(proto, 'register', { value: patched, writable: true, configurable: true })
  Object.defineProperty(proto, PATCHED, { value: true, writable: true, configurable: true })
  let restored = false
  return () => {
    if (restored) return
    restored = true
    // 只在补丁还是我们那一层时还原，免得把别人后来包的那层顶掉。
    if (proto.register === patched) {
      Object.defineProperty(proto, 'register', { value: original, writable: true, configurable: true })
    }
    Object.defineProperty(proto, PATCHED, { value: false, writable: true, configurable: true })
  }
}

/** 查一条 StoredEntry 的明文包名：先按 entry 自己，再退到它的组件引用。 */
export function pkgOfEntry(entry: object): string | undefined {
  const direct = LEDGER.get(entry)
  if (direct !== undefined) return direct
  const component: unknown = (entry as { component?: unknown }).component
  if (typeof component === 'function' || (typeof component === 'object' && component !== null)) {
    return LEDGER.get(component as object)
  }
  return undefined
}

/** 测试用：清掉某条账（WeakMap 没法清空，按键删）。 */
export function forgetForTest(key: object): void {
  LEDGER.delete(key)
}
