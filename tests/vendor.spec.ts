/** 包出处分类：scope 认官方，磁盘路径认本地，虚拟条目一律不分类。 */
import { describe, expect, it } from 'vitest'
import { buildVendorIndex, isForeign, vendorOf } from '../src/shared/vendor.ts'

const NM = '/home/u/.dsh/profiles/p/node_modules/@deepseek-ai/dsh-llm'

describe('vendorOf', () => {
  it('@deepseek-ai scope 下的是官方', () => {
    expect(vendorOf({ name: '@deepseek-ai/dsh-llm', path: NM })).toBe('official')
    expect(vendorOf({ name: '@deepseek-ai/cordis-plugin-timer', path: NM })).toBe('official')
  })

  it('别的 scope 与无 scope 的都是三方', () => {
    expect(vendorOf({ name: '@acme/dsh-thing', path: NM })).toBe('third-party')
    expect(vendorOf({ name: 'some-plugin', path: NM })).toBe('third-party')
  })

  it('路径不在 node_modules 里的是本地', () => {
    expect(vendorOf({ name: 'dsh-insight', path: '/Users/me/project/dsh-insight' })).toBe('local')
  })

  it('本地压过 scope：link 成本地的官方包跑的是你磁盘上的代码', () => {
    expect(vendorOf({ name: '@deepseek-ai/dsh-llm', path: '/Users/me/forks/dsh-llm' })).toBe('local')
  })

  it('pnpm 的 .pnpm store 仍然算 node_modules 里', () => {
    expect(vendorOf({ name: '@deepseek-ai/dsh-llm', path: '/p/node_modules/.pnpm/x@1/node_modules/@deepseek-ai/dsh-llm' })).toBe('official')
  })

  it('Windows 分隔符同样认得出来', () => {
    expect(vendorOf({ name: 'x', path: 'C:\\p\\node_modules\\x' })).toBe('third-party')
  })

  it('虚拟条目与匿名 entry 不分类——贴任何标签都是撒谎', () => {
    expect(vendorOf({ name: 'cordis:group' })).toBeUndefined()
    expect(vendorOf({ name: 'cordis:include', path: NM })).toBeUndefined()
    expect(vendorOf({ name: '' })).toBeUndefined()
  })

  it('拿不到路径时退回看 scope', () => {
    expect(vendorOf({ name: '@deepseek-ai/dsh-llm' })).toBe('official')
    expect(vendorOf({ name: 'mystery' })).toBe('third-party')
  })

  it('只有三方和本地值得标出来', () => {
    expect(isForeign('third-party')).toBe(true)
    expect(isForeign('local')).toBe(true)
    expect(isForeign('official')).toBe(false)
    expect(isForeign(undefined)).toBe(false)
  })
})

describe('buildVendorIndex', () => {
  const node = (id: string, name: string, path?: string, children: unknown[] = []) =>
    ({ id, shortId: id.split(':').pop()!, name, path, children }) as never

  const index = buildVendorIndex([
    node('include', 'cordis:include', undefined, [
      node('include:llm', '@deepseek-ai/dsh-llm', '/p/node_modules/@deepseek-ai/dsh-llm'),
      node('include:mine', 'my-plugin', '/home/me/mine'),
      node('include:vendorish', '@acme/thing', '/p/node_modules/@acme/thing'),
    ]),
  ] as never)

  it('三种查法给出同一个答案', () => {
    expect(index.ofPlugin('include:llm')).toBe('official')
    expect(index.ofShort('llm')).toBe('official')
    expect(index.ofPackage('@deepseek-ai/dsh-llm')).toBe('official')
  })

  it('本地与三方各就各位', () => {
    expect(index.ofShort('mine')).toBe('local')
    expect(index.ofShort('vendorish')).toBe('third-party')
  })

  it('虚拟条目不进索引', () => {
    expect(index.ofPlugin('include')).toBeUndefined()
    expect(index.ofPackage('cordis:include')).toBeUndefined()
  })

  it('查不到的键返回 undefined，而不是猜一个', () => {
    expect(index.ofShort('nope')).toBeUndefined()
    expect(index.ofPackage('nope')).toBeUndefined()
  })
})
