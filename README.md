<div align="center">

# 洞察 · dsh-insight

**One screen that answers what a DeepSeek Harness profile is actually made of.**

Every plugin, service, tool and model — where it came from, which config layer inserted or disabled it, and whether it is running right now. Read-only.

[![npm](https://img.shields.io/npm/v/@gwsbhqt/dsh-insight?logo=npm&label=npm)](https://www.npmjs.com/package/@gwsbhqt/dsh-insight)
[![downloads](https://img.shields.io/npm/dt/@gwsbhqt/dsh-insight?logo=npm&label=downloads)](https://www.npmjs.com/package/@gwsbhqt/dsh-insight)
[![CI](https://github.com/gwsbhqt/dsh-insight/actions/workflows/ci.yml/badge.svg)](https://github.com/gwsbhqt/dsh-insight/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
[![stars](https://img.shields.io/github/stars/gwsbhqt/dsh-insight?style=flat&logo=github&label=Star)](https://github.com/gwsbhqt/dsh-insight/stargazers)

[Install](#install) · [The five axes](#the-five-axes) · [Why it refuses to guess](#why-it-refuses-to-guess) · [Read-only by design](#read-only-by-design) · [简体中文](README.zh-CN.md)

</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/hero.png" width="900" alt="洞察 — five axes over one DeepSeek Harness profile">
</p>

## Install

```sh
dsh plugin --profile web add @gwsbhqt/dsh-insight
```

Update:

```sh
dsh plugin --profile web update @gwsbhqt/dsh-insight@latest
```

Then open **Settings → 洞察 / Insight**. No build step, no restart. The panel ships both halves: a host plugin that collects the data and a browser plugin that draws it.

## The problem

A running `dsh` profile is assembled from layers you never see side by side:

- each bundle's own `cordis.patch.yml` (`@deepseek-ai/dsh-base`, market packages, your own plugins)
- your profile's patch layer, `$DSH_HOME/profiles/<name>/cordis.patch.yml`
- `$DSH_HOME/settings.yaml` — model providers, the default model, permission presets
- `$DSH_HOME/.credentials.yaml` and environment variables

Which of it survives is decided by patch semantics (insert / update / disable, by id) and by what the cordis loader actually managed to start. **No single file tells you the answer**, so "why isn't this plugin running" and "where did this model come from" turn into a hunt across four files and a runtime you cannot see.

洞察 does that derivation for you, live, and shows its work.

## The six axes

One dataset, six ways to sort it. The first five are causal: **config produces plugins, plugins provide services, services register tools and models.** By preset comes last — it is not about what already runs in this process but about a second configuration: the agent-plane one, mounted only when a session starts. Switching axes never clears your selection.

### 按配置 · By config — which layer wins

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/config.png" width="900" alt="By config: every patch layer in application order, with what it did">

Every config layer in application order, with what it did to the tree — `inserted 78`, `overrode 2`, `disabled 24`. The first and last layers are marked, because a number alone never says which direction wins. Config files that take no part in the merge (the profile's `cordis.yml`, `settings.yaml`, `.credentials.yaml`) are listed in the same table, marked as such — you usually want them for their paths.

Pick a layer and the right pane names every entry it touched, each one a link into the plugin axis.

### 按插件 · By plugin — the dossier

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/plugins.png" width="900" alt="By plugin: the runtime tree with per-plugin provenance, wiring and settings">

The live loader tree — containers, nested realms, disabled entries folded away at the end of the level they belong to. Select one and get its whole dossier:

- **Where it came from** — the layer that inserted it, its full entry id, its package and path on disk
- **Wiring** — services it provides and consumes, each with its counterpart; built-in host services are named as such instead of showing up as a missing provider
- **Blast radius** — who depends on it, transitively, so "what breaks if I turn this off" is a number and a list rather than a guess
- **Its settings** — effective value, plugin default, and your override, side by side
- **How the config stacked up** — the ordered list of layers that touched this entry, and what each one did

Filter chips narrow the same list: needs attention, you changed it, disabled, runtime-registered, not official.

### 按服务 · By service — what actually connects plugins

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/services.png" width="900" alt="By service: providers, consumers and blast radius">

Services are the real edges between plugins, so they get their own axis: who provides each one, how many consume it, and — for a hub — the full impact list. This is a table and not a canvas on purpose: the dependency graph of a real profile is star-shaped, and a hub's edges cross the whole canvas no matter which layout you pick.

### 按工具 · By tool — what the agent can actually call

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/tools.png" width="900" alt="By tool: tool names, the package that registered each one, and what goes with it">

One row per **tool name** — `bash`, `read`, `exit_plan_mode` — not per plugin. Each one carries the package that registered it, its description, and how many sibling tools would disappear with it, because turning a tool off means disabling the plugin that registers it.

Upstream records no registrant on a tool definition, and tools are not registered until an agent is constructed. So this axis is assembled two ways and says which one it used: **observed at runtime** (the panel listens in as registration happens and attributes it by call stack) or **inferred from source** (a scan of the plugin's build output, marked as such — it can miss a name computed at runtime). A [request is open upstream](docs/upstream/tool-provenance.md) for the field that would make the second path unnecessary.

### 按模型 · By model — every model and how it got here

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/models.png" width="900" alt="By model: models, providers, activation method and the plugin behind each route">

One row per model, with the provider route it belongs to and the plugin that brought that route in. The detail pane names the exact settings path its configuration lives at, and how the route is activated — **an API key from an environment variable, a stored API key, or an OAuth grant**. Provider routes that upstream declares as configurable but you have not set up are folded away at the end.

Nothing here touches the network: the panel reads the llm service's own read-only faces, never the model-discovery endpoint that would call your providers.

### 按预设 · By preset — who handed the session its toolkit

<img src="https://raw.githubusercontent.com/gwsbhqt/dsh-insight/main/docs/assets/presets.png" width="900" alt="By preset: the roster, where each came from, what it composes, and who is on it">

A preset is one agent-plane plugin composition. A session picks one when it starts, and that decides which tools it holds and which prompt sections it sees. One row per preset, answering four things:

- **How many, which is the default, and how many sessions are on it right now.** Usage follows upstream's `resolveSessionPreset` rule: the creation header names the starting preset, every later switch is a logged event, and **the last one wins** — reading the header alone would count a switched session under the preset it was created with. When live session data is unavailable the panel says so rather than reporting "nobody".
- **Shipped / third-party / local.** Upstream records only `system` (shipped with the deployment) and `user` (authored locally), which cannot separate "brought in by a third-party plugin". This axis classifies again by where the root directory sits on disk — the same rule every other axis uses — and names **which package** supplied it. A locally authored preset carries the same trust as shell access: it decides what tools the model holds.
- **What the configuration actually is.** The composition (`agent.cordis.yml`) is listed row by row: private realms on container rows, explicitly disabled rows, and rows whose switch is a `!!js` expression are all marked. **Expressions are never evaluated**: the panel knows an expression exists and refuses to claim the row is on or off. Both files open for reading.
- **They are not the plugins in the host tree.** A preset is mounted only when a session starts, so its rows never appear on the By plugin axis — the detail pane says so, rather than letting you assume something went missing.

A broken preset stays on the roster with its reason: hiding it would leave its directory occupying the id with nothing to see or delete.

## Why it refuses to guess

Most of the work in this plugin is in the cases where the honest answer is "I don't know", and saying so instead of showing a plausible number:

- **Ambiguous short ids get no attribution.** The same short id can exist in two realms (`include:tool-bash` and `include:agent-presets:tool-bash`). When a short id is not unique on both sides, the layer that inserted it is left blank rather than guessed.
- **Unevaluated expressions are not treated as `false`.** `!!js` expressions in config survive replay as an opaque marker; they are excluded from the drift report instead of being coerced to a boolean. Coercing them produced 22 false "this plugin was disabled" reports before this was fixed.
- **Multiple candidate providers stay multiple.** When two plugins provide the same service name, the panel lists both instead of drawing a confident edge to one.
- **Inferred data is labeled.** A tool name extracted from build output is marked `inferred`; one observed at registration is not.
- **Settings with no plugin say so.** A settings namespace whose owner cannot be identified is labeled as a settings namespace, not shown as a plugin with a blank package.
- **Version skew degrades, it does not break.** When the host process is older than the browser bundle (a rebuild without a restart), the summary is recomputed in the browser and says so, and an axis whose endpoint the host does not know yet stays empty with an explanation instead of turning the panel red.

## Read-only by design

- The panel has **exactly one write path**: the Disable / Enable action on the By plugin axis. There is no other edit surface, and that one path is fenced:
  - **It writes one file only** — your profile patch layer (`$DSH_HOME/profiles/<name>/cordis.patch.yml`) — and the target must resolve inside `$DSH_HOME` and outside `node_modules`. Bundle layers belong to the package manager and the home layer is shared across profiles; neither is touched.
  - **It edits text line by line and never re-serializes the YAML.** Round-tripping through a YAML library produces valid syntax and erases every comment you wrote — and those comments are the only record of *why* something was turned off. Only the one line that must change is touched; a newly appended entry carries a comment saying which tool added it.
  - **It takes two clicks**, with the confirm state in red, reverting on its own after 2 seconds.
  - **An ambiguous short id is refused**: a patch targets by id, and when the same short id exists twice at runtime the write would hit both — the panel does not guess. An id that does not exist at runtime is refused too, rather than leaving a patch that can never match.
  - **The write is atomic**: a temp file in the same directory, then a rename.
- **Credential bodies are never read.** `.credentials.yaml` is listed for its path and size and is excluded from the preview allowlist. Activation methods are read through the credential service's enumeration face, whose contract is "every stored record, values excluded" — the panel learns *that* a record is an API key or an OAuth grant, never what it contains.
- **File preview is allowlisted.** `files/read` and `files/open` accept only paths the host itself discovered, validated after resolution.
- Only two actions leave the browser, and both take your click:
  - **Open in editor**, on an allowlisted config file or plugin directory.
  - **Restart now** — stop this dsh and start it again exactly the way it was launched (no file is touched; only the process changes). It takes two clicks; it is **disabled while any session is running**; and it defaults to off when systemd is detected, because restarts belong to the supervisor there. `DSH_INSIGHT_ALLOW_RESTART=0` turns it off for good, `=1` forces it on. The button depends on no other plugin.
- The tool observer wraps `tools.register` **in memory only**. It writes no files, and touches neither `node_modules` nor the harness installation.

## Development

```sh
pnpm install
pnpm check          # typecheck + build + 83 tests

dsh plugin --profile <name> add /path/to/dsh-insight   # install the working copy
dsh --profile <name>
```

`pnpm watch` rebuilds on change; the harness picks up the new bundle on page reload.

## License

[MIT](LICENSE)
