<div align="center">

# 洞察 · dsh-insight

**一块屏幕回答：一个 DeepSeek Harness profile，到底由什么组成。**

每个插件、服务、工具、模型是哪来的，被哪一层配置插入或禁用，此刻在不在跑。只读。

[![npm](https://img.shields.io/npm/v/@gwsbhqt/dsh-insight?logo=npm&label=npm)](https://www.npmjs.com/package/@gwsbhqt/dsh-insight)
[![downloads](https://img.shields.io/npm/dt/@gwsbhqt/dsh-insight?logo=npm&label=downloads)](https://www.npmjs.com/package/@gwsbhqt/dsh-insight)
[![CI](https://github.com/gwsbhqt/dsh-insight/actions/workflows/ci.yml/badge.svg)](https://github.com/gwsbhqt/dsh-insight/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
[![stars](https://img.shields.io/github/stars/gwsbhqt/dsh-insight?style=flat&logo=github&label=Star)](https://github.com/gwsbhqt/dsh-insight/stargazers)

[安装](#安装) · [五根轴](#五根轴) · [为什么它宁可说不知道](#为什么它宁可说不知道) · [只读边界](#只读边界) · [English](README.md)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/hero.png" width="900" alt="洞察 — 同一份数据的五根轴">
</p>

## 安装

```sh
dsh plugin --profile web add @gwsbhqt/dsh-insight
```

更新：

```sh
dsh plugin --profile web update @gwsbhqt/dsh-insight@latest
```

然后打开**设置 → 洞察**。不用构建，也不用重启。这个包自带两半：采数据的 host 插件和画界面的浏览器插件。

## 它解决什么

一个跑起来的 `dsh` profile，是被好几层配置叠出来的，而这几层你从来没机会摆在一起看：

- 每个 bundle 自带的 `cordis.patch.yml`（`@deepseek-ai/dsh-base`、市场包、你自己的插件）
- profile 自己的补丁层 `$DSH_HOME/profiles/<name>/cordis.patch.yml`
- `$DSH_HOME/settings.yaml`——模型供应商、默认模型、权限预设
- `$DSH_HOME/.credentials.yaml` 与环境变量

最后哪些留下来，由 patch 语义（按 id 插入 / 覆盖 / 禁用）和 cordis loader 实际启动的结果共同决定。**任何单个文件都给不出答案**，于是「这个插件为什么没跑起来」「这个模型是哪来的」就变成在四个文件和一个看不见的运行时之间来回翻。

洞察把这个推导过程实时做完，并且把推导依据一并摆出来。

## 六根轴

同一份数据，六种排法。前五根顺序即因果：**配置生出插件，插件提供服务，服务里跑出工具和模型。**「按预设」收在最后——它讲的不是这个进程里已经跑着的东西，而是另一份配置：agent 面那份，会话开起来时才挂上去。切轴不会清掉你的选中。

### 按配置——谁覆盖谁

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/config.png" width="900" alt="按配置：每一层按应用顺序排开，以及它做了什么">

每一层按应用顺序排开，右边写清它对插件树做了什么——`插入 78`、`覆盖 2`、`禁用 24`。首尾两层各有标记，因为光有编号说不清方向。不参与合并的那几个配置文件（profile 的 `cordis.yml`、`settings.yaml`、`.credentials.yaml`）也列在同一张表里并注明——你多半是为了它们的路径才找过来的。

选中一层，右栏列出这一层碰过的每一条 entry，每条都能直接跳到插件轴。

### 按插件——一行一份档案

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/plugins.png" width="900" alt="按插件：运行时插件树，逐个给出来源、接线与设置">

实时的 loader 树——容器、嵌套的 realm、被禁用的条目压在它所属那一层的末尾折叠起来。选中一条，右栏是它的完整档案：

- **哪来的**——哪一层把它插进来的、完整 entry id、包名与磁盘路径
- **接线**——它提供和依赖哪些服务，各自的对端是谁；宿主内置的服务会明说是内置，而不是显示成「缺提供者」
- **影响面**——有哪些插件（传递地）依赖它，于是「关掉它会炸什么」是一个数字加一份名单，不是猜
- **它的设置**——当前生效值、插件默认值、你的覆盖，并排摆着
- **配置怎么叠出来的**——按顺序列出碰过这条 entry 的每一层，以及每层做了什么

上面的筛选 chip 收窄同一份列表：需要注意、你改过、已禁用、运行时注册、非官方。

### 按服务——插件之间真正的连线

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/services.png" width="900" alt="按服务：提供者、消费者与影响面">

服务才是插件之间真正的边，所以它单独占一根轴：每个服务谁提供、多少人在用，枢纽服务还给出完整影响面。这里是表不是画布，是有意的：真实 profile 的依赖图是星形的，枢纽的边无论用什么布局算法都会横穿整张画布。

### 按工具——agent 真正能调到的东西

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/tools.png" width="900" alt="按工具：工具名、注册它的包、以及连带范围">

一行一个**工具名**——`bash`、`read`、`exit_plan_mode`——不是一行一个插件。每行带上注册它的包、它的说明，以及关掉它会连带消失几个同源工具：因为关掉一个工具的实际落点是禁掉注册它的那个插件。

上游的工具定义里不带注册者，而且工具要等 agent 构造出来才注册。所以这一轴有两条数据来源，并且**会告诉你用的是哪条**：**运行时观察**（在注册发生的那一刻旁听，靠调用栈反查是哪个包）或**源码推测**（扫插件构建产物里的字面量，明确标注——运行时才算出来的名字它抠不到）。让第二条路变得多余的那个字段[已经向上游提了需求](docs/upstream/tool-provenance.md)。

### 按模型——每个模型是怎么进来的

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/models.png" width="900" alt="按模型：模型、provider、激活方式与背后的插件">

一行一个模型，带上它所属的 provider 路由，以及把这条路由接进来的插件。右栏给出它的配置落在设置的哪个路径上，以及这条路由**靠什么激活——环境变量里的 API key、存起来的 API key，还是 OAuth 授权**。上游声明了可配、但你还没配的 provider 收在末尾折叠起来。

这一轴不碰网络：读的是 llm 服务自己的只读面，不会去调那个会真的敲你各家 provider 的模型发现接口。

### 按预设——会话手里那套东西是谁给的

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/presets.png" width="900" alt="按预设：预设清单、出处、组成，以及此刻谁在用">

一个预设 = 一份 agent 面的插件组合。会话开起来的时候挑一个，它决定这个会话手里有哪些工具、看到哪些提示词。一行一个预设，回答四件事：

- **有几个、谁是默认、此刻有几个会话在用它。** 「在用」按上游 `resolveSessionPreset` 的规则算：创建时选的记在 header 里，之后每换一次记一条事件，**最后一次赢**——只读 header 会把中途换过预设的会话算回它创建时那个。读不到会话实况时说「不知道」，不说「没人用」。
- **内置 / 三方 / 本地。** 上游只记 `system`（发行带的）与 `user`（本地写的），分不出「三方插件带进来的那一批」。这里按 root 目录的磁盘位置再判一次，和其他各轴共用同一条规则，并连带说出是**哪个包**带进来的。本地写的预设和 shell 权限同级——它直接决定模型手里有哪些工具。
- **配置是什么。** composition（`agent.cordis.yml`）按行列出：容器行的私有 realm、被显式关掉的行、以及开关写成 `!!js` 表达式的行都标出来。**表达式不求值**：静态侧只知道「有个表达式」，不声称它开着还是关着。两个文件都能点开看原文。
- **它们跟宿主面的插件树不是同一批。** 预设只在会话开起来时挂上去，所以「按插件」那一轴里找不到它们——这一点右栏会明说，免得你以为哪里漏了。

坏掉的预设仍然留在名单上并标出原因：藏起来的话它照样占着那个 id，你却看不见也删不掉。

## 为什么它宁可说不知道

这个插件的大部分功夫，花在了「诚实的答案是不知道」的那些情形上——说不知道，而不是给一个看着挺像的数字：

- **短 id 撞名就不归因。** 同一个短 id 可能在两个 realm 里各有一份（`include:tool-bash` 与 `include:agent-presets:tool-bash`）。只要它在任一侧不唯一，来源层就留空，不猜。
- **算不出的表达式不当成 `false`。** 配置里的 `!!js` 表达式在重放时原样保留成一个不透明标记，并从对账报告里排除，而不是强转成布尔值。强转过一次，代价是 22 条假的「这个插件被禁用了」。
- **多个候选 provider 就保持多个。** 两个插件提供同名服务时，两个都列出来，而不是自信地连一条边到其中一个。
- **推测出来的数据会标出来。** 从构建产物里抠出的工具名标「源码推测」；注册时旁听到的不标。
- **挂不上插件的设置就直说。** 找不到归属插件的设置命名空间，标成「设置命名空间」，而不是显示成一个没有包名的插件。
- **版本错位只降级，不崩。** host 进程比浏览器产物旧时（改完没重启），摘要退回浏览器自己算并明说；host 还不认识的端点，对应那一轴空着并说明原因，而不是把整个面板染红。

## 只读边界

- 面板**只有一条写路径**：在「按插件」那一列点禁用 / 启用。除此之外没有任何编辑入口。这一条写路径本身也是有边界的：
  - **只写 profile 补丁层那一个文件**（`$DSH_HOME/profiles/<name>/cordis.patch.yml`），且路径必须落在 `$DSH_HOME` 里、不在 `node_modules` 里。bundle 层是包管理器的地盘，home 层是跨 profile 的公共层，两者都不碰。
  - **逐行改文本，绝不重新序列化 YAML。** 用 YAML 库读进来再吐出去语法是对的，但你那一整份注释会被抹掉——而补丁文件里的注释恰恰是「为什么关掉它」的唯一记录。所以只动该动的那一行，其余字节原样保留；新加的一段上面留一行说明它是谁加的。
  - **要点两次**，确认态标红、2 秒不点自己退回去。
  - **短 id 撞名就拒绝**：补丁按 id 命中，同一个短 id 在运行时有两份时写下去会同时命中，这里不猜。运行时没有的插件也不写——不留一条永远命不中的补丁。
  - **原子落盘**：先写同目录临时文件再 rename，中途断电不会留下半份配置。
- **凭据正文永不读取。** `.credentials.yaml` 只列路径和大小，且被排除在预览白名单之外。激活方式走的是凭据服务的枚举接口，那个接口的契约就是「列出每条记录，永不带值」——面板只知道某条记录**是** API key 还是 OAuth 授权，不知道它是什么。
- **文件预览走白名单。** `files/read` 与 `files/open` 只接受 host 自己发现的路径，且在解析出真实路径之后再校验一次。
- 会离开浏览器的动作只有两个，都要你亲手点：
  - **在编辑器中打开**，对象是白名单里的配置文件或插件目录。
  - **立即重启**——关掉当前 dsh，按它原来的启动方式再拉起一个（不改任何文件，只换进程）。要点两次才动手；**有会话正在执行时按不动**；检测到 systemd 托管时默认关闭，因为那种部署里重启归守护进程管。`DSH_INSIGHT_ALLOW_RESTART=0` 彻底关掉它，`=1` 强制打开。这颗按钮不依赖任何其他插件。
- 工具观察器**只包内存里的 `tools.register`**，不写任何文件，不碰 `node_modules`，也不碰 harness 的安装目录。

## 开发

```sh
pnpm install
pnpm check          # 类型检查 + 构建 + 83 个测试

dsh plugin --profile <name> add /path/to/dsh-insight   # 装本地工作副本
dsh --profile <name>
```

`pnpm watch` 改动即重建，刷新页面就能看到新产物。

## 许可

[MIT](LICENSE)
