# Security Policy

## Reporting

Please report anything that looks like a security problem privately, through
[GitHub Security Advisories](https://github.com/gwsbhqt/dsh-insight/security/advisories/new),
rather than in a public issue. A first reply should arrive within a few days.

请通过 [GitHub Security Advisories](https://github.com/gwsbhqt/dsh-insight/security/advisories/new)
私下报告安全问题，不要开公开 issue。通常几天内会有第一次回复。

## What this plugin does and does not touch

洞察 is a read-only panel. Deliberate boundaries, all enforced in the host half:

| Boundary | How it is enforced |
| --- | --- |
| Never writes configuration | There is no write path in `src/host/` — no `writeFile`, no edit endpoint |
| Never reads credential bodies | `.credentials.yaml` is listed for path and size only, and is excluded from the preview allowlist (`src/host/files.ts`) |
| Credential *activation method* only | Read through the credential service's enumeration face, whose contract is "every stored record, values excluded" (`src/host/models.ts`) |
| File preview is allowlisted | `files/read` / `files/open` accept only host-discovered paths, validated after real-path resolution (`src/host/files.ts`) |
| No network calls | The model axis reads the llm service's local faces; the model-discovery endpoint, which would call your providers, is never invoked |
| The tool observer patches memory only | `src/host/tool-observer.ts` wraps `tools.register` on the live prototype; it writes no files and touches neither `node_modules` nor the harness installation |

The one action that leaves the browser is **open in editor**, on an allowlisted
config file or plugin directory, and only when you click it.

## Data leaving your machine

None. The panel talks to the local host half over the harness's package-private
RPC channel (`authority: 'loopback'`) and to nothing else.
