/** 测试 fixture：启动即抛错的插件。 */
export function apply() {
  throw new Error('boom from fail-plugin')
}
