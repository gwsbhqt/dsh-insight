/**
 * `@deepseek-ai/dsh-client-ui-primitives` 的测试替身。
 *
 * 它是平台模块：构建期 external、运行时由宿主提供，本仓库从不打包它。测试里却会
 * 被真加载——而 0.1.5-rc.1 的发布产物 import 了 shiki / katex / anser / micromark
 * 一整串只写在它 devDependencies 里的包，装不到就整份 spec 起不来。桩掉它，测试
 * 回到只验本插件自己的注册与渲染逻辑。
 */
import type { ReactNode } from 'react'

export function Tooltip({ children }: { children?: ReactNode }): ReactNode {
  return children ?? null
}

export function JsonTree(): ReactNode {
  return null
}

export function ReadBlock(): ReactNode {
  return null
}
