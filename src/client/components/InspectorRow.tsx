/**
 * 设置页里 inspector 的那一块：开关 + 触发修饰键 + 一句边界说明。
 *
 * 为什么单独一块而不是塞进摘要卡：摘要卡讲的是「这个 profile 现在什么样」，
 * 一句结论加六个数字，全是只读结论；inspector 是一个会改变页面行为的开关
 * （按住修饰键时点击会被截住），性质不同，混在一张卡里会让人以为它也是个数字。
 *
 * 边界那句话必须在这里写明：认不出包名的那些界面（洞察加载之前就注册好的，
 * 内置的多半如此）只会告诉你它插在哪个位置。不写的话使用者会以为功能坏了。
 */
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import { DEFAULT_PREFS, MODIFIERS, type ModifierId } from '../inspector/prefs.ts'
import { setPrefs, useInspectorPrefs } from '../inspector/store.ts'

/** 键帽上印的字：符号 + 键盘上的英文名，不翻译。 */
const KEY_CAPS: Record<ModifierId, string> = {
  meta: '⌘ Command',
  alt: '⌥ Option / Alt',
  ctrl: '⌃ Control',
  shift: '⇧ Shift',
}

/** 提示文案里的短写法（「按住 ⌥」）。 */
const KEY_GLYPHS: Record<ModifierId, string> = { meta: '⌘', alt: '⌥', ctrl: '⌃', shift: '⇧' }

export interface InspectorRowProps {
  t: TranslateNS<'dsh-insight'>
}

export function InspectorRow({ t }: InspectorRowProps) {
  const prefs = useInspectorPrefs()
  const keys = prefs.modifiers.map(id => KEY_GLYPHS[id]).join(' ')
  const isDefault = prefs.modifiers.join() === DEFAULT_PREFS.modifiers.join()

  const toggleModifier = (id: ModifierId) => {
    const next = prefs.modifiers.includes(id)
      ? prefs.modifiers.filter(x => x !== id)
      : MODIFIERS.filter(x => x === id || prefs.modifiers.includes(x))
    // 一个都不留就没法触发了：空选回落到默认，而不是留下一个开着却永远不响应的功能
    setPrefs({ ...prefs, modifiers: next.length > 0 ? next : [...DEFAULT_PREFS.modifiers] })
  }

  return (
    <div className="dsh-insight px-4 pb-4 text-primary">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-3 px-4 py-[13px]">
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium">{t('inspector.row')}</div>
            <div className="mt-0.5 text-[11.5px] leading-[1.5] text-secondary">
              {prefs.enabled ? t('inspector.rowOn', { keys }) : t('inspector.rowOff', { keys })}
            </div>
          </div>
          <Switch
            checked={prefs.enabled}
            onChange={next => setPrefs({ ...prefs, enabled: next })}
            label={t('inspector.row')}
          />
        </div>

        {prefs.enabled && (
          <>
            <div className="border-t border-line px-4 py-3">
              <div className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1 text-[11.5px] text-tertiary">{t('inspector.modifiers')}</span>
                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => setPrefs({ ...prefs, modifiers: [...DEFAULT_PREFS.modifiers] })}
                    className="shrink-0 text-[11.5px] text-brand-bright hover:opacity-80"
                  >
                    {t('inspector.reset')}
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {MODIFIERS.map(id => {
                  const on = prefs.modifiers.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleModifier(id)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors duration-150 ${
                        on ? 'border-brand bg-brand text-surface' : 'border-line text-secondary hover:bg-hover'
                      }`}
                    >
                      {KEY_CAPS[id]}
                    </button>
                  )
                })}
              </div>
            </div>
            <p className="m-0 border-t border-line px-4 py-2.5 text-[11px] leading-[1.55] text-caption">
              {t('inspector.coverage')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
