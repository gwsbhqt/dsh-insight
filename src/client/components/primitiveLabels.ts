/**
 * ui-primitives 的界面字串。
 *
 * dsh 0.1.2 起 `ReadBlock` 与 `JsonTree` 不再自带文案：`labels` 成了必填 prop，
 * 复制、展开、行数提示这些字全部由渲染方给。放在这里而不是各调用点内联，是为了
 * 让「上游要哪些字」只有一处答案——上游加一个字段，编译器只在这个文件报错。
 */
import type { JsonTreeLabels, ReadBlockLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'

type T = TranslateNS<'dsh-insight'>

/**
 * ReadBlock 的界面字串。
 * @param t - 本命名空间的 typed 翻译函数。
 */
export function readBlockLabels(t: T): ReadBlockLabels {
  return {
    window: (shown, total) => t('read.window', { shown, total }),
    copy: t('read.copy'),
    copied: t('read.copied'),
    collapse: t('read.collapse'),
    collapseAria: t('read.collapseAria'),
    expand: hidden => t('read.expand', { count: hidden }),
    expandAria: hidden => t('read.expandAria', { count: hidden }),
  }
}

/**
 * JsonTree 的界面字串。
 * @param t - 本命名空间的 typed 翻译函数。
 */
export function jsonTreeLabels(t: T): JsonTreeLabels {
  return {
    copyValue: t('json.copyValue'),
    copyJson: t('json.copyJson'),
    copyPath: t('json.copyPath'),
    copyPrettyJson: t('json.copyPrettyJson'),
    copyCompactJson: t('json.copyCompactJson'),
    copied: t('json.copied'),
    copyFailed: t('json.copyFailed'),
    collapseNode: t('json.collapseNode'),
    expandNode: t('json.expandNode'),
    copyButtonTitle: action => t('json.copyButtonTitle', { action }),
  }
}
