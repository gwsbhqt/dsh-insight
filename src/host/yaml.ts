/**
 * dsh 配置的 YAML 方言：读补丁层和读预设 composition 的人共用这一份。
 *
 * 为什么是动态 import：js-yaml 不是本包的依赖，它是 `@deepseek-ai/dsh-app-boot` 和
 * `@deepseek-ai/dsh-agent-presets` 各自的依赖。也就是说——**能读到那些服务，就一定
 * 装了 js-yaml**。但「一定」是今天的事实不是契约，所以静态 import 会把「上游哪天换了
 * YAML 库」变成「dsh-insight 整个插件加载失败」。动态 + 兜底，最坏也只是少一列。
 */

/**
 * dsh 的 entry-list YAML 方言：`!!js <表达式>` 构造成 `{ __jsExpr: '<表达式>' }`。
 *
 * 和 dsh-app-boot 内部那份是同一个约定（host/final.ts 的 jsExprOf 读的就是它）。
 * 非用不可：预设里 `disabled: !!js process.platform === 'win32'` 是常规写法，
 * 拿默认 schema 去 load 会在这一行直接抛「unknown tag」，整个预设就读不出来了。
 */
export const JS_EXPR_TAG = 'tag:yaml.org,2002:js'

/** js-yaml 的最小面。动态 import 进来，缺席就降级，不让整根轴塌掉。 */
export interface YamlLike {
  load(content: string, options: { schema: unknown }): unknown
  JSON_SCHEMA: { extend(type: unknown): unknown }
  Type: new (tag: string, options: {
    kind: 'scalar'
    construct(data: string): unknown
    represent?(data: unknown): unknown
  }) => unknown
}

let dialect: { yaml: YamlLike; schema: unknown } | null | undefined

/**
 * 拿到解析 dsh 配置用的 YAML 方言，只备一次。
 * @returns 方言；js-yaml 不在时返回 null。
 */
export async function yamlDialect(): Promise<{ yaml: YamlLike; schema: unknown } | null> {
  if (dialect !== undefined) return dialect
  try {
    const mod = await import('js-yaml') as unknown as { default?: YamlLike } & YamlLike
    const yaml = (mod.default ?? mod)
    const jsExpr = new yaml.Type(JS_EXPR_TAG, {
      kind: 'scalar',
      construct: (data: string) => ({ __jsExpr: data }),
    })
    dialect = { yaml, schema: yaml.JSON_SCHEMA.extend(jsExpr) }
  } catch {
    dialect = null
  }
  return dialect
}
