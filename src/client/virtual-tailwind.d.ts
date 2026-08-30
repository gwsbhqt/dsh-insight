/** 构建期 Tailwind 虚拟模块（见 tsdown.config.ts 的 tailwind 插件）的类型声明。 */
declare module 'virtual:tailwind-css' {
  const css: string
  export default css
}
