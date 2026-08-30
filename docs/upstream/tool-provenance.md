# 给 dsh 的需求：工具注册来源

> 提出方：dsh-insight（配置与插件树洞察面板）
> 结论：**当前 dsh 无法回答「这个工具是谁注册的」，缺一个字段。**

## 想解决的问题

用户在 Insight 面板里问的原话：

> 我想以工具名为切面。可能一个插件或者一个服务会提供很多个子工具，我想列出所有的工具。
> 可能很多个工具来自同一个插件来自同一个服务，我也想追踪是谁提供、谁开启、谁禁用的这个工具。

这是个很合理的诉求——用户要决定「哪些工具留、哪些关掉」，就得先看到工具清单，
以及每个工具背后是哪个插件（因为关工具的动作是关插件）。

## 实测：现在拿不到

在 `dsh 0.1.1-rc.2` 的运行实例上，从一个装载中的插件的 `Context` 探测：

| 探测 | 结果 |
|---|---|
| `ctx.get('tools').schemas()` | `0` |
| `tools.layers.global.tools.data` | `Map(0)` |
| `tools.layers.scoped` | `Map(0)` |
| `ctx.get('skills').list()` | `[]` |
| `ctx.get('commands').list()` | `4`（这个能读） |
| `ctx.get('agents').list()` | `[]` |
| `agentPresets.serviceFor(presetId)` | 抛错——要的是真实 scope 对象（`Symbol(dsh.scope)`），不是 id |
| `agentPresets.mount(agentCtx, id)` | 签名要 agent 的 scope `Context` |

两个结论：

1. **工具只在 agent 活着时存在。** 它们不是插件加载时注册的，是 agent 实例化、
   预设被 mount 成一个 scope 之后才 `tools.register()` 进去的。静止的 harness 里
   全局层和 scoped 层都是空的。
2. **即使读到工具，也反查不回插件。** `ToolDefinition` 继承 `ToolSchema`，字段是
   `name / description / input / output / execute / timeoutMs / …`——**没有任何一项
   记录是谁注册的**。

第 2 条是关键：第 1 条还能靠「面板打开时若有活跃 agent 就快照」绕过，第 2 条绕不过。

## 请求

**在工具注册时记录注册者，并在读取面上暴露出来。**

最小改动：`ToolRuntime.register(definition)` 内部已经能拿到调用方的
`Context` / fiber，把它对应的 loader entry id 记进注册表条目，并在 `schemas()` /
`get()` 的返回上带出来。

```ts
interface ToolSchema {
  name: string
  description: string
  // …

  /** 注册它的 loader entry 完整 id，如 include:agent-presets:tool-bash。 */
  readonly registrant?: string
}
```

`registrant` 只读、可选（拿不到时不填），不影响任何现有调用方。

## 有了它之后能做什么

- **工具清单按工具名列**，而不是按插件列——一个插件注册多个工具时能看清细分
- **每个工具能追到注册它的插件**，进而追到「哪一层配置把这个插件插进来的、哪一层
  把它关掉的」（这两段 Insight 已经有了，只差 tool → plugin 这一跳）
- 「关掉某个工具」这个动作能给出确切的落点：禁用哪个 entry

## 次要请求（可选）

**让工具在没有活跃 agent 时也可枚举。** 比如 `agentPresets` 暴露一个纯查询接口，
返回「某个预设会挂载哪些工具插件 / 工具」，不需要真的 mount 出一个 scope。

这条不如上一条要紧——面板可以退而求其次，只在有活跃会话时展示运行时快照。
但如果有，就能回答「我换到 PTC 模式会多出哪些工具」这类问题，而不必先切过去试。

## 当前的替代方案（已实现）

在拿到上面的字段之前，Insight 面板里做的是**插件粒度**：

- 一行一个**工具插件**（`tool-*` 的 loader entry），22 条
- 同名两份归并（宿主面一份常被 bundle 层禁用、agent 预设 realm 里一份活着），
  给出净状态；两份不一致时明确标出来——单看任一份都会得出错误结论
- 每条能追到：来源包、磁盘路径、哪一层插入、哪一层禁用
- 界面上写明这一层的边界，不假装是工具清单

够用来做「关掉哪些」的决策，但粒度是插件不是工具。

---

# 追加：设置命名空间的注册来源

同一个字段缺口，出现在 settings 上。

## 现象

Insight 面板列插件时，有两行没有包名，看着像坏掉的插件：

| ns | 实际情况 |
|---|---|
| `shell` | 设置归 `include:shell-env` 插件，但 ns 叫 `shell`、entry 短 id 叫 `shell-env`，对不上 |
| `ui-onboarding` | `ctx.loader.entries()` 里根本没有这个 entry——注册它的是客户端插件 |

## 实测：现在拿不到

`dsh 0.1.1-rc.2`，`FileSettingsProvider`（基类 `SettingsProvider`）：

| 探测 | 结果 |
|---|---|
| `settings.describe({ redactSecrets: true })` 每行的字段 | `ns / schema / value / revision / base / user / applies / secrets` |
| `settings.registrations` 里每条注册的字段 | `ns / schema / base / applies / resolved / revision / watchers` |
| `applies` | 全是 `'live'`，是生效时机不是归属 |
| 装观察器包 `SettingsProvider.register` | **来不及**——设置在插件加载时注册，`dsh-insight` 排在后面，绝大多数已经注册完了 |
| 从 fiber 反查 `settings.register("shell")` 那个 effect | `fiber._disposables` 是 `DisposableList`，里面是**没有标签的裸函数**，取不回 |

工具那边至少还能靠「注册发生在 agent 跑起来之后」旁听到；设置这边连这条路都没有。

## 请求

**`register()` 内部已经拿着调用方的 `Context`**（`this.ctx.effect(...)` 用的就是它），
把它对应的 loader entry id 记进 registration，并在 `describe()` 的返回上带出来：

```ts
interface SettingsDescription {
  ns: string
  // …
  /** 注册它的 loader entry 完整 id，如 include:shell-env；客户端注册的没有。 */
  readonly registrant?: string
}
```

只读、可选，不影响任何现有调用方。

## 有了它之后

- 设置能挂回它的插件，不再有「没有包名的插件行」
- 「我改过的这条设置属于哪个插件、那个插件是哪一层插进来的」能一路追下去
- 客户端注册的（`registrant` 为空）可以据实标成「客户端」，而不是和前一种混在一起

## 当前的替代方案（已实现）

不猜。挂不上的如实标成「设置命名空间」，并说清两种成因——设置本身是真的，
改动照样生效，只是追不到注册者。
