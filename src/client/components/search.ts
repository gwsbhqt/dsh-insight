/** 搜索词归一化 + 列表过滤：所有 tab 的搜索入口，trim/大小写行为只有这一份。 */

export function normQuery(query: string): string {
  return query.trim().toLowerCase()
}

/** q 为空返回原列表（引用不变）；否则按 match 过滤。 */
export function filterByQuery<T>(query: string, items: T[], match: (item: T, q: string) => boolean): T[] {
  const q = normQuery(query)
  return q === '' ? items : items.filter(item => match(item, q))
}
