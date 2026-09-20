window.__ModuleLoader__.load({
	id: "@gwsbhqt/dsh-insight",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom = require("react-dom");
		//#region \0virtual:tailwind-css
		var _virtual_tailwind_css_default = "/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */\n@layer properties{@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) or ((-moz-orient:inline) and (not (color:rgb(from red r g b)))){*,:before,:after,::backdrop{--tw-translate-x:0;--tw-translate-y:0;--tw-translate-z:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scale-z:1;--tw-rotate-x:initial;--tw-rotate-y:initial;--tw-rotate-z:initial;--tw-skew-x:initial;--tw-skew-y:initial;--tw-border-style:solid;--tw-leading:initial;--tw-font-weight:initial;--tw-tracking:initial;--tw-ordinal:initial;--tw-slashed-zero:initial;--tw-numeric-figure:initial;--tw-numeric-spacing:initial;--tw-numeric-fraction:initial;--tw-shadow:0 0 #0000;--tw-shadow-color:initial;--tw-shadow-alpha:100%;--tw-inset-shadow:0 0 #0000;--tw-inset-shadow-color:initial;--tw-inset-shadow-alpha:100%;--tw-ring-color:initial;--tw-ring-shadow:0 0 #0000;--tw-inset-ring-color:initial;--tw-inset-ring-shadow:0 0 #0000;--tw-ring-inset:initial;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-offset-shadow:0 0 #0000;--tw-outline-style:solid;--tw-blur:initial;--tw-brightness:initial;--tw-contrast:initial;--tw-grayscale:initial;--tw-hue-rotate:initial;--tw-invert:initial;--tw-opacity:initial;--tw-saturate:initial;--tw-sepia:initial;--tw-drop-shadow:initial;--tw-drop-shadow-color:initial;--tw-drop-shadow-alpha:100%;--tw-drop-shadow-size:initial;--tw-backdrop-blur:initial;--tw-backdrop-brightness:initial;--tw-backdrop-contrast:initial;--tw-backdrop-grayscale:initial;--tw-backdrop-hue-rotate:initial;--tw-backdrop-invert:initial;--tw-backdrop-opacity:initial;--tw-backdrop-saturate:initial;--tw-backdrop-sepia:initial;--tw-duration:initial;--tw-ease:initial}}}@layer theme{:root,:host{--font-mono:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;--spacing:.25rem;--font-weight-normal:400;--font-weight-medium:500;--font-weight-semibold:600;--radius-sm:.25rem;--radius-md:.375rem;--radius-lg:.5rem;--radius-xl:.75rem;--radius-2xl:1rem;--ease-out:cubic-bezier(0, 0, .2, 1);--blur-sm:8px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4, 0, .2, 1);--color-primary:var(--dsw-alias-label-primary);--color-secondary:var(--dsw-alias-label-secondary);--color-tertiary:var(--dsw-alias-label-tertiary);--color-caption:var(--dsw-alias-label-caption);--color-dimmed:var(--dsw-alias-label-dimmed);--color-brand:var(--dsw-alias-brand-primary);--color-ok:var(--dsw-alias-state-success-primary);--color-err:var(--dsw-alias-state-error-primary);--color-warn:var(--dsw-alias-state-warn-label);--color-surface:var(--dsw-alias-bg-layer-1);--color-surface-2:var(--dsw-alias-bg-layer-2);--color-line:var(--dsw-alias-border-l1);--color-line-2:var(--dsw-alias-border-l2);--color-hover:var(--dsw-alias-interactive-bg-hover)}}@layer components{.dsh-insight,.dsh-insight *,.dsh-insight-dock,.dsh-insight-dock *{box-sizing:border-box}.dsh-truncate-head{text-align:left;direction:rtl}.dsh-soft-wrap pre,.dsh-soft-wrap code,.dsh-soft-wrap span{white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere}.dsh-insight [class*=_preview_],.dsh-insight [class*=_previewProperty_],.dsh-insight [class*=_previewEllipsis_]{display:none}.dsh-disclosure>summary .dsh-chevron{transition:transform .15s}.dsh-disclosure[open]>summary .dsh-chevron{transform:rotate(90deg)}@keyframes dsh-row-flash{0%,14%,42%,56%{background-color:color-mix(in srgb, var(--dsw-static-blue-500) 17%, transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-static-blue-500) 60%, transparent)}28%{background-color:#0000;box-shadow:inset 0 0 0 1px #0000}to{background-color:#0000;box-shadow:inset 0 0 0 1px #0000}}.dsh-row-flash{animation:1.1s ease-out dsh-row-flash}@media (prefers-reduced-motion:reduce){.dsh-row-flash{animation-duration:1ms}}.dsh-soft-wrap>[class*=_block_]{margin-top:0}.dsh-insight button{font:inherit;color:inherit;cursor:pointer;background:0 0;border:none;padding:0}@keyframes dsh-spin{to{transform:rotate(360deg)}}.dsh-spin{animation:1s linear infinite dsh-spin}@media (prefers-reduced-motion:reduce){.dsh-spin{animation:none}}}@layer utilities{.pointer-events-auto{pointer-events:auto}.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.visible{visibility:visible}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.sticky{position:sticky}.inset-0{inset:0}.top-0{top:0}.right-1\\.5{right:calc(var(--spacing) * 1.5)}.right-4{right:calc(var(--spacing) * 4)}.bottom-3{bottom:calc(var(--spacing) * 3)}.bottom-4{bottom:calc(var(--spacing) * 4)}.left-1\\/2{left:50%}.isolate{isolation:isolate}.z-10{z-index:10}.z-\\[1\\]{z-index:1}.z-\\[1010\\]{z-index:1010}.z-\\[2147483000\\]{z-index:2147483000}.container{width:100%}@media (min-width:40rem){.container{max-width:40rem}}@media (min-width:48rem){.container{max-width:48rem}}@media (min-width:64rem){.container{max-width:64rem}}@media (min-width:80rem){.container{max-width:80rem}}@media (min-width:96rem){.container{max-width:96rem}}.m-0{margin:0}.mt-0\\.5{margin-top:calc(var(--spacing) * .5)}.mt-1{margin-top:var(--spacing)}.mt-1\\.5{margin-top:calc(var(--spacing) * 1.5)}.mt-2{margin-top:calc(var(--spacing) * 2)}.mr-1\\.5{margin-right:calc(var(--spacing) * 1.5)}.mb-1{margin-bottom:var(--spacing)}.-ml-1{margin-left:calc(var(--spacing) * -1)}.ml-1{margin-left:var(--spacing)}.ml-1\\.5{margin-left:calc(var(--spacing) * 1.5)}.ml-2{margin-left:calc(var(--spacing) * 2)}.ml-auto{margin-left:auto}.box-border{box-sizing:border-box}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.size-1\\.5{width:calc(var(--spacing) * 1.5);height:calc(var(--spacing) * 1.5)}.size-2\\.5{width:calc(var(--spacing) * 2.5);height:calc(var(--spacing) * 2.5)}.size-5{width:calc(var(--spacing) * 5);height:calc(var(--spacing) * 5)}.size-7{width:calc(var(--spacing) * 7);height:calc(var(--spacing) * 7)}.h-7{height:calc(var(--spacing) * 7)}.h-\\[5px\\]{height:5px}.h-\\[55px\\]{height:55px}.h-px{height:1px}.max-h-\\[260px\\]{max-height:260px}.min-h-0{min-height:0}.min-h-\\[56px\\]{min-height:56px}.min-h-\\[240px\\]{min-height:240px}.w-4{width:calc(var(--spacing) * 4)}.w-7{width:calc(var(--spacing) * 7)}.w-8{width:calc(var(--spacing) * 8)}.w-\\[220px\\]{width:220px}.w-\\[360px\\]{width:360px}.w-full{width:100%}.w-max{width:max-content}.max-w-\\[440px\\]{max-width:440px}.max-w-\\[calc\\(100vw-16px\\)\\]{max-width:calc(100vw - 16px)}.max-w-\\[min\\(560px\\,70\\%\\)\\]{max-width:min(560px,70%)}.min-w-0{min-width:0}.flex-1{flex:1}.shrink{flex-shrink:1}.shrink-0{flex-shrink:0}.-translate-x-1\\/2{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}.translate-y-px{--tw-translate-y:1px;translate:var(--tw-translate-x) var(--tw-translate-y)}.scale-95{--tw-scale-x:95%;--tw-scale-y:95%;--tw-scale-z:95%;scale:var(--tw-scale-x) var(--tw-scale-y)}.scale-100{--tw-scale-x:100%;--tw-scale-y:100%;--tw-scale-z:100%;scale:var(--tw-scale-x) var(--tw-scale-y)}.rotate-90{rotate:90deg}.transform{transform:var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,)}.cursor-crosshair{cursor:crosshair}.cursor-default{cursor:default}.cursor-help{cursor:help}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.resize{resize:both}.list-none{list-style-type:none}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-\\[52px_minmax\\(0\\,1fr\\)\\]{grid-template-columns:52px minmax(0,1fr)}.grid-cols-\\[minmax\\(0\\,2fr\\)_minmax\\(360px\\,1fr\\)\\]{grid-template-columns:minmax(0,2fr) minmax(360px,1fr)}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-baseline{align-items:baseline}.items-center{align-items:center}.items-start{align-items:flex-start}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.gap-0\\.5{gap:calc(var(--spacing) * .5)}.gap-1{gap:var(--spacing)}.gap-1\\.5{gap:calc(var(--spacing) * 1.5)}.gap-2{gap:calc(var(--spacing) * 2)}.gap-2\\.5{gap:calc(var(--spacing) * 2.5)}.gap-3{gap:calc(var(--spacing) * 3)}.gap-\\[3px\\]{gap:3px}.gap-\\[7px\\]{gap:7px}.gap-\\[9px\\]{gap:9px}.gap-\\[15px\\]{gap:15px}.gap-x-3{column-gap:calc(var(--spacing) * 3)}.gap-x-5{column-gap:calc(var(--spacing) * 5)}.gap-y-2{row-gap:calc(var(--spacing) * 2)}.gap-y-\\[7px\\]{row-gap:7px}.truncate{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.overflow-y-auto{overflow-y:auto}.overscroll-contain{overscroll-behavior:contain}.rounded{border-radius:.25rem}.rounded-2xl{border-radius:var(--radius-2xl)}.rounded-\\[3px\\]{border-radius:3px}.rounded-\\[7px\\]{border-radius:7px}.rounded-\\[10px\\]{border-radius:10px}.rounded-full{border-radius:3.40282e38px}.rounded-lg{border-radius:var(--radius-lg)}.rounded-md{border-radius:var(--radius-md)}.rounded-sm{border-radius:var(--radius-sm)}.rounded-xl{border-radius:var(--radius-xl)}.border{border-style:var(--tw-border-style);border-width:1px}.border-0{border-style:var(--tw-border-style);border-width:0}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-y{border-block-style:var(--tw-border-style);border-block-width:1px}.border-t{border-top-style:var(--tw-border-style);border-top-width:1px}.border-r{border-right-style:var(--tw-border-style);border-right-width:1px}.border-b{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-l-2{border-left-style:var(--tw-border-style);border-left-width:2px}.border-dashed{--tw-border-style:dashed;border-style:dashed}.border-brand{border-color:var(--dsw-alias-brand-primary)}.border-brand-bright,.border-brand-bright\\/45{border-color:var(--dsw-static-blue-500)}@supports (color:color-mix(in lab, red, red)){.border-brand-bright\\/45{border-color:color-mix(in oklab, var(--dsw-static-blue-500) 45%, transparent)}}.border-err{border-color:var(--dsw-alias-state-error-primary)}.border-line{border-color:var(--dsw-alias-border-l1)}.border-line-2{border-color:var(--dsw-alias-border-l2)}.border-transparent{border-color:#0000}.border-warn\\/45{border-color:var(--dsw-alias-state-warn-label)}@supports (color:color-mix(in lab, red, red)){.border-warn\\/45{border-color:color-mix(in oklab, var(--dsw-alias-state-warn-label) 45%, transparent)}}.border-warn\\/70{border-color:var(--dsw-alias-state-warn-label)}@supports (color:color-mix(in lab, red, red)){.border-warn\\/70{border-color:color-mix(in oklab, var(--dsw-alias-state-warn-label) 70%, transparent)}}.bg-brand{background-color:var(--dsw-alias-brand-primary)}.bg-brand-bright,.bg-brand-bright\\/12{background-color:var(--dsw-static-blue-500)}@supports (color:color-mix(in lab, red, red)){.bg-brand-bright\\/12{background-color:color-mix(in oklab, var(--dsw-static-blue-500) 12%, transparent)}}.bg-current{background-color:currentColor}.bg-dimmed{background-color:var(--dsw-alias-label-dimmed)}.bg-hover{background-color:var(--dsw-alias-interactive-bg-hover)}.bg-line-2{background-color:var(--dsw-alias-border-l2)}.bg-surface{background-color:var(--dsw-alias-bg-layer-1)}.bg-surface-2{background-color:var(--dsw-alias-bg-layer-2)}.bg-transparent{background-color:#0000}.bg-warn\\/15{background-color:var(--dsw-alias-state-warn-label)}@supports (color:color-mix(in lab, red, red)){.bg-warn\\/15{background-color:color-mix(in oklab, var(--dsw-alias-state-warn-label) 15%, transparent)}}.p-0{padding:0}.p-0\\.5{padding:calc(var(--spacing) * .5)}.p-4{padding:calc(var(--spacing) * 4)}.p-5{padding:calc(var(--spacing) * 5)}.p-\\[18px\\]{padding:18px}.px-1\\.5{padding-inline:calc(var(--spacing) * 1.5)}.px-2\\.5{padding-inline:calc(var(--spacing) * 2.5)}.px-3{padding-inline:calc(var(--spacing) * 3)}.px-3\\.5{padding-inline:calc(var(--spacing) * 3.5)}.px-4{padding-inline:calc(var(--spacing) * 4)}.px-5{padding-inline:calc(var(--spacing) * 5)}.px-8{padding-inline:calc(var(--spacing) * 8)}.px-\\[13px\\]{padding-inline:13px}.px-\\[15px\\]{padding-inline:15px}.px-\\[18px\\]{padding-inline:18px}.py-0\\.5{padding-block:calc(var(--spacing) * .5)}.py-1{padding-block:var(--spacing)}.py-1\\.5{padding-block:calc(var(--spacing) * 1.5)}.py-2{padding-block:calc(var(--spacing) * 2)}.py-2\\.5{padding-block:calc(var(--spacing) * 2.5)}.py-3{padding-block:calc(var(--spacing) * 3)}.py-4{padding-block:calc(var(--spacing) * 4)}.py-14{padding-block:calc(var(--spacing) * 14)}.py-\\[3px\\]{padding-block:3px}.py-\\[5px\\]{padding-block:5px}.py-\\[7px\\]{padding-block:7px}.py-\\[11px\\]{padding-block:11px}.py-\\[13px\\]{padding-block:13px}.py-px{padding-block:1px}.pt-2\\.5{padding-top:calc(var(--spacing) * 2.5)}.pt-3\\.5{padding-top:calc(var(--spacing) * 3.5)}.pr-3{padding-right:calc(var(--spacing) * 3)}.pr-\\[18px\\]{padding-right:18px}.pr-\\[26px\\]{padding-right:26px}.pb-1{padding-bottom:var(--spacing)}.pb-2{padding-bottom:calc(var(--spacing) * 2)}.pb-4{padding-bottom:calc(var(--spacing) * 4)}.pb-\\[13px\\]{padding-bottom:13px}.pl-2\\.5{padding-left:calc(var(--spacing) * 2.5)}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.align-middle{vertical-align:middle}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.text-\\[10\\.5px\\]{font-size:10.5px}.text-\\[11\\.5px\\]{font-size:11.5px}.text-\\[11px\\]{font-size:11px}.text-\\[12\\.5px\\]{font-size:12.5px}.text-\\[12px\\]{font-size:12px}.text-\\[13\\.5px\\]{font-size:13.5px}.text-\\[13px\\]{font-size:13px}.text-\\[14px\\]{font-size:14px}.text-\\[15px\\]{font-size:15px}.text-\\[17px\\]{font-size:17px}.text-\\[19px\\]{font-size:19px}.leading-4{--tw-leading:calc(var(--spacing) * 4);line-height:calc(var(--spacing) * 4)}.leading-5{--tw-leading:calc(var(--spacing) * 5);line-height:calc(var(--spacing) * 5)}.leading-\\[1\\.3\\]{--tw-leading:1.3;line-height:1.3}.leading-\\[1\\.5\\]{--tw-leading:1.5;line-height:1.5}.leading-\\[1\\.6\\]{--tw-leading:1.6;line-height:1.6}.leading-\\[1\\.35\\]{--tw-leading:1.35;line-height:1.35}.leading-\\[1\\.55\\]{--tw-leading:1.55;line-height:1.55}.leading-\\[1\\.65\\]{--tw-leading:1.65;line-height:1.65}.leading-\\[26px\\]{--tw-leading:26px;line-height:26px}.leading-none{--tw-leading:1;line-height:1}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-normal{--tw-font-weight:var(--font-weight-normal);font-weight:var(--font-weight-normal)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.tracking-\\[-0\\.015em\\]{--tw-tracking:-.015em;letter-spacing:-.015em}.tracking-\\[0\\.1em\\]{--tw-tracking:.1em;letter-spacing:.1em}.tracking-\\[0\\.06em\\]{--tw-tracking:.06em;letter-spacing:.06em}.tracking-\\[0\\.08em\\]{--tw-tracking:.08em;letter-spacing:.08em}.break-all{word-break:break-all}.whitespace-nowrap{white-space:nowrap}.text-brand{color:var(--dsw-alias-brand-primary)}.text-brand-bright{color:var(--dsw-static-blue-500)}.text-caption{color:var(--dsw-alias-label-caption)}.text-dimmed{color:var(--dsw-alias-label-dimmed)}.text-err{color:var(--dsw-alias-state-error-primary)}.text-primary{color:var(--dsw-alias-label-primary)}.text-secondary{color:var(--dsw-alias-label-secondary)}.text-surface{color:var(--dsw-alias-bg-layer-1)}.text-tertiary{color:var(--dsw-alias-label-tertiary)}.text-warn{color:var(--dsw-alias-state-warn-label)}.uppercase{text-transform:uppercase}.tabular-nums{--tw-numeric-spacing:tabular-nums;font-variant-numeric:var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,)}.line-through{text-decoration-line:line-through}.opacity-0{opacity:0}.opacity-55{opacity:.55}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-100{opacity:1}.shadow-2xl{--tw-shadow:0 25px 50px -12px var(--tw-shadow-color,#00000040);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a), 0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-sm{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a), 0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px var(--tw-shadow-color,#0000001a), 0 8px 10px -6px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring-1{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}.ring-line{--tw-ring-color:var(--dsw-alias-border-l1)}.outline{outline-style:var(--tw-outline-style);outline-width:1px}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,) var(--tw-drop-shadow,)}.backdrop-blur-sm{--tw-backdrop-blur:blur(var(--blur-sm));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.backdrop-filter{-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter,display,content-visibility,overlay,pointer-events;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-transform{transition-property:transform,translate,scale,rotate;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-150{--tw-duration:.15s;transition-duration:.15s}.duration-200{--tw-duration:.2s;transition-duration:.2s}.ease-out{--tw-ease:var(--ease-out);transition-timing-function:var(--ease-out)}.outline-none{--tw-outline-style:none;outline-style:none}.select-none{-webkit-user-select:none;user-select:none}@media (hover:hover){.group-hover\\/path\\:text-brand-bright:is(:where(.group\\/path):hover *){color:var(--dsw-static-blue-500)}}.placeholder\\:text-tertiary::placeholder{color:var(--dsw-alias-label-tertiary)}.last\\:border-0:last-child{border-style:var(--tw-border-style);border-width:0}@media (hover:hover){.hover\\:border-current:hover{border-color:currentColor}.hover\\:bg-hover:hover{background-color:var(--dsw-alias-interactive-bg-hover)}.hover\\:text-brand-bright:hover{color:var(--dsw-static-blue-500)}.hover\\:text-primary:hover{color:var(--dsw-alias-label-primary)}.hover\\:text-secondary:hover{color:var(--dsw-alias-label-secondary)}.hover\\:opacity-80:hover{opacity:.8}.hover\\:opacity-85:hover{opacity:.85}}.focus\\:border-line-2:focus{border-color:var(--dsw-alias-border-l2)}.\\[\\&\\:\\:-webkit-details-marker\\]\\:hidden::-webkit-details-marker{display:none}}.dsh-insight [class*=_root_]{overscroll-behavior:auto;overflow:visible}.dsh-insight p{margin:0}.dsh-insight [class*=_bubble_]{word-break:break-all}@property --tw-translate-x{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-y{syntax:\"*\";inherits:false;initial-value:0}@property --tw-translate-z{syntax:\"*\";inherits:false;initial-value:0}@property --tw-scale-x{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-y{syntax:\"*\";inherits:false;initial-value:1}@property --tw-scale-z{syntax:\"*\";inherits:false;initial-value:1}@property --tw-rotate-x{syntax:\"*\";inherits:false}@property --tw-rotate-y{syntax:\"*\";inherits:false}@property --tw-rotate-z{syntax:\"*\";inherits:false}@property --tw-skew-x{syntax:\"*\";inherits:false}@property --tw-skew-y{syntax:\"*\";inherits:false}@property --tw-border-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-leading{syntax:\"*\";inherits:false}@property --tw-font-weight{syntax:\"*\";inherits:false}@property --tw-tracking{syntax:\"*\";inherits:false}@property --tw-ordinal{syntax:\"*\";inherits:false}@property --tw-slashed-zero{syntax:\"*\";inherits:false}@property --tw-numeric-figure{syntax:\"*\";inherits:false}@property --tw-numeric-spacing{syntax:\"*\";inherits:false}@property --tw-numeric-fraction{syntax:\"*\";inherits:false}@property --tw-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:\"*\";inherits:false}@property --tw-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:\"*\";inherits:false}@property --tw-inset-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:\"*\";inherits:false}@property --tw-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:\"*\";inherits:false}@property --tw-inset-ring-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:\"*\";inherits:false}@property --tw-ring-offset-width{syntax:\"<length>\";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:\"*\";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:\"*\";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:\"*\";inherits:false;initial-value:solid}@property --tw-blur{syntax:\"*\";inherits:false}@property --tw-brightness{syntax:\"*\";inherits:false}@property --tw-contrast{syntax:\"*\";inherits:false}@property --tw-grayscale{syntax:\"*\";inherits:false}@property --tw-hue-rotate{syntax:\"*\";inherits:false}@property --tw-invert{syntax:\"*\";inherits:false}@property --tw-opacity{syntax:\"*\";inherits:false}@property --tw-saturate{syntax:\"*\";inherits:false}@property --tw-sepia{syntax:\"*\";inherits:false}@property --tw-drop-shadow{syntax:\"*\";inherits:false}@property --tw-drop-shadow-color{syntax:\"*\";inherits:false}@property --tw-drop-shadow-alpha{syntax:\"<percentage>\";inherits:false;initial-value:100%}@property --tw-drop-shadow-size{syntax:\"*\";inherits:false}@property --tw-backdrop-blur{syntax:\"*\";inherits:false}@property --tw-backdrop-brightness{syntax:\"*\";inherits:false}@property --tw-backdrop-contrast{syntax:\"*\";inherits:false}@property --tw-backdrop-grayscale{syntax:\"*\";inherits:false}@property --tw-backdrop-hue-rotate{syntax:\"*\";inherits:false}@property --tw-backdrop-invert{syntax:\"*\";inherits:false}@property --tw-backdrop-opacity{syntax:\"*\";inherits:false}@property --tw-backdrop-saturate{syntax:\"*\";inherits:false}@property --tw-backdrop-sepia{syntax:\"*\";inherits:false}@property --tw-duration{syntax:\"*\";inherits:false}@property --tw-ease{syntax:\"*\";inherits:false}";
		//#endregion
		//#region src/client/styles.ts
		/**
		* 把构建期编好的 Tailwind 产物注入页面：带 data-plugin 标记的 <style>，按 tagId 幂等
		* （HMR 重载会再执行模块，不查重会堆重复标签）。
		*/
		const PLUGIN = "@gwsbhqt/dsh-insight";
		const TAG_ID = `${PLUGIN}/tailwind.css`;
		function installStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector(`style[data-plugin-css=${JSON.stringify(TAG_ID)}]`) !== null) return;
			const tag = document.createElement("style");
			tag.dataset["plugin"] = PLUGIN;
			tag.dataset["pluginCss"] = TAG_ID;
			tag.textContent = _virtual_tailwind_css_default;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/locale.ts
		const INSIGHT_NS = "dsh-insight";
		const zh = {
			"summary.healthy": "一切正常",
			"summary.healthyNote": "{count} 个插件，没有需要你处理的",
			"summary.needsAttention": "{count} 处需要注意",
			"summary.plugins": "个插件",
			"summary.active": "运行中",
			"summary.disabled": "已禁用",
			"summary.attention": "需要注意",
			"summary.overrides": "你改过",
			"summary.runtimeOnly": "运行时注册",
			"summary.layers": "配置层",
			"summary.toolsEnabled": "工具插件可用",
			"summary.tools": "个工具",
			"summary.lastLayer": "末层 {label}",
			"summary.open": "打开洞察",
			"summary.openHint": "搜索、溯源、依赖关系、影响面\n都在里面",
			"summary.staleHost": "host 进程比前端旧（改完没重启），这份摘要是前端自己算的。重启 dsh 后恢复正常。",
			"restart.now": "立即重启",
			"restart.confirm": "确认重启",
			"restart.working": "正在重启",
			"restart.hint": "关掉当前 dsh，按同样的方式再拉起一个。改过的配置、装过的插件都会在新进程里生效。",
			"restart.hintConfirm": "再点一次就动手；新进程起来后这个页面会自动刷新。",
			"restart.hintBusy": "{count} 个会话正在执行，重启会把它们打断——等它们跑完这个按钮就亮了。",
			"restart.hintWorking": "已经在换进程了，等新的那个起来就刷新页面。",
			"restart.hintProbing": "正在问当前 dsh 的状态…",
			"restart.hintUnknown": "问不到当前 dsh 的状态，所以先按不动。最常见的原因是 host 进程比这个界面旧——它是长驻的，装完/改完不重启就不会更新。手动重启一次 dsh，这个按钮之后就能用了。",
			"restart.hintSupervised": "这台机器上的 dsh 由 {name} 看着，重启归它管：从这里关掉进程，它多半再也起不来。",
			"restart.hintOff": "这个 dsh 关掉了自助重启（DSH_INSIGHT_ALLOW_RESTART=0）。",
			"restart.fail": "没能重启：{message}",
			"restart.timeout": "等了一分钟，新进程还没起来。去终端看一眼 dsh 的输出，或者手动重启。",
			"col.preset": "预设",
			"preset.from": "来自",
			"preset.plugins": "插件",
			"preset.default": "默认",
			"preset.inUse": "在用 {count}",
			"preset.sessionsTotal": "点名过 {count} 次",
			"preset.sessionsTotalNote": "有多少个会话在创建时明确点名了它（全量历史）。「在用」数的是此刻活着的会话、按最后一次切换算，两者口径不同。",
			"preset.sessionsUnnamed": "另有 {count} 个会话创建时没点名预设",
			"preset.sessionsUnnamedNote": "它们跑的是「当时」的默认预设。默认是可以改的，所以不把它们算到现在这一行上——那等于替过去的会话编一个它们从没选过的预设。",
			"preset.brokenMark": "坏了",
			"preset.empty": "这个 profile 一个预设都没有",
			"preset.emptyWhy": "预设服务在，扫过了它配的那些目录，里面确实没有预设。要加的话，去「Agent 预设」那一页复制一份现成的改。",
			"preset.noService": "预设服务不在",
			"preset.noServiceWhy": "这个 profile 里没有插件在提供 agentPresets 这个服务——要么没装 agent-presets，要么它被关掉了。没有它，会话开起来时也挂不上任何预设。",
			"preset.noServiceGoto": "去看 {id} 这一条",
			"preset.stale": "host 比这个界面旧",
			"preset.staleWhy": "host 进程还不认识预设清单这个端点。它是长驻的，装完/改完不重启就不会更新——重启一次 dsh 这一轴就有了。",
			"preset.head": "预设",
			"preset.trust.system": "随部署一起发的",
			"preset.trust.user": "本地写的",
			"preset.what": "一个预设 = 一份 agent 面的插件组合。会话开起来的时候挑一个，它决定这个会话手里有哪些工具、看到哪些提示词。",
			"preset.defaultNote": "会话没点名预设时挂的就是它。",
			"preset.userTrustNote": "本地写的预设和 shell 权限同级：它直接决定模型手里有哪些工具，所以「谁写的」和「它是不是官方发的」不是同一个问题。",
			"preset.root": "扫出它的目录",
			"preset.dir": "预设目录",
			"preset.composition": "组成",
			"preset.file": "配置文件",
			"preset.meta": "显示信息",
			"preset.group": "组",
			"preset.isolate": "私有 realm",
			"preset.exprNote": "开关写的是表达式，静态侧不求值——真假要到运行时才知道",
			"preset.planeNote": "这些是 agent 面的插件，预设挂上去之后才会出现在插件树里。点包名跳过去看那个包的档案——磁盘路径、服务接线都是同一个包的；只有 config 是运行时那一份，跟这个预设里写的不一定相同。",
			"preset.rowsError": "读不出组成：{message}",
			"preset.sessions": "在用会话",
			"preset.noSessions": "此刻没有会话在用它",
			"preset.sessionsUnknown": "读不到会话实况，用没用不好说",
			"preset.roots": "扫描目录",
			"preset.rootCount": "这个目录里共 {count} 个预设",
			"preset.rootEmpty": "一个都没有",
			"preset.brokenNote": "这个预设装不上：{reason}",
			"preset.brokenWhy": "坏了的预设仍然留在名单上——藏起来的话它照样占着这个 id，你却看不见也删不掉。",
			"col.action": "操作",
			"toggle.off": "禁用",
			"toggle.on": "启用",
			"toggle.confirmOff": "确认禁用",
			"toggle.confirmOn": "确认启用",
			"toggle.working": "写入中",
			"toggle.twins": "这个 id 在运行时有两份（宿主面一份、会话把预设挂上来又一份），面板分不清你点的是哪一行。补丁本身是有效的——想写就手写到 profile 补丁层，它命中的是配置里那一条",
			"toggle.notInConfig": "配置里没有这一条（运行时注册的插件、或者只存在于预设里的行就是这样），按 id 写补丁命不中它。要关它得去关注册它的那个插件",
			"toggle.dupInConfig": "配置里有好几条都叫这个 id，按 id 写下去会同时命中它们——面板不猜",
			"toggle.unsupported": "host 进程比这个界面旧，还不认识这个写入端点。重启 dsh 后可用。",
			"toggle.doneInserted": "已在 profile 补丁层新加一段：{id} → {state}。改动落在 {path}",
			"toggle.doneUpdated": "已改 profile 补丁层里的 {id} → {state}。改动落在 {path}",
			"toggle.doneRemoved": "{id} 不写这一行就已经是{state}了，所以把补丁层里那一段删掉，没留一行废话。改动落在 {path}",
			"toggle.doneUnchanged": "{id} 本来就是{state}，文件一个字节都没动。",
			"toggle.stateOff": "禁用",
			"toggle.stateOn": "启用",
			"toggle.fail": "没写成：{message}",
			"toggle.restartHint": "补丁层是热加载的；这一条没立刻生效的话，用上面的「立即重启」换个进程。",
			"toggle.dismiss": "知道了",
			"inspector.row": "点界面查插件",
			"inspector.rowOn": "已开启 · 按住 {keys} 悬停高亮、点击跳到那个插件",
			"inspector.rowOff": "开了之后按住 {keys}，就能指着界面上任意一块问「这是谁插进来的」",
			"inspector.modifiers": "触发修饰键（按住悬停 / 点击，可组合）",
			"inspector.reset": "还原默认",
			"inspector.coverage": "在洞察之前就装好的那些界面认不出包名（内置的多半如此），那种情况只告诉你它插在哪个位置。刷新页面不改变这一点。",
			"inspector.badgeHint": "点击跳到这个插件 · 按住不放点右键看整条层级",
			"inspector.foreignLegend": "琥珀框 = 非官方插件插进来的，这一屏 {count} 处",
			"inspector.menuTitle": "当前 → 根",
			"inspector.menuHint": "点任意一层，跳到插在那一层的插件",
			"inspector.unknown": "认不出是哪个包",
			"inspector.unknownAs": "认不出是哪个包（注册名 {name}）",
			"inspector.noFrames": "这块不是插件插进来的，或者读不到它的渲染信息",
			"inspector.onlyAnchor": "只知道它在 {slot} 这个位置，认不出是哪个包",
			"inspector.notInTree": "插件树里没有这个包",
			"inspector.jumped": "已跳到 {pkg}",
			"section.label": "洞察",
			"workbench.title": "洞察",
			"axis.plug": "按插件",
			"axis.layer": "按配置",
			"axis.svc": "按服务",
			"axis.tool": "按工具",
			"axis.preset": "按预设",
			"tool.name": "工具",
			"tool.disabledGroup": "已禁用 {count} 个",
			"tool.siblings": "连带",
			"tool.siblingsHead": "同插件的另外 {count} 个工具",
			"tool.siblingsNote": "关掉 {plugin} 会连同这 {count} 个工具一起消失。",
			"tool.from": "来自",
			"tool.source": "来源",
			"tool.srcScan": "源码推测",
			"tool.srcRuntimeNote": "运行时观察到的真实注册——agent 跑起来时旁听到的。",
			"tool.srcScanNote": "从插件构建产物里扫出来的字面量，是推测：上游改了打包方式或把名字写成变量，这一条就会消失。",
			"tool.howToDisable": "要关掉这个工具，就去把注册它的那个插件禁掉——点上面的插件名跳过去。同一个插件注册的其他工具会一起关掉。",
			"tool.head": "工具插件",
			"tool.pkg": "包",
			"tool.state": "状态",
			"tool.enabled": "可用",
			"tool.disabled": "已禁用",
			"tool.split": "两处不一致",
			"tool.empty": "没有注册工具的插件。",
			"tool.entries": "运行时的 {count} 份",
			"tool.hostPlane": "顶层",
			"tool.acts": "配置层对它做过什么",
			"tool.enabledNote": "它在运行，agent 能拿到它注册的工具。",
			"tool.disabledNote": "所有份都被关掉了，agent 拿不到它注册的工具。",
			"tool.splitNote": "同一个插件在插件树里有两份，状态还不一样——只看其中一份会得出错误结论。只要有一份在跑，agent 就拿得到它的工具。",
			"tool.limitNote": "这一行是「注册工具的插件」，不是一个具体工具。插件实际注册了哪些工具名（Bash、Read…）要 agent 跑起来、预设挂成 scope 之后才存在，静态读不到；而且工具定义里不带注册者信息，即便读到也反查不回插件。要关掉它注册的工具，就在这里把这个插件禁掉。",
			"axis.model": "按模型",
			"col.model": "模型",
			"model.from": "来自",
			"model.siblings": "连带",
			"model.default": "默认",
			"model.defaultNote": "agent 现在实际用的就是它。",
			"model.plugin": "由谁提供",
			"model.configAt": "配置在",
			"model.auth": "激活",
			"auth.env": "环境变量里的 API key",
			"auth.api-key": "存起来的 API key",
			"auth.oauth": "OAuth 授权",
			"auth.none": "没有凭据",
			"model.modalities": "输入",
			"model.siblingsHead": "{provider} 下的另外 {count} 个模型",
			"model.siblingsNote": "这些模型由插件 {plugin} 接进来。把它禁掉，同一条 provider 下的 {count} 个模型会一起消失；只想换默认模型的话，改 agent-default-model 的设置就行。",
			"model.howToSwitch": "要换默认模型，改 agent-default-model 的设置。",
			"model.dormantGroup": "可配未配的 provider {count} 个",
			"model.dormant": "未配置",
			"model.noModels": "无模型",
			"model.wired": "已接线",
			"model.unwired": "未接线",
			"model.dormantNote": "上游声明了这条 provider 路由可以配置，但你还没配——在设置里填上凭据和模型清单，它才会接上并出现在模型列表里。",
			"model.noModelsNote": "这条 provider 接上了 adapter，但它没报出任何模型——多半是配置里的模型清单是空的。",
			"model.empty": "llm 服务不在，或者没有任何 provider 接上 adapter。",
			"model.stale": "host 还不认识模型端点——重启 dsh 之后这一轴才有内容。",
			"summary.presets": "个预设",
			"summary.models": "个模型",
			"col.mark": "标记",
			"plugins.holds": "装着 {count} 个",
			"plugins.container": "容器",
			"plugins.settingsOnly": "设置命名空间",
			"plugins.settingsOnlyNote": "这一行不是插件，是一份挂不上插件的设置。要么它的命名空间和插件的短 id 不一样（比如 shell 的设置归 shell-env 插件），要么注册它的插件根本不在 host 的插件树里（客户端插件就是这样）。上游的设置接口不记录是谁注册的，所以这里不猜——设置本身是真的，改动照样生效。",
			"plugins.containerNote": "它自己是个插件，同时还装着 {count} 个子插件——展开左边那一行能看到它们。禁掉它，里面的全都跟着没了。",
			"plugins.groupOnly": "这是个纯分组容器（cordis 内置），用来把相关的插件收在一起，本身不做事。",
			"col.plugin": "插件",
			"col.config": "配置",
			"layers.file": "文件",
			"layers.orderNote": "自上而下依次应用：编号越大越晚应用，后面的覆盖前面的。",
			"layers.lastWins": "最后应用",
			"layers.firstApplied": "最先应用",
			"layers.acts": "这一层做了什么",
			"filter.all": "全部",
			"filter.attention": "需要注意",
			"filter.overridden": "你改过",
			"filter.disabled": "已禁用",
			"filter.runtime": "运行时注册",
			"filter.foreign": "非官方",
			"filter.userdisabled": "你禁用",
			"filter.bundledisabled": "插件禁用",
			"filter.runtimedisabled": "运行时禁用",
			"vendor.third-party": "三方",
			"vendor.local": "本地",
			"vendor.official": "官方",
			"vendor.head": "出处",
			"vendor.thirdPartyNote": "不是 @deepseek-ai 发的包。它能做的事和官方插件一样多，装之前值得看一眼来源。",
			"vendor.localNote": "跑的是你磁盘上的这份代码，不是从 registry 装的——改了它立刻生效，也不会被 pnpm 覆盖掉。",
			"mark.overridden": "你改过",
			"mark.pendingRestart": "待重启",
			"mark.pendingRestartHint": "补丁层已经改了，这个进程还在按旧配置跑——用上面的「立即重启」换个进程就生效",
			"mark.runtime": "运行时注册",
			"mark.missingProvider": "缺提供者",
			"detail.hint": "选一个插件看它的档案：来源层、磁盘路径、提供与依赖的服务接线、配置怎么一层层叠出来的、注册了哪些设置。\n切到「按层」看某一层改了什么，切到「按服务」看插件之间靠什么连起来。",
			"detail.origin": "来源",
			"detail.fullId": "完整 id",
			"detail.path": "路径",
			"detail.twin": "同名的另一个",
			"detail.neighborhood": "一度邻域",
			"detail.settings": "设置",
			"detail.stack": "配置怎么叠出来的",
			"detail.finalConfig": "最终配置",
			"detail.waitingNote": "依赖的服务还没出现。",
			"detail.missingNote": "{services} 没有任何插件提供。",
			"detail.mismatchCollision": "短 id 撞名：这个 id 在运行时出现 {count} 次，宿主面与预设 realm 各一个，对账时无从判断该跟哪一个比。不是配置问题。",
			"detail.mismatchExpr": "配置里 disabled 写的是 !!js 表达式，重放按约定不求值，静态侧无法判定。差异来自重放本身。",
			"detail.disabledNote": "被配置层显式关掉，没有运行。",
			"detail.manyConsumers": "{count} 个消费者，见下方邻域",
			"nb.dependedBy": "依赖它的",
			"nb.dependsOn": "它依赖的",
			"nb.noneIn": "没有人依赖它 —— 关掉它不影响别人",
			"nb.noneOut": "不依赖任何插件",
			"nb.middle": "中间层",
			"nb.base": "被依赖的底座",
			"nb.leaf": "末端消费者",
			"impact.title": "禁用 {name} 会波及",
			"impact.hop": "{n} 跳 · {count}",
			"svc.service": "服务",
			"svc.provider": "提供者",
			"svc.consumers": "被依赖",
			"svc.consumersN": "消费者 {count}",
			"svc.sub": "服务 · {count} 个消费者",
			"svc.builtin": "内置 · 无插件提供",
			"svc.builtinNote": "cordis / 宿主内置服务，本来就没有插件提供它。",
			"svc.noProvider": "没有提供者",
			"svc.unused": "无人用",
			"svc.unusedNote": "没有插件依赖它。",
			"layers.order": "第 {n} 层",
			"layers.bundleLayer": "bundle 层",
			"layers.profileLayer": "profile 层",
			"layers.lowest": "优先级最低",
			"layers.highest": "优先级最高",
			"layers.highestNote": "它排在最后，所以同一个 entry 上它说了算。",
			"layers.onlyInserts": "这一层只是把自己的插件插进来，没有改动别人。",
			"layers.notMerged": "不参与合并",
			"layers.notMergedNote": "不参与插件补丁的合并顺序",
			"layers.readonly": "只读",
			"layers.writable": "可写",
			"layers.empty": "没有补丁层。",
			"layers.noContent": "（无文件内容）",
			"files.rootConfig": "profile 主配置",
			"files.settings": "用户设置",
			"files.credentials": "凭据",
			"files.patch": "补丁层",
			"files.credentialsNote": "凭据文件 · 不可读取正文",
			"files.notMergedWhy": "它不在插件补丁的加载序列里，所以没有序号，也没有「插入 / 覆盖 / 禁用」——它不改动任何 entry。列在这里是因为你排查时需要它的路径。",
			"files.empty": "没有发现配置文件。",
			"graph.provides": "提供",
			"graph.requires": "依赖",
			"graph.noConsumer": "无人消费",
			"graph.noProvider": "没有提供者",
			"graph.isolated": "不提供也不依赖任何服务。",
			"action.refresh": "刷新",
			"action.close": "关闭",
			"search.placeholder": "搜插件 / 包名 / 服务名…",
			"search.clear": "清空搜索",
			"path.copy": "复制路径",
			"path.copied": "已复制",
			"path.openIde": "在编辑器中打开",
			"preview.close": "关闭",
			"preview.truncated": "文件较大，仅预览前 256 KB。",
			"status.loading": "加载中…",
			"status.error": "加载失败：{message}",
			"status.noMatch": "无匹配结果",
			"status.noMatchWhy": "换个搜索词，或者点上面的「全部」把筛选放开。",
			"plugins.disabledGroup": "已禁用 {count} 条",
			"plugins.empty": "没有插件。",
			"plugins.rawState": "未识别的 FiberState 原始码：{code}",
			"event.insert": "插入",
			"event.update": "覆盖",
			"event.disable": "禁用",
			"event.enable": "启用",
			"dossier.mismatch": "状态差异",
			"dossier.noIntent": "配置层里没有这一条，是运行时动态装上去的，所以没有溯源。",
			"state.active": "运行中",
			"state.disabled": "已禁用",
			"off.user": "你禁用",
			"off.bundle": "插件禁用",
			"off.runtime": "运行时禁用",
			"off.userNote": "你在自己的补丁层里关掉的。点右边的「启用」就能撤，那一段会被删掉。",
			"off.bundleNote": "某个插件自带的补丁层把它关掉的，不是你关的——下面「配置怎么叠出来的」里能看到是哪一层。点「启用」会在你自己的层写一行盖过它。",
			"off.runtimeNote": "配置层里没人明确关它，是运行时才关的：多半 disabled 写的是 `!!js` 表达式（比如只在某个平台开），也可能是它所在的容器被关了。点「启用」会在你的层写一行 disabled: false 盖过那个表达式——容器被关的话得先开容器。",
			"state.pending": "待加载",
			"state.loading": "加载中",
			"state.failed": "加载失败",
			"state.disposed": "已释放",
			"state.unknown": "未知状态",
			"settings.secrets": "密钥位：",
			"settings.secretUnset": "（未设置）",
			"settings.effective": "当前生效",
			"settings.base": "插件默认",
			"settings.user": "你的覆盖",
			"read.window": "显示 {shown} 行，共 {total} 行",
			"read.copy": "复制",
			"read.copied": "已复制",
			"read.collapse": "折叠",
			"read.collapseAria": "折叠中间部分",
			"read.expand": "展开 {count} 行",
			"read.expandAria": "展开中间隐藏的 {count} 行",
			"json.copyValue": "复制值",
			"json.copyJson": "复制 JSON",
			"json.copyPath": "复制路径",
			"json.copyPrettyJson": "复制 JSON（带缩进）",
			"json.copyCompactJson": "复制 JSON（压缩成一行）",
			"json.copied": "已复制",
			"json.copyFailed": "复制失败",
			"json.collapseNode": "折叠",
			"json.expandNode": "展开",
			"json.copyButtonTitle": "{action}"
		};
		const en = {
			"summary.healthy": "All clear",
			"summary.healthyNote": "{count} plugins, nothing needs you",
			"summary.needsAttention": "{count} need attention",
			"summary.plugins": "plugins",
			"summary.active": "running",
			"summary.disabled": "disabled",
			"summary.attention": "need attention",
			"summary.overrides": "you changed",
			"summary.runtimeOnly": "runtime-registered",
			"summary.layers": "config layers",
			"summary.toolsEnabled": "tool plugins live",
			"summary.tools": "tools",
			"summary.lastLayer": "last: {label}",
			"summary.open": "Open Insight",
			"summary.openHint": "Search, attribution, dependencies\nand blast radius live there",
			"summary.staleHost": "The host process is older than this UI (rebuilt without a restart); this summary was computed in the browser. Restart dsh to go back to normal.",
			"restart.now": "Restart now",
			"restart.confirm": "Confirm restart",
			"restart.working": "Restarting",
			"restart.hint": "Stops this dsh and starts a new one the same way. Config edits and newly installed plugins take effect in the new process.",
			"restart.hintConfirm": "One more click does it; this page reloads once the new process is up.",
			"restart.hintBusy": "{count} session(s) still running — a restart would cut them off. The button lights up when they finish.",
			"restart.hintWorking": "Swapping processes; this page reloads as soon as the new one is up.",
			"restart.hintProbing": "Asking this dsh how it is doing…",
			"restart.hintUnknown": "Can't read this dsh's status, so the button stays off. The usual cause is a host process older than this UI — the host is long-lived and only picks up changes on a restart. Restart dsh by hand once and the button works from then on.",
			"restart.hintSupervised": "{name} manages dsh on this machine, so restarts belong to it: killing the process from here will most likely leave nothing running.",
			"restart.hintOff": "Self-restart is turned off for this dsh (DSH_INSIGHT_ALLOW_RESTART=0).",
			"restart.fail": "Restart failed: {message}",
			"restart.timeout": "Waited a minute and the new process never came up. Check the dsh output in your terminal, or restart it by hand.",
			"col.preset": "Preset",
			"preset.from": "From",
			"preset.plugins": "plugins",
			"preset.default": "default",
			"preset.inUse": "in use ({count})",
			"preset.sessionsTotal": "named {count} times",
			"preset.sessionsTotalNote": "How many sessions named it explicitly at creation (all time). In use counts live sessions by their latest switch, so the two are different measures.",
			"preset.sessionsUnnamed": "{count} more sessions named no preset at creation",
			"preset.sessionsUnnamedNote": "They ran on whatever was default at the time. The default can change, so they are not counted into this row — that would credit past sessions to a preset they never chose.",
			"preset.brokenMark": "broken",
			"preset.empty": "This profile has no presets at all",
			"preset.emptyWhy": "The preset service is present and its configured roots were scanned; there is genuinely nothing in them. To add one, copy an existing preset from the Agent presets page.",
			"preset.noService": "The preset service is not here",
			"preset.noServiceWhy": "Nothing in this profile provides the agentPresets service — agent-presets is either not installed or turned off. Without it a session cannot mount any preset either.",
			"preset.noServiceGoto": "Open {id}",
			"preset.stale": "The host is older than this UI",
			"preset.staleWhy": "It does not know the preset endpoint yet. The host is long-lived and only picks up changes on a restart — restart dsh once and this axis fills in.",
			"preset.head": "Preset",
			"preset.trust.system": "shipped with the deployment",
			"preset.trust.user": "authored locally",
			"preset.what": "A preset is one agent-plane plugin composition. A session picks one when it starts, and that decides which tools it holds and which prompt sections it sees.",
			"preset.defaultNote": "This is what a session gets when it names no preset.",
			"preset.userTrustNote": "A locally authored preset carries the same trust as shell access: it decides what tools the model holds, so \"who wrote it\" and \"is it official\" are two different questions.",
			"preset.root": "Discovered under",
			"preset.dir": "Preset directory",
			"preset.composition": "Composition",
			"preset.file": "Composition file",
			"preset.meta": "Display metadata",
			"preset.group": "group",
			"preset.isolate": "private realm",
			"preset.exprNote": "the switch is an expression; nothing is evaluated statically, so its value is a runtime fact",
			"preset.planeNote": "These are agent-plane plugins; they appear in the plugin tree only once a preset is mounted. Click a package name to open that package’s dossier — same disk path, same service wiring; only the config shown there is the runtime one, which need not match what this preset writes.",
			"preset.rowsError": "Composition unreadable: {message}",
			"preset.sessions": "Sessions using it",
			"preset.noSessions": "No session is using it right now",
			"preset.sessionsUnknown": "Live session data is unavailable, so usage is unknown",
			"preset.roots": "Scanned roots",
			"preset.rootCount": "{count} preset(s) in this directory",
			"preset.rootEmpty": "none",
			"preset.brokenNote": "This preset cannot be mounted: {reason}",
			"preset.brokenWhy": "A broken preset stays on the roster — hiding it would leave its directory occupying the id with nothing to see or delete.",
			"col.action": "Action",
			"toggle.off": "Disable",
			"toggle.on": "Enable",
			"toggle.confirmOff": "Confirm disable",
			"toggle.confirmOn": "Confirm enable",
			"toggle.working": "Writing",
			"toggle.twins": "This id exists twice at runtime (once on the host plane, once from a preset a session mounted), so the panel cannot tell which row you clicked. The patch itself would work — write it into your profile patch layer by hand and it targets the config entry",
			"toggle.notInConfig": "The config has no such entry (runtime-registered plugins, and rows that exist only inside a preset, look like this), so an id-targeted patch can never match it. To turn it off, turn off the plugin that registers it",
			"toggle.dupInConfig": "Several config entries share this id; an id-targeted patch would hit all of them — the panel will not guess",
			"toggle.unsupported": "The host process is older than this UI and does not know this write endpoint. Restart dsh to use it.",
			"toggle.doneInserted": "Added a new entry to your profile patch layer: {id} → {state}. Written to {path}",
			"toggle.doneUpdated": "Updated {id} → {state} in your profile patch layer. Written to {path}",
			"toggle.doneRemoved": "{id} is already {state} without that line, so the entry was removed from your patch layer rather than left saying nothing. Written to {path}",
			"toggle.doneUnchanged": "{id} was already {state}; not a byte was written.",
			"toggle.stateOff": "disabled",
			"toggle.stateOn": "enabled",
			"toggle.fail": "Write failed: {message}",
			"toggle.restartHint": "The patch layer is hot-reloaded; if this did not take effect at once, use Restart now above.",
			"toggle.dismiss": "Got it",
			"inspector.row": "Point at the UI, name the plugin",
			"inspector.rowOn": "On · hold {keys} to highlight, click to jump to that plugin",
			"inspector.rowOff": "Once on, hold {keys} and point at anything to ask \"who put this here\"",
			"inspector.modifiers": "Trigger modifiers (hold to hover / click; combinable)",
			"inspector.reset": "Reset",
			"inspector.coverage": "UI registered before Insight loaded cannot be traced to a package (most built-ins are); those only report where they sit. Reloading the page does not change this.",
			"inspector.badgeHint": "Click to jump to this plugin · right-click for the whole chain",
			"inspector.foreignLegend": "Amber = contributed by non-official plugins; {count} on this screen",
			"inspector.menuTitle": "Here → root",
			"inspector.menuHint": "Pick any level to jump to the plugin that filled it",
			"inspector.unknown": "Package unknown",
			"inspector.unknownAs": "Package unknown (registered as {name})",
			"inspector.noFrames": "Not plugin-contributed, or its render info is unreadable",
			"inspector.onlyAnchor": "Only its position is known ({slot}); the package is not",
			"inspector.notInTree": "Not in the plugin tree",
			"inspector.jumped": "Jumped to {pkg}",
			"section.label": "Insight",
			"workbench.title": "Insight",
			"axis.plug": "By plugin",
			"axis.layer": "By config",
			"axis.svc": "By service",
			"axis.tool": "By tool",
			"axis.preset": "By preset",
			"tool.name": "Tool",
			"tool.disabledGroup": "Disabled ({count})",
			"tool.siblings": "Bundled",
			"tool.siblingsHead": "{count} tools from the same plugin",
			"tool.siblingsNote": "Disabling {plugin} takes all {count} of these tools with it.",
			"tool.from": "From",
			"tool.source": "Source",
			"tool.srcScan": "inferred",
			"tool.srcRuntimeNote": "Observed at runtime — captured when the tool actually registered.",
			"tool.srcScanNote": "Extracted from the plugin build output; inferred. If upstream changes bundling or moves the name into a variable, this entry silently disappears.",
			"tool.howToDisable": "To turn this tool off, disable the plugin that registers it — follow the plugin link above. Other tools from the same plugin go off with it.",
			"tool.head": "Tool plugin",
			"tool.pkg": "Package",
			"tool.state": "State",
			"tool.enabled": "available",
			"tool.disabled": "disabled",
			"tool.split": "differs",
			"tool.empty": "No tool-registering plugins.",
			"tool.entries": "{count} runtime copies",
			"tool.hostPlane": "top level",
			"tool.acts": "What config layers did to it",
			"tool.enabledNote": "Running — agents get the tools it registers.",
			"tool.disabledNote": "Every copy is turned off; agents get none of its tools.",
			"tool.splitNote": "The same plugin appears twice in the tree with different states — looking at either copy alone gives the wrong answer. As long as one runs, agents get its tools.",
			"tool.limitNote": "This row is a plugin that registers tools, not a single tool. The actual tool names (Bash, Read…) only exist once an agent runs and its preset is mounted as a scope; they cannot be read statically, and a tool definition carries no registrant, so they cannot be traced back to a plugin either. To turn its tools off, disable this plugin here.",
			"axis.model": "By model",
			"col.model": "Model",
			"model.from": "From",
			"model.siblings": "Bundled",
			"model.default": "default",
			"model.defaultNote": "This is what the agent is actually using right now.",
			"model.plugin": "Provided by",
			"model.configAt": "Configured at",
			"model.auth": "Auth",
			"auth.env": "API key from an environment variable",
			"auth.api-key": "stored API key",
			"auth.oauth": "OAuth grant",
			"auth.none": "no credential",
			"model.modalities": "Input",
			"model.siblingsHead": "{count} more models under {provider}",
			"model.siblingsNote": "These models come in through the {plugin} plugin. Disabling it takes all {count} models on this provider route with it; to just switch the default, change the agent-default-model setting.",
			"model.howToSwitch": "To switch the default model, change the agent-default-model setting.",
			"model.dormantGroup": "Configurable but unconfigured providers ({count})",
			"model.dormant": "not set up",
			"model.noModels": "no models",
			"model.wired": "wired",
			"model.unwired": "not wired",
			"model.dormantNote": "Upstream declares this provider route as configurable, but you have not set it up — add the credential and model list in settings and it will wire up and show its models here.",
			"model.noModelsNote": "This route has an adapter but reports no models — most likely the configured model list is empty.",
			"model.empty": "The llm service is absent, or no provider has an adapter wired.",
			"model.stale": "This host does not know the models endpoint yet — restart dsh and this axis will fill in.",
			"summary.presets": "presets",
			"summary.models": "models",
			"col.mark": "Mark",
			"plugins.holds": "holds {count}",
			"plugins.container": "Container",
			"plugins.settingsOnly": "settings namespace",
			"plugins.settingsOnlyNote": "This row is not a plugin — it is a settings section with no plugin to attach to. Either its namespace differs from the plugin's short id (the `shell` settings belong to the `shell-env` plugin), or the plugin that registered it is not in the host plugin tree at all (client-side plugins are like this). Upstream records no registrant for settings, so this panel does not guess. The settings themselves are real and still take effect.",
			"plugins.containerNote": "This is a plugin and a container at once: it also holds {count} child plugins — expand the row on the left to see them. Disable it and they all go with it.",
			"plugins.groupOnly": "A plain grouping container (built into cordis) that keeps related plugins together; it does nothing on its own.",
			"col.plugin": "Plugin",
			"col.config": "Config",
			"layers.file": "File",
			"layers.orderNote": "Applied top to bottom: a higher number is applied later and overrides everything above it.",
			"layers.lastWins": "applied last",
			"layers.firstApplied": "applied first",
			"layers.acts": "What this layer did",
			"filter.all": "All",
			"filter.attention": "Need attention",
			"filter.overridden": "You changed",
			"filter.disabled": "Disabled",
			"filter.runtime": "Runtime-registered",
			"filter.foreign": "Not official",
			"filter.userdisabled": "You disabled",
			"filter.bundledisabled": "Plugin disabled",
			"filter.runtimedisabled": "Off at runtime",
			"vendor.third-party": "third-party",
			"vendor.local": "local",
			"vendor.official": "official",
			"vendor.head": "Origin",
			"vendor.thirdPartyNote": "Not published under @deepseek-ai. It can do everything an official plugin can, so its source is worth a look.",
			"vendor.localNote": "Runs from this directory on your disk rather than the registry — edits take effect immediately and pnpm will not overwrite it.",
			"mark.overridden": "you changed",
			"mark.pendingRestart": "needs restart",
			"mark.pendingRestartHint": "The patch layer has changed; this process is still running the old configuration — use Restart now above to pick it up",
			"mark.runtime": "runtime",
			"mark.missingProvider": "no provider",
			"detail.hint": "Pick a plugin to see its dossier: origin layer, disk path, service wiring, how its config stacked up across layers, and the settings it registers.\nSwitch to “By layer” to see what a layer changed, or “By service” to see what actually connects plugins.",
			"detail.origin": "Origin",
			"detail.fullId": "Full id",
			"detail.path": "Path",
			"detail.twin": "Same short id",
			"detail.neighborhood": "Neighborhood",
			"detail.settings": "Settings",
			"detail.stack": "How the config stacked up",
			"detail.finalConfig": "Final config",
			"detail.waitingNote": "A service it injects has not appeared yet.",
			"detail.missingNote": "Nothing provides {services}.",
			"detail.mismatchCollision": "Short-id collision: this id appears {count} times at runtime — once on the host plane and once in a preset realm — so reconciliation cannot tell which one to compare. Not a config problem.",
			"detail.mismatchExpr": "disabled is a !!js expression; replay leaves it unevaluated by design, so the static side cannot decide. The difference comes from replay itself.",
			"detail.disabledNote": "Turned off explicitly by a config layer; not running.",
			"detail.manyConsumers": "{count} consumers — see neighborhood below",
			"nb.dependedBy": "depend on it",
			"nb.dependsOn": "it depends on",
			"nb.noneIn": "Nothing depends on it — turning it off affects no one",
			"nb.noneOut": "Depends on no plugin",
			"nb.middle": "middle layer",
			"nb.base": "foundation",
			"nb.leaf": "leaf consumer",
			"impact.title": "Disabling {name} would affect",
			"impact.hop": "hop {n} · {count}",
			"svc.service": "Service",
			"svc.provider": "Provider",
			"svc.consumers": "Consumers",
			"svc.consumersN": "Consumers {count}",
			"svc.sub": "service · {count} consumers",
			"svc.builtin": "built-in · no plugin provides it",
			"svc.builtinNote": "A cordis / host built-in — no plugin provides it by design.",
			"svc.noProvider": "no provider",
			"svc.unused": "unused",
			"svc.unusedNote": "No plugin depends on it.",
			"layers.order": "Layer {n}",
			"layers.bundleLayer": "bundle layer",
			"layers.profileLayer": "profile layer",
			"layers.lowest": "lowest priority",
			"layers.highest": "highest priority",
			"layers.highestNote": "It applies last, so it wins on any entry it touches.",
			"layers.onlyInserts": "This layer only inserts its own plugins; it changes nothing else.",
			"layers.notMerged": "not merged",
			"layers.notMergedNote": "not part of the patch merge order",
			"layers.readonly": "read-only",
			"layers.writable": "writable",
			"layers.empty": "No patch layers.",
			"layers.noContent": "(no file content)",
			"files.rootConfig": "profile root config",
			"files.settings": "user settings",
			"files.credentials": "credentials",
			"files.patch": "patch layer",
			"files.credentialsNote": "credentials · body never read",
			"files.notMergedWhy": "It is not in the patch load sequence, so it has no number and no insert / override / disable — it changes no entry. It is listed here because you need its path when debugging.",
			"files.empty": "No config files found.",
			"graph.provides": "Provides",
			"graph.requires": "Requires",
			"graph.noConsumer": "no consumer",
			"graph.noProvider": "no provider",
			"graph.isolated": "Provides and requires no service.",
			"action.refresh": "Refresh",
			"action.close": "Close",
			"search.placeholder": "Search plugins / packages / services…",
			"search.clear": "Clear search",
			"path.copy": "Copy path",
			"path.copied": "Copied",
			"path.openIde": "Open in editor",
			"preview.close": "Close",
			"preview.truncated": "Large file — showing the first 256 KB.",
			"status.loading": "Loading…",
			"status.error": "Failed to load: {message}",
			"status.noMatch": "No matches",
			"status.noMatchWhy": "Try another search term, or click All above to drop the filter.",
			"plugins.disabledGroup": "Disabled ({count})",
			"plugins.empty": "No plugins.",
			"plugins.rawState": "Unrecognized FiberState code: {code}",
			"event.insert": "insert",
			"event.update": "override",
			"event.disable": "disable",
			"event.enable": "enable",
			"dossier.mismatch": "state differs",
			"dossier.noIntent": "Not in any config layer — registered dynamically at runtime, so there is no attribution.",
			"state.active": "running",
			"state.disabled": "disabled",
			"off.user": "you disabled",
			"off.bundle": "plugin disabled",
			"off.runtime": "disabled at runtime",
			"off.userNote": "You turned it off in your own patch layer. Enable removes that entry again.",
			"off.bundleNote": "Turned off by some plugin's own patch layer, not by you — the stack below names which one. Enable writes a line in your layer that overrides it.",
			"off.runtimeNote": "No config layer turns it off explicitly; it went off at runtime — usually `disabled` is a `!!js` expression (platform-gated, say), or its container is off. Enable writes `disabled: false` in your layer to override the expression; a disabled container has to be opened first.",
			"state.pending": "pending",
			"state.loading": "loading",
			"state.failed": "failed",
			"state.disposed": "disposed",
			"state.unknown": "unknown",
			"settings.secrets": "Secrets: ",
			"settings.secretUnset": "(unset)",
			"settings.effective": "Effective",
			"settings.base": "Plugin default",
			"settings.user": "Your override",
			"read.window": "Showing {shown} of {total} lines",
			"read.copy": "Copy",
			"read.copied": "Copied",
			"read.collapse": "Collapse",
			"read.collapseAria": "Collapse the middle",
			"read.expand": "Expand {count} lines",
			"read.expandAria": "Expand {count} hidden lines",
			"json.copyValue": "Copy value",
			"json.copyJson": "Copy JSON",
			"json.copyPath": "Copy path",
			"json.copyPrettyJson": "Copy pretty JSON",
			"json.copyCompactJson": "Copy compact JSON",
			"json.copied": "Copied",
			"json.copyFailed": "Copy failed",
			"json.collapseNode": "Collapse",
			"json.expandNode": "Expand",
			"json.copyButtonTitle": "{action}"
		};
		//#endregion
		//#region src/shared/graph.ts
		function buildGraphIndex(nodes) {
			const dependsOn = /* @__PURE__ */ new Map();
			const dependedBy = /* @__PURE__ */ new Map();
			const serviceOf = /* @__PURE__ */ new Map();
			const ensure = (service) => {
				let entry = serviceOf.get(service);
				if (entry === void 0) {
					entry = {
						service,
						consumers: [],
						builtin: false
					};
					serviceOf.set(service, entry);
				}
				return entry;
			};
			for (const node of nodes) {
				dependsOn.set(node.id, /* @__PURE__ */ new Set());
				dependedBy.set(node.id, /* @__PURE__ */ new Set());
			}
			for (const node of nodes) for (const provided of node.provides) {
				const entry = ensure(provided.service);
				if (entry.provider === void 0 && entry.candidates === void 0) entry.provider = node.id;
				else {
					entry.candidates = [...entry.candidates ?? (entry.provider === void 0 ? [] : [entry.provider]), node.id];
					delete entry.provider;
				}
			}
			for (const node of nodes) for (const required of node.requires) {
				const entry = ensure(required.service);
				entry.consumers.push(node.id);
				if (required.builtin === true) entry.builtin = true;
				if (required.providers.length === 1) {
					const provider = required.providers[0];
					if (provider !== node.id) {
						dependsOn.get(node.id)?.add(provider);
						dependedBy.get(provider)?.add(node.id);
					}
				}
			}
			return {
				dependsOn,
				dependedBy,
				services: [...serviceOf.values()].sort((a, b) => b.consumers.length - a.consumers.length || a.service.localeCompare(b.service)),
				serviceOf,
				knowsBuiltin: nodes.some((n) => n.requires.some((r) => r.builtin !== void 0))
			};
		}
		/**
		* 影响面：禁用某个插件会波及谁，按跳数分组（反向可达的传递闭包）。
		* 这是全场唯一真需要图算法的问题，但输出是分组列表而不是图。
		*/
		function impactHops(index, id, maxHops = 8) {
			const hops = [];
			const seen = /* @__PURE__ */ new Set([id]);
			let front = /* @__PURE__ */ new Set([id]);
			while (front.size > 0 && hops.length < maxHops) {
				const next = /* @__PURE__ */ new Set();
				for (const from of front) for (const to of index.dependedBy.get(from) ?? []) {
					if (seen.has(to)) continue;
					seen.add(to);
					next.add(to);
				}
				if (next.size === 0) break;
				hops.push([...next]);
				front = next;
			}
			return hops;
		}
		/**
		* 该插件依赖的服务里，没有任何插件提供、且不是内置的——这是真问题。
		* @param knowsBuiltin - host 是否具备内置服务识别能力；不具备时一律返回空，
		*   因为此时「无人提供」既可能是真缺失也可能是内置服务，报出来必然一半是假的。
		*/
		function missingProviders(node, knowsBuiltin = true) {
			if (!knowsBuiltin) return [];
			return node.requires.filter((r) => r.providers.length === 0 && r.builtin !== true).map((r) => r.service);
		}
		//#endregion
		//#region src/shared/summary.ts
		/**
		* 摘要：设置页那 556px 要显示的全部内容。
		*
		* 存在的理由是"打开设置第一眼就该知道系统健不健康"——这恰好是旧面板完全没有的东西。
		* 它必须能独立于工作台计算，因为设置页不该为了显示六个数字去拉 174 个节点的全量树。
		*/
		function* walk(nodes) {
			for (const node of nodes) {
				yield node;
				yield* walk(node.children);
			}
		}
		/** 需要人处理的：加载失败、卡在等待、依赖的服务没有任何插件提供（内置不算）。 */
		function attentionOf(nodes, graph, knowsBuiltin) {
			const graphById = new Map(graph.map((g) => [g.id, g]));
			const ids = [];
			for (const node of nodes) {
				if (node.group) continue;
				if (node.state === "failed" || node.state === "pending" || node.state === "loading" || node.state === "unknown") {
					ids.push(node.shortId);
					continue;
				}
				const g = graphById.get(node.id);
				if (g !== void 0 && missingProviders(g, knowsBuiltin).length > 0) ids.push(node.shortId);
			}
			return [...new Set(ids)].sort();
		}
		function buildSummary(tree, graph, settings, layers, final) {
			const all = [...walk(tree)].filter((node) => !node.group);
			const index = buildGraphIndex(graph);
			const attention = attentionOf([...walk(tree)], graph, index.knowsBuiltin);
			const overrides = settings.filter((s) => s.user !== void 0).map((s) => s.ns).sort();
			const extra = new Set(final?.driftReport.extraInRuntime ?? []);
			const last = layers[layers.length - 1];
			return {
				plugins: all.length,
				active: all.filter((n) => n.state === "active").length,
				disabled: all.filter((n) => n.state === "disabled").length,
				attention: attention.length,
				attentionIds: attention.slice(0, 8),
				userOverrides: overrides.length,
				userOverrideIds: overrides.slice(0, 8),
				runtimeOnly: final === void 0 ? 0 : all.filter((n) => extra.has(n.shortId)).length,
				services: index.services.length,
				layers: layers.length,
				lastLayer: last?.label ?? "",
				lastLayerWritable: last !== void 0 && !last.readonly
			};
		}
		//#endregion
		//#region src/client/inspector/prefs.ts
		const MODIFIERS = [
			"meta",
			"alt",
			"ctrl",
			"shift"
		];
		/**
		* 默认关、默认 Option/Alt。
		*
		* 为什么默认关：它要在 window 上装捕获阶段的 click 拦截，开着就意味着「按住
		* Option 点任何东西都不会真的点下去」。这对不知道它存在的人是惊吓，所以必须
		* 是明确打开的东西。
		*/
		const DEFAULT_PREFS = {
			enabled: false,
			modifiers: ["alt"]
		};
		const STORAGE_KEY = "dsh-insight/inspector";
		/** 按下的修饰键是否**恰好**是配置的那一组。 */
		function matchesModifiers(event, modifiers) {
			if (modifiers.length === 0) return false;
			const pressed = {
				meta: event.metaKey,
				alt: event.altKey,
				ctrl: event.ctrlKey,
				shift: event.shiftKey
			};
			return MODIFIERS.every((id) => pressed[id] === modifiers.includes(id));
		}
		function sanitize(raw) {
			if (typeof raw !== "object" || raw === null) return DEFAULT_PREFS;
			const source = raw;
			const raws = Array.isArray(source.modifiers) ? source.modifiers : [];
			const modifiers = MODIFIERS.filter((id) => raws.includes(id));
			return {
				enabled: source.enabled === true,
				modifiers: modifiers.length > 0 ? [...modifiers] : [...DEFAULT_PREFS.modifiers]
			};
		}
		function loadPrefs() {
			try {
				const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
				if (raw === null || raw === void 0) return DEFAULT_PREFS;
				return sanitize(JSON.parse(raw));
			} catch {
				return DEFAULT_PREFS;
			}
		}
		function savePrefs(prefs) {
			try {
				globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(prefs));
			} catch {}
		}
		//#endregion
		//#region src/client/inspector/store.ts
		/**
		* Inspector 偏好的共享状态：一个模块级小 store。
		*
		* 为什么不用 React context：读它的两处不在同一棵组件树里——开关行在设置面板
		* 的 `settings.section` 里，浮层在 `shell.overlay` 里，各自是独立的 slot 出口。
		* 想套一个共同的 Provider 就得往 root 塞东西，那是壳的地盘。模块级 store +
		* useSyncExternalStore 是这里最小的解法。
		*
		* 跨浏览器标签也顺手同步：storage 事件一来就重读，免得两个标签的开关状态互相
		* 打脸（同一个 localStorage 键）。
		*/
		let current = loadPrefs();
		const listeners = /* @__PURE__ */ new Set();
		function emit() {
			for (const fn of listeners) fn();
		}
		function getPrefs() {
			return current;
		}
		function setPrefs(next) {
			current = next;
			savePrefs(next);
			emit();
		}
		function subscribe(fn) {
			listeners.add(fn);
			if (listeners.size === 1 && typeof window !== "undefined") window.addEventListener("storage", onStorage);
			return () => {
				listeners.delete(fn);
				if (listeners.size === 0 && typeof window !== "undefined") window.removeEventListener("storage", onStorage);
			};
		}
		function onStorage() {
			const next = loadPrefs();
			if (next.enabled !== current.enabled || next.modifiers.join() !== current.modifiers.join()) {
				current = next;
				emit();
			}
		}
		function useInspectorPrefs() {
			return (0, react.useSyncExternalStore)(subscribe, getPrefs, getPrefs);
		}
		//#endregion
		//#region src/client/components/InspectorRow.tsx
		/** 键帽上印的字：符号 + 键盘上的英文名，不翻译。 */
		const KEY_CAPS = {
			meta: "⌘ Command",
			alt: "⌥ Option / Alt",
			ctrl: "⌃ Control",
			shift: "⇧ Shift"
		};
		/** 提示文案里的短写法（「按住 ⌥」）。 */
		const KEY_GLYPHS = {
			meta: "⌘",
			alt: "⌥",
			ctrl: "⌃",
			shift: "⇧"
		};
		function InspectorRow({ t }) {
			const prefs = useInspectorPrefs();
			const keys = prefs.modifiers.map((id) => KEY_GLYPHS[id]).join(" ");
			const isDefault = prefs.modifiers.join() === DEFAULT_PREFS.modifiers.join();
			const toggleModifier = (id) => {
				const next = prefs.modifiers.includes(id) ? prefs.modifiers.filter((x) => x !== id) : MODIFIERS.filter((x) => x === id || prefs.modifiers.includes(x));
				setPrefs({
					...prefs,
					modifiers: next.length > 0 ? next : [...DEFAULT_PREFS.modifiers]
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-insight px-4 pb-4 text-primary",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl border border-line bg-surface",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 px-4 py-[13px]",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "text-[13.5px] font-medium",
								children: t("inspector.row")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[11.5px] leading-[1.5] text-secondary",
								children: prefs.enabled ? t("inspector.rowOn", { keys }) : t("inspector.rowOff", { keys })
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
							checked: prefs.enabled,
							onChange: (next) => setPrefs({
								...prefs,
								enabled: next
							}),
							label: t("inspector.row")
						})]
					}), prefs.enabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "border-t border-line px-4 py-3",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline gap-3",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 text-[11.5px] text-tertiary",
								children: t("inspector.modifiers")
							}), !isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPrefs({
									...prefs,
									modifiers: [...DEFAULT_PREFS.modifiers]
								}),
								className: "shrink-0 text-[11.5px] text-brand-bright hover:opacity-80",
								children: t("inspector.reset")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: MODIFIERS.map((id) => {
								const on = prefs.modifiers.includes(id);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": on,
									onClick: () => toggleModifier(id),
									className: `rounded-lg border px-2.5 py-1.5 text-[12px] transition-colors duration-150 ${on ? "border-brand bg-brand text-surface" : "border-line text-secondary hover:bg-hover"}`,
									children: KEY_CAPS[id]
								}, id);
							})
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 border-t border-line px-4 py-2.5 text-[11px] leading-[1.55] text-caption",
						children: t("inspector.coverage")
					})] })]
				})
			});
		}
		//#endregion
		//#region src/client/components/PanelStatus.tsx
		/** 统一的加载/空/错状态渲染（颜色字号一致，文案由调用方给词典化文本）。 */
		function PanelStatus({ kind, text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: `${kind === "error" ? "text-err" : "text-tertiary"} text-[13px]`,
				children: text
			});
		}
		//#endregion
		//#region src/client/components/icons.tsx
		/** 路径操作的内联 SVG 图标与按钮样式（FilePath / PreviewModal 共用）。 */
		function CopyIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
					x: "5",
					y: "5",
					width: "9",
					height: "9",
					rx: "1.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" })]
			});
		}
		function CheckIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2.5 8.5 6 12 13.5 4" })
			});
		}
		function IdeIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.5 2H14v4.5" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 2 8 8" })
				]
			});
		}
		/** 折叠指示 chevron（▸），配合 rotate-90 表示展开态。 */
		function ChevronIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 4l4 4-4 4" })
			});
		}
		/** 与设置对话框同款 ×（两条交叉路径，14×14）。 */
		function CloseIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "currentColor",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14.1168 13.197 13.197 14.1167 1.8833 2.80303 2.80309 1.88324 14.1168 13.197Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.197 1.88326 14.1168 2.80305 2.80309 14.1168 1.8833 13.197 13.197 1.88326Z" })]
			});
		}
		const ICON_BTN = "shrink-0 cursor-pointer rounded p-0.5 text-tertiary transition-colors duration-150 hover:text-brand-bright";
		/** 列头的「这一列怎么读」提示。笔画比正文更轻——它是随手可查的注解，不是内容。 */
		function HelpIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.2",
				strokeLinecap: "round",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "8",
						r: "6.2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6.35 6.5a1.7 1.7 0 1 1 1.65 2v.85" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M8 11.35v.05",
						strokeWidth: "1.6"
					})
				]
			});
		}
		/**
		* 重启用的环形箭头（⟳）：绕一圈再回到原点，正好是「同一个东西重新来一遍」。
		* 和 dsh-market 重启横幅上的那颗是同一个意思。
		*/
		function RestartIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.6 8a5.6 5.6 0 1 1-1.64-3.96" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.6 2.2v3.2h-3.2" })]
			});
		}
		//#endregion
		//#region src/shared/types.ts
		/** 包私有 RPC 通道名（host: connection.rpc.handle；client: connection.rpc.call）。 */
		const INSIGHT_CHANNEL = "/dsh-insight";
		//#endregion
		//#region src/client/rpc.ts
		function connectionOf(ctx) {
			const connection = ctx.get("connection");
			if (connection === void 0) throw new Error("dsh-insight: connection face 不可用");
			return connection;
		}
		/**
		* 端点报错时抛这个：把信封里的 code 一起带出来。
		*
		* 它同时也是一个「host 还活着」的证据——能解出信封，说明对面回了一个完整的
		* 应答。重启流程正是靠这一点分岔：拿到它就把失败原因摆出来，拿到别的（传输层
		* 直接断了）则相反，那多半是 host 已经在换进程了，该继续等新的那个起来。
		*/
		var InsightRpcError = class extends Error {
			code;
			constructor(message, code) {
				super(message);
				this.code = code;
				this.name = "InsightRpcError";
			}
		};
		/** 调端点并解信封；失败抛错交给面板的三态处理。 */
		async function callInsight(ctx, endpoint, payload = {}, signal) {
			const result = await connectionOf(ctx).rpc.call(INSIGHT_CHANNEL, endpoint, payload, signal);
			if (!result.ok) throw new InsightRpcError(result.error.message, result.error.code);
			return result.value;
		}
		//#endregion
		//#region src/client/components/useHostRestart.ts
		/**
		* 「立即重启」这颗按钮背后的全部状态：host 忙不忙、能不能重启、正在重启到哪一步。
		*
		* 四件事值得说清楚：
		*
		* 1. **为什么要轮询。** 忙不忙是随时会变的（对话跑起来、跑完），而这条 RPC 通道
		*    没有订阅面，只能自己隔几秒问一次。摘要卡本身是「打开设置看一眼」的东西，
		*    5 秒的粒度够用，代价也就是几个数字。
		*
		* 2. **为什么每次调用都带超时。** host 正在被自己杀掉的那几百毫秒里，请求会挂着
		*    不回。不设上限的话第一次挂住就再也轮不到下一次，界面会永远停在「正在重启」。
		*
		* 3. **为什么重启后是靠 boot 变了才刷新，而不是收到回执就刷新。** 回执只说明
		*    「接力进程已经派出去了」，新进程可能几秒后才真正起来。太早刷新只会撞上一个
		*    还没人监听的端口。所以拿重启前的 boot 当锚，问到不一样的那个值才刷新——
		*    那时候新进程一定已经在服务了，因为它刚回答了我们。
		*
		* 4. **为什么问不到状态时不把这一行藏起来。** 藏起来看着干净，但它恰好藏在了
		*    唯一需要它的时刻：host 进程比界面旧（改完没重启）时这个端点还不存在，
		*    而「手动重启一次 dsh」正是解法。藏掉按钮，用户只会以为功能没做出来。
		*    所以照常显示、按不动，并把最可能的原因直说。
		*/
		/** 面板挂着时问一次 host 忙不忙的间隔。 */
		const POLL_MS = 5e3;
		/** 单次 RPC 的耐心上限。 */
		const CALL_MS = 2500;
		/** 换进程期间问「起来没有」的间隔。 */
		const WAIT_MS = 1500;
		/** 等新进程起来的总耐心。 */
		const DEADLINE_MS = 6e4;
		/** 二次确认的有效期，过了自动退回「立即重启」。 */
		const CONFIRM_MS = 2e3;
		/**
		* @param ctx - 客户端 ctx，用来拿 connection 面。
		* @param t - 词典，用来把失败翻成人话。
		*/
		function useHostRestart(ctx, t) {
			const [status, setStatus] = (0, react.useState)(void 0);
			const [probed, setProbed] = (0, react.useState)(false);
			const [phase, setPhase] = (0, react.useState)("idle");
			const [error, setError] = (0, react.useState)(void 0);
			const tRef = (0, react.useRef)(t);
			tRef.current = t;
			(0, react.useEffect)(() => {
				if (phase === "working") return;
				let alive = true;
				let timer;
				const tick = () => {
					callInsight(ctx, "host/status", {}, AbortSignal.timeout(CALL_MS)).then((next) => {
						if (alive) setStatus(next);
					}).catch(() => {
						if (alive) setStatus(void 0);
					}).finally(() => {
						if (!alive) return;
						setProbed(true);
						timer = setTimeout(tick, POLL_MS);
					});
				};
				tick();
				return () => {
					alive = false;
					if (timer !== void 0) clearTimeout(timer);
				};
			}, [ctx, phase]);
			(0, react.useEffect)(() => {
				if (phase !== "confirm") return;
				const timer = setTimeout(() => setPhase("idle"), CONFIRM_MS);
				return () => clearTimeout(timer);
			}, [phase]);
			/** 派出重启，然后一直问到 boot 换了为止。 */
			const run = (0, react.useCallback)(() => {
				const previousBoot = status?.boot;
				if (previousBoot === void 0) return;
				setError(void 0);
				setPhase("working");
				const deadline = Date.now() + DEADLINE_MS;
				const waitForNewBoot = () => {
					if (Date.now() > deadline) {
						setPhase("idle");
						setError(tRef.current("restart.timeout"));
						return;
					}
					callInsight(ctx, "host/status", {}, AbortSignal.timeout(CALL_MS)).then((next) => {
						if (next.boot !== previousBoot) location.reload();
						else setTimeout(waitForNewBoot, WAIT_MS);
					}).catch(() => setTimeout(waitForNewBoot, WAIT_MS));
				};
				callInsight(ctx, "host/restart", {}, AbortSignal.timeout(CALL_MS)).then((ack) => {
					if (ack.ok) {
						waitForNewBoot();
						return;
					}
					setPhase("idle");
					setError(tRef.current("restart.fail", { message: ack.message }));
				}).catch((cause) => {
					if (cause instanceof InsightRpcError) {
						setPhase("idle");
						setError(tRef.current("restart.fail", { message: cause.message }));
						return;
					}
					waitForNewBoot();
				});
			}, [ctx, status?.boot]);
			const click = (0, react.useCallback)(() => {
				if (phase === "working") return;
				if (phase === "idle") {
					setError(void 0);
					setPhase("confirm");
					return;
				}
				run();
			}, [phase, run]);
			return {
				phase,
				...status === void 0 ? {} : { status },
				probed,
				...error === void 0 ? {} : { error },
				click
			};
		}
		//#endregion
		//#region src/client/components/RestartRow.tsx
		function RestartRow({ ctx, t }) {
			const { phase, status, probed, error, click } = useHostRestart(ctx, t);
			const off = status !== void 0 && !status.canRestart;
			const supervisor = status?.supervisor;
			const running = status?.running ?? 0;
			const busy = running > 0;
			const disabled = status === void 0 || off || busy || phase === "working";
			const label = phase === "working" ? t("restart.working") : phase === "confirm" ? t("restart.confirm") : t("restart.now");
			const hint = error !== void 0 ? error : phase === "working" ? t("restart.hintWorking") : status === void 0 ? probed ? t("restart.hintUnknown") : t("restart.hintProbing") : off ? supervisor === void 0 ? t("restart.hintOff") : t("restart.hintSupervised", { name: supervisor }) : busy ? t("restart.hintBusy", { count: running }) : phase === "confirm" ? t("restart.hintConfirm") : t("restart.hint");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 border-b border-line px-4 py-[13px]",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: click,
					disabled,
					className: `inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-[15px] py-[7px] text-[13px] font-medium transition-opacity duration-150 ${disabled ? "cursor-not-allowed border-line bg-surface-2 text-tertiary opacity-60" : phase === "confirm" ? "cursor-pointer border-err bg-surface-2 text-err hover:opacity-85" : "cursor-pointer border-line bg-surface-2 text-primary hover:opacity-85"}`,
					children: [label, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: `inline-flex ${phase === "working" ? "dsh-spin" : ""}`,
						children: phase === "confirm" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HelpIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RestartIcon, {})
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: `min-w-0 text-[11.5px] leading-[1.5] ${error === void 0 ? "text-secondary" : "text-err"}`,
					children: hint
				})]
			});
		}
		//#endregion
		//#region src/client/components/SummaryCard.tsx
		/** 一格：数字 + 标签 +（可选）右对齐的点名。 */
		function Cell({ value, label, example, tone }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-baseline gap-2.5 border-b border-line px-4 py-[11px] not-nth-2n:border-r",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `shrink-0 text-[17px] leading-[1.3] font-semibold tabular-nums ${tone === "warn" ? "text-warn" : tone === "info" ? "text-brand-bright" : "text-primary"}`,
						children: value
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-[12.5px] text-tertiary",
						children: label
					}),
					example !== void 0 && example !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ml-auto min-w-0 truncate font-mono text-[11.5px] text-tertiary",
						children: example
					})
				]
			});
		}
		function SummaryCard({ t, summary, stale = false, onOpen, action }) {
			const healthy = summary.attention === 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-insight flex flex-col gap-3 p-4 text-primary",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl border border-line bg-surface",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "border-b border-line px-4 pt-3.5 pb-[13px]",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: "m-0 text-[19px] leading-[1.35] font-semibold tracking-[-0.015em]",
								children: [healthy ? t("summary.healthy") : t("summary.needsAttention", { count: summary.attention }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "text-[14px] font-normal text-tertiary",
									children: [" · ", healthy ? t("summary.healthyNote", { count: summary.plugins }) : summary.attentionIds.join("、")]
								})]
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.active,
									label: t("summary.active")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.disabled,
									label: t("summary.disabled")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.attention,
									label: t("summary.attention"),
									...summary.attention > 0 ? { tone: "warn" } : {}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.userOverrides,
									label: t("summary.overrides"),
									example: summary.userOverrideIds[0],
									...summary.userOverrides > 0 ? { tone: "info" } : {}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.runtimeOnly,
									label: t("summary.runtimeOnly")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Cell, {
									value: summary.layers,
									label: t("summary.layers"),
									example: t("summary.lastLayer", { label: summary.lastLayer })
								})
							]
						}),
						stale && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 border-b border-line px-4 py-2 text-[11.5px] leading-[1.55] text-brand-bright",
							children: t("summary.staleHost")
						}),
						action,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 px-4 py-[13px]",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onOpen,
								className: "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-brand bg-brand px-[15px] py-[7px] text-[13px] font-medium text-surface transition-opacity duration-150 hover:opacity-85",
								children: [t("summary.open"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "↗"
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11.5px] leading-[1.5] text-secondary",
								children: t("summary.openHint")
							})]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/components/useRpc.ts
		/** tab 首次激活拉一次 + 手动刷新；无订阅无轮询。 */
		function useRpc(ctx, endpoint, active) {
			const [state, setState] = (0, react.useState)({ loading: false });
			const [generation, setGeneration] = (0, react.useState)(0);
			const reload = (0, react.useCallback)(() => setGeneration((g) => g + 1), []);
			(0, react.useEffect)(() => {
				if (!active) return;
				const controller = new AbortController();
				setState((s) => s.data === void 0 ? { loading: true } : {
					data: s.data,
					loading: true
				});
				callInsight(ctx, endpoint, {}, controller.signal).then((data) => {
					if (!controller.signal.aborted) setState({
						data,
						loading: false
					});
				}).catch((error) => {
					if (!controller.signal.aborted) setState({
						error: error instanceof Error ? error.message : String(error),
						loading: false
					});
				});
				return () => controller.abort();
			}, [
				ctx,
				endpoint,
				active,
				generation
			]);
			return {
				...state,
				reload
			};
		}
		//#endregion
		//#region src/client/components/useInsightSources.ts
		/**
		* 工作台的九个数据源，抽成一处。
		*
		* 为什么抽出来：工作台现在有两个入口——设置页的摘要卡，和 inspector 点界面
		* 之后直接开的那一份（它挂在 shell.overlay 里，够不着设置页那棵组件树）。
		* 两边都要同一套数据，各自抄一遍 useRpc 迟早写歪。
		*
		* `need` 为假时一个请求都不发（useRpc 自己就是这个语义），所以 inspector 的
		* 那份在没被点开之前是零开销。两个入口同时开着会各拉一份——都是只读端点，
		* 换成共享缓存要引一层跨组件状态，不值当。
		*/
		function useInsightSources(ctx, need) {
			const tree = useRpc(ctx, "plugins/tree", need);
			const graph = useRpc(ctx, "plugins/graph", need);
			const final = useRpc(ctx, "config/final", need);
			const settings = useRpc(ctx, "settings/list", need);
			const layers = useRpc(ctx, "config/layers", need);
			const files = useRpc(ctx, "files/list", need);
			const inventory = useRpc(ctx, "plugins/tools", need);
			const models = useRpc(ctx, "models/list", need);
			const presets = useRpc(ctx, "presets/list", need);
			const required = [
				tree,
				graph,
				final,
				settings,
				layers,
				files,
				inventory
			];
			const loading = required.some((r) => r.loading);
			const error = required.map((r) => r.error).find((e) => e !== void 0);
			const incomplete = required.some((r) => r.data === void 0);
			const reload = (0, react.useMemo)(() => () => {
				models.reload();
				presets.reload();
				for (const r of required) r.reload();
			}, [
				tree.reload,
				graph.reload,
				final.reload,
				settings.reload,
				layers.reload,
				files.reload,
				inventory.reload,
				models.reload,
				presets.reload
			]);
			return {
				tree: tree.data,
				graph: graph.data,
				final: final.data,
				settings: settings.data,
				layers: layers.data,
				files: files.data,
				inventory: inventory.data,
				models: models.data,
				modelsStale: !models.loading && models.error !== void 0,
				presets: presets.data,
				presetsStale: !presets.loading && presets.error !== void 0,
				loading,
				error,
				incomplete,
				reload
			};
		}
		//#endregion
		//#region src/shared/dossier.ts
		/** 统计短 id 出现次数：短 id 在运行时/重放里都可能跨 realm 撞名，唯一时才允许按短 id 归并。 */
		function shortIdCounts(ids) {
			const counts = /* @__PURE__ */ new Map();
			for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
			return counts;
		}
		function* walkTree(nodes) {
			for (const n of nodes) {
				yield n;
				yield* walkTree(n.children);
			}
		}
		/**
		* 三源 join。意图挂载规则与 originResolver 同样谨慎：
		* 短 id 在运行时与重放两侧都唯一时才把 config/事件流挂到该节点，撞名则放弃（不伪造归因）。
		*/
		function buildDossiers(tree, graph, final, settings = []) {
			const graphById = new Map(graph.map((g) => [g.id, g]));
			const runtimeCounts = shortIdCounts([...walkTree(tree)].map((n) => n.shortId));
			const finalCounts = shortIdCounts(final.entries.map((e) => e.id));
			const finalByShort = new Map(final.entries.map((e) => [e.id, e]));
			const extra = new Set(final.driftReport.extraInRuntime);
			const mismatch = new Set(final.driftReport.disabledMismatch);
			const convert = (node) => {
				const g = graphById.get(node.id);
				const dossier = {
					id: node.id,
					shortId: node.shortId,
					name: node.name,
					group: node.group,
					disabled: node.disabled,
					state: node.state,
					provides: g?.provides ?? [],
					requires: g?.requires ?? [],
					children: node.children.map(convert)
				};
				if (node.rawState !== void 0) dossier.rawState = node.rawState;
				if (node.error !== void 0) dossier.error = node.error;
				if (node.origin !== void 0) dossier.origin = node.origin;
				if (node.path !== void 0) dossier.path = node.path;
				if (extra.has(node.shortId)) dossier.drift = "extra";
				else {
					const entry = finalByShort.get(node.shortId);
					if (entry !== void 0 && runtimeCounts.get(node.shortId) === 1 && finalCounts.get(node.shortId) === 1) {
						dossier.intent = {
							disabled: entry.disabled,
							config: entry.config
						};
						if (entry.events !== void 0 && entry.events.length > 0) dossier.intent.events = entry.events;
					}
					if (mismatch.has(node.shortId)) dossier.drift = "mismatch";
				}
				return dossier;
			};
			const dossiers = tree.map(convert);
			for (const shortId of final.driftReport.missingInRuntime) {
				const entry = finalByShort.get(shortId);
				if (entry === void 0) continue;
				const ghost = {
					id: shortId,
					shortId,
					name: entry.name,
					group: false,
					disabled: entry.disabled,
					provides: [],
					requires: [],
					intent: {
						disabled: entry.disabled,
						config: entry.config
					},
					drift: "missing",
					children: []
				};
				if (entry.events !== void 0 && entry.events.length > 0) ghost.intent.events = entry.events;
				dossiers.push(ghost);
			}
			const all = [...walkDossiers(dossiers)];
			const dossierCounts = shortIdCounts(all.map((d) => d.shortId));
			const nsCounts = shortIdCounts(settings.map((s) => s.ns));
			const byShort = new Map(all.map((d) => [d.shortId, d]));
			for (const s of settings) {
				const target = byShort.get(s.ns);
				if (target !== void 0 && dossierCounts.get(s.ns) === 1 && nsCounts.get(s.ns) === 1) target.settings = s;
				else dossiers.push({
					id: `settings:${s.ns}`,
					shortId: s.ns,
					name: "",
					group: false,
					disabled: false,
					provides: [],
					requires: [],
					settings: s,
					settingsOnly: true,
					children: []
				});
			}
			return dossiers;
		}
		/** 拍平 dossier 树（搜索/跳转用）。 */
		function* walkDossiers(nodes) {
			for (const n of nodes) {
				yield n;
				yield* walkDossiers(n.children);
			}
		}
		//#endregion
		//#region src/shared/tools.ts
		/**
		* 工具插件：把注册工具的插件 entry 归并成「一行一个工具插件」。
		*
		* 为什么是「工具插件」而不是「工具」——这个区别很重要，别在 UI 上含糊：
		* 用户真正想看的是工具名（LLM 看到的 `Bash`、`Read`），一个插件可能注册好几个。
		* 但那份数据在静止状态下**不存在**：实测 `tools.schemas()` 返回 0、
		* `layers.global.tools.data` 是 Map(0)、`layers.scoped` 也是 Map(0)。
		* 工具是 agent 跑起来、预设被 mount 成一个 scope 之后才 register 进去的，
		* 而且 ToolDefinition 不带 owner 字段——即便读到了工具名也反查不回注册它的插件。
		* 所以这里只做插件粒度，并在界面上明说这一层的边界，不假装是工具清单。
		*
		* 归并的价值在于消歧：同一个工具插件在运行时常有两份——宿主面一份（多半被
		* bundle 层禁用）、agent 预设 realm 里一份（活着）。按插件看是困惑的
		* （同名两行，一禁一开），按工具插件看才知道净结果到底能不能用。
		*/
		/** dsh 的硬约定：注册工具的插件 entry 一律以 tool- 开头。 */
		const TOOL_ID = /^tool-/;
		/** 完整 id 里去掉自己和最外层 include 之后的容器名，用来区分宿主面与预设 realm。 */
		function realmOf(fullId, shortId) {
			const parts = fullId.split(":").filter((p) => p !== "" && p !== shortId);
			const inner = parts[parts.length - 1];
			return inner === void 0 || inner === "include" ? "" : inner;
		}
		function buildToolPlugins(dossiers) {
			const byShort = /* @__PURE__ */ new Map();
			for (const d of walkDossiers(dossiers)) {
				if (d.group || !TOOL_ID.test(d.shortId)) continue;
				let tool = byShort.get(d.shortId);
				if (tool === void 0) {
					tool = {
						id: d.shortId,
						name: "",
						entries: [],
						enabled: false,
						split: false
					};
					byShort.set(d.shortId, tool);
				}
				if (tool.name === "" && d.name !== "") tool.name = d.name;
				if (tool.path === void 0 && d.path !== void 0) tool.path = d.path;
				const entry = {
					id: d.id,
					realm: realmOf(d.id, d.shortId),
					state: d.state,
					disabled: d.disabled
				};
				if (d.origin !== void 0) entry.origin = d.origin;
				tool.entries.push(entry);
			}
			const tools = [...byShort.values()];
			for (const tool of tools) {
				tool.entries.sort((a, b) => a.realm.localeCompare(b.realm));
				tool.enabled = tool.entries.some((e) => e.state === "active");
				tool.split = new Set(tool.entries.map((e) => e.state === "active")).size > 1;
			}
			return tools.sort((a, b) => Number(b.enabled) - Number(a.enabled) || a.id.localeCompare(b.id));
		}
		function countTools(tools) {
			return {
				total: tools.length,
				enabled: tools.filter((t) => t.enabled).length,
				disabled: tools.filter((t) => !t.enabled).length,
				split: tools.filter((t) => t.split).length
			};
		}
		//#endregion
		//#region src/shared/vendor.ts
		/** 官方 scope：dsh 与 cordis 全都发在这个 scope 下。 */
		const OFFICIAL_SCOPE = "@deepseek-ai/";
		/** loader 用 `cordis:` 前缀表示框架自带的虚拟插件，不对应任何 npm 包。 */
		const VIRTUAL = "cordis:";
		const IN_NODE_MODULES = /[\\/]node_modules[\\/]/;
		function vendorOf(pkg) {
			if (pkg.name === "" || pkg.name.startsWith(VIRTUAL)) return void 0;
			if (pkg.path !== void 0 && pkg.path !== "" && !IN_NODE_MODULES.test(pkg.path)) return "local";
			return pkg.name.startsWith(OFFICIAL_SCOPE) ? "official" : "third-party";
		}
		/** 值得标出来的出处。官方是常态，常态不该有任何表达。 */
		function isForeign(v) {
			return v === "third-party" || v === "local";
		}
		function buildVendorIndex(nodes) {
			const byId = /* @__PURE__ */ new Map();
			const byShort = /* @__PURE__ */ new Map();
			const byPackage = /* @__PURE__ */ new Map();
			const walk = (list) => {
				for (const n of list) {
					const v = vendorOf(n);
					if (v !== void 0) {
						byId.set(n.id, v);
						if (!byShort.has(n.shortId)) byShort.set(n.shortId, v);
						if (!byPackage.has(n.name)) byPackage.set(n.name, v);
					}
					walk(n.children);
				}
			};
			walk(nodes);
			return {
				ofPlugin: (id) => byId.get(id),
				ofShort: (shortId) => byShort.get(shortId),
				ofPackage: (name) => byPackage.get(name)
			};
		}
		//#endregion
		//#region src/client/components/surface.ts
		/**
		* 工作台与它开出来的子对话框（文件预览）共用的画布尺寸与开合行为。
		*
		* 抽成常量是因为这两处必须一致：预览是从工作台里点开的，尺寸不同会让人觉得
		* 「跳到了另一个地方」。历史上预览窗是 800×800（当年跟着宿主设置框定的），
		* 工作台独立成全屏模态之后就对不上了。
		*/
		const SURFACE_SIZE = {
			width: "min(1600px, 92vw)",
			height: "min(1100px, 88vh)"
		};
		/**
		* 开合动画跑完之后把 transform 卸掉，返回「是否已经落定」。
		*
		* `scale-100` 视觉上等于没有，但**带 transform / scale 的祖先会成为
		* `position: fixed` 的定位基准**（`filter`、`backdrop-filter` 同理）。房子的
		* Tooltip 是 fixed + 视口坐标定位的，于是对话框里每一个 tooltip 都被整体平移了
		* 对话框左上角那么多，飘到别的行上去。
		*
		* 注意 Tailwind 4 的 `scale-*` 编译成**独立的 `scale` 属性**而不是 `transform`，
		* 所以 `transform: none` 压不住它——只能把 class 本身摘掉。
		* 动画结束才摘，开合效果不受影响；定位基准随即回落到 overlay——它是
		* `fixed inset-0`，和视口重合，坐标就对上了。
		*/
		function useSettled(shown) {
			const [settled, setSettled] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (!shown) {
					setSettled(false);
					return;
				}
				const id = setTimeout(() => setSettled(true), 220);
				return () => clearTimeout(id);
			}, [shown]);
			return settled;
		}
		/** 开合动画的 class。落定后不带任何缩放，避免劫持 tooltip 的定位基准。 */
		function surfaceMotion(shown, settled) {
			if (!shown) return "scale-95 opacity-0";
			return settled ? "opacity-100" : "scale-100 opacity-100";
		}
		//#endregion
		//#region src/client/components/search.ts
		/** 搜索词归一化 + 列表过滤：所有 tab 的搜索入口，trim/大小写行为只有这一份。 */
		function normQuery(query) {
			return query.trim().toLowerCase();
		}
		//#endregion
		//#region src/client/components/Highlight.tsx
		function Highlight({ text, query = "" }) {
			const q = query.trim().toLowerCase();
			if (q === "") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: text });
			const lower = text.toLowerCase();
			const parts = [];
			let i = 0;
			let k = 0;
			for (;;) {
				const j = lower.indexOf(q, i);
				if (j < 0) {
					parts.push(text.slice(i));
					break;
				}
				if (j > i) parts.push(text.slice(i, j));
				parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
					className: "bg-transparent font-medium text-brand-bright",
					children: text.slice(j, j + q.length)
				}, k++));
				i = j + q.length;
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: parts });
		}
		//#endregion
		//#region src/client/components/primitiveLabels.ts
		/**
		* ReadBlock 的界面字串。
		* @param t - 本命名空间的 typed 翻译函数。
		*/
		function readBlockLabels(t) {
			return {
				window: (shown, total) => t("read.window", {
					shown,
					total
				}),
				copy: t("read.copy"),
				copied: t("read.copied"),
				collapse: t("read.collapse"),
				collapseAria: t("read.collapseAria"),
				expand: (hidden) => t("read.expand", { count: hidden }),
				expandAria: (hidden) => t("read.expandAria", { count: hidden })
			};
		}
		/**
		* JsonTree 的界面字串。
		* @param t - 本命名空间的 typed 翻译函数。
		*/
		function jsonTreeLabels(t) {
			return {
				copyValue: t("json.copyValue"),
				copyJson: t("json.copyJson"),
				copyPath: t("json.copyPath"),
				copyPrettyJson: t("json.copyPrettyJson"),
				copyCompactJson: t("json.copyCompactJson"),
				copied: t("json.copied"),
				copyFailed: t("json.copyFailed"),
				collapseNode: t("json.collapseNode"),
				expandNode: t("json.expandNode"),
				copyButtonTitle: (action) => t("json.copyButtonTitle", { action })
			};
		}
		//#endregion
		//#region src/client/components/PreviewModal.tsx
		/** 文件预览对话框：自写而非房子 Modal——需要打开/关闭过渡动画。
		* 宽高/圆角/关闭按钮全部 follow 设置对话框（800×800、24px 圆角、28px 圆形 ×）。
		* mask 点击 / Esc / × 关闭；200ms ease-out 过渡；Esc 用捕获阶段拦截不透传设置框。
		* 注意：portal 到 body，脱离 .dsh-insight 作用域，故根节点自己带上该类吃按钮 reset 与 token。 */
		function PreviewModal({ open, onClose, title, path, closeLabel, ctx, t, children }) {
			const [mounted, setMounted] = (0, react.useState)(open);
			const [shown, setShown] = (0, react.useState)(false);
			const settled = useSettled(shown);
			const [copied, setCopied] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (open) {
					setMounted(true);
					const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
					return () => cancelAnimationFrame(id);
				}
				setShown(false);
				const id = setTimeout(() => setMounted(false), 200);
				return () => clearTimeout(id);
			}, [open]);
			(0, react.useEffect)(() => {
				if (!mounted) return void 0;
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					e.stopImmediatePropagation();
					onClose();
				};
				document.addEventListener("keydown", onKey, true);
				return () => document.removeEventListener("keydown", onKey, true);
			}, [mounted, onClose]);
			const copy = () => {
				navigator.clipboard.writeText(path).then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 1200);
				}).catch(() => {});
			};
			const openIde = () => {
				callInsight(ctx, "files/open", { path }).catch(() => {});
			};
			if (!mounted) return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				role: "presentation",
				onClick: onClose,
				className: `dsh-insight fixed inset-0 z-[1010] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${shown ? "opacity-100" : "opacity-0"}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-label": title,
					onClick: (e) => e.stopPropagation(),
					style: SURFACE_SIZE,
					className: `flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all duration-200 ease-out ${surfaceMotion(shown, settled)}`,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-start gap-3 border-b border-line px-5 py-4",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "text-[15px] font-medium text-primary",
								children: title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 break-all font-mono text-[12px] leading-5 text-tertiary",
								children: [
									path,
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: copied ? t("path.copied") : t("path.copy"),
										side: "top",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											"aria-label": t("path.copy"),
											onClick: copy,
											className: `${ICON_BTN} ml-1 inline-flex align-middle`,
											children: copied ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyIcon, {})
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
										label: t("path.openIde"),
										side: "top",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											"aria-label": t("path.openIde"),
											onClick: openIde,
											className: `${ICON_BTN} inline-flex align-middle`,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IdeIcon, {})
										})
									})
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							"aria-label": closeLabel,
							onClick: onClose,
							className: "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-tertiary transition-colors duration-150 hover:bg-hover hover:text-primary",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "min-h-0 flex-1 overflow-auto p-5",
						children
					})]
				})
			}), document.body);
		}
		//#endregion
		//#region src/client/components/FilePath.tsx
		/** 文件路径：换行显示完整路径 + 复制 / IDE 打开两个图标按钮；点击文本弹预览对话框（credentials 除外）。
		*
		* 不截断也不挂 tooltip：它只出现在工作台右侧详情栏里，那里有整整一栏的宽度可以换行。
		* 之前的「头截断 + hover 出全量 tooltip」是给窄单行设计的，搬进详情栏会出两个毛病——
		* tooltip 被 overflow-y-auto 的滚动容器裁掉（长路径反而看不全），且气泡飘到下方无关内容上。
		* 路径直接换行就没这些问题，还能选中、能读全。 */
		function FilePath({ ctx, t, path, highlight, isDir = false, previewable = !isDir, openable = true }) {
			const [modalOpen, setModalOpen] = (0, react.useState)(false);
			const [state, setState] = (0, react.useState)({ kind: "loading" });
			const [copied, setCopied] = (0, react.useState)(false);
			const [actionError, setActionError] = (0, react.useState)();
			const fileName = path.split("/").pop() ?? path;
			const lang = /\.ya?ml$/.test(path) ? "yaml" : void 0;
			const openPreview = () => {
				setModalOpen(true);
				setState({ kind: "loading" });
				callInsight(ctx, "files/read", { path }).then((preview) => setState({
					kind: "ok",
					preview
				})).catch((error) => setState({
					kind: "error",
					message: error.message
				}));
			};
			const copy = () => {
				setActionError(void 0);
				navigator.clipboard.writeText(path).then(() => {
					setCopied(true);
					setTimeout(() => setCopied(false), 1200);
				}).catch((error) => setActionError(error instanceof Error ? error.message : String(error)));
			};
			const openIde = () => {
				setActionError(void 0);
				callInsight(ctx, "files/open", { path }).catch((error) => setActionError(error instanceof Error ? error.message : String(error)));
			};
			const pathText = /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "block rounded font-mono text-[12px] leading-[1.55] break-all text-tertiary transition-colors duration-150 group-hover/path:text-brand-bright",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Highlight, {
					text: path,
					query: highlight
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "flex w-full min-w-0 items-start gap-0.5",
				children: [
					!previewable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1",
						children: pathText
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						onClick: openPreview,
						className: "group/path min-w-0 flex-1 cursor-pointer rounded text-left",
						children: pathText
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "ml-1.5 flex shrink-0 items-center gap-0.5",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: copied ? t("path.copied") : t("path.copy"),
							side: "top",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-label": t("path.copy"),
								onClick: copy,
								className: ICON_BTN,
								children: copied ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyIcon, {})
							})
						}), openable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("path.openIde"),
							side: "top",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-label": t("path.openIde"),
								onClick: openIde,
								className: "shrink-0 cursor-pointer rounded p-0.5 text-tertiary transition-colors duration-150 hover:text-brand-bright",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IdeIcon, {})
							})
						})]
					}),
					actionError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						role: "alert",
						className: "min-w-0 truncate text-[11px] text-err",
						children: actionError
					}),
					previewable && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(PreviewModal, {
						open: modalOpen,
						onClose: () => setModalOpen(false),
						title: fileName,
						path,
						closeLabel: t("preview.close"),
						ctx,
						t,
						children: [
							state.kind === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
								kind: "loading",
								text: t("status.loading")
							}),
							state.kind === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
								kind: "error",
								text: t("status.error", { message: state.message })
							}),
							state.kind === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [state.preview.truncated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
									kind: "empty",
									text: t("preview.truncated")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-soft-wrap",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReadBlock, {
										label: fileName,
										labels: readBlockLabels(t),
										lines: state.preview.content.split("\n").map((text, i) => ({
											number: i + 1,
											text
										})),
										totalLines: state.preview.content.split("\n").length,
										...lang !== void 0 ? { lang } : {},
										maxLines: Number.MAX_SAFE_INTEGER
									})
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/components/kindTone.ts
		const KIND_TONE = {
			insert: "dim",
			update: "info",
			disable: "err",
			enable: "dim"
		};
		/** 展示顺序：有意思的排前面，插入垫底。 */
		const KIND_ORDER = [
			"update",
			"disable",
			"enable",
			"insert"
		];
		/** 分组左边条颜色（Tailwind 扫描只认字面类名，不能 border-${tone} 动态拼）。 */
		const KIND_BAR = {
			insert: "border-line-2",
			update: "border-brand-bright",
			disable: "border-err",
			enable: "border-line-2"
		};
		//#endregion
		//#region src/client/components/Tag.tsx
		/** 纯文本场景（如层行上的动作计数）共用同一套 tone 色，不套 tag 盒。 */
		const TONE_TEXT = {
			dim: "text-tertiary",
			info: "text-brand-bright",
			warn: "text-warn",
			err: "text-err"
		};
		//#endregion
		//#region src/client/components/EmptyState.tsx
		function EmptyState({ title, detail, action }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex min-h-[240px] flex-col items-center justify-center gap-2 px-8 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						className: "mb-1 h-px w-8 bg-line-2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[13.5px] font-medium text-secondary",
						children: title
					}),
					detail !== void 0 && detail !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 max-w-[440px] text-[12.5px] leading-[1.65] text-tertiary",
						children: detail
					}),
					action !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mt-1.5",
						children: action
					})
				]
			});
		}
		//#endregion
		//#region src/client/components/useOverflowing.ts
		/** 元素是否横向溢出（scrollWidth > clientWidth），ResizeObserver 跟踪。
		* 用法：TruncText/FilePath 的 tooltip 只在文本真被截断时出现——短文本 hover 不出气泡。 */
		function useOverflowing(watch) {
			const ref = (0, react.useRef)(null);
			const [overflowing, setOverflowing] = (0, react.useState)(false);
			(0, react.useLayoutEffect)(() => {
				const el = ref.current;
				if (!el) return;
				const check = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
				check();
				const ro = new ResizeObserver(check);
				ro.observe(el);
				return () => ro.disconnect();
			}, [watch]);
			return {
				ref,
				overflowing
			};
		}
		//#endregion
		//#region src/client/components/TruncText.tsx
		/** 截断文本：单行 ellipsis + 搜索高亮；Tooltip 全量只在真溢出时出现（useOverflowing）。
		* 标题行的 id/包名/hash 统一用它——Tooltip 无 wrapper（clone 子元素），截断不被破坏。 */
		function TruncText({ text, query, mono = false, dim = false }) {
			const { ref, overflowing } = useOverflowing(text);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: text,
				side: "bottom",
				maxWidth: 720,
				disabled: !overflowing,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					ref,
					className: `min-w-0 shrink truncate ${mono ? "font-mono" : ""} ${dim ? "text-[12px] text-tertiary" : "text-[13px] text-primary"}`,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Highlight, {
						text,
						query
					})
				})
			});
		}
		//#endregion
		//#region src/client/components/WorkbenchTable.tsx
		/**
		* 工作台左栏的表格骨架：四根轴（按插件 / 按层 / 按服务 / 按工具）共用同一套
		* 行高、网格、选中态、分隔线、右列对齐。
		*
		* 为什么要抽成组件而不是各写各的：一个对话框里出现三种行高、两种布局范式、
		* 一半有表头一半没有，看起来就像四个页面拼起来的。靠复制 class 串维持一致
		* 只能撑到下一次改动——固化成组件之后，「长什么样」不再是每个轴各自的自觉。
		*
		* 分工：**这里只管长什么样，不管放什么。** 列数、列宽、列名、每格内容都由
		* 各轴自己定——它们要回答的问题不同，内容本来就该不一样。
		*/
		const ColsContext = (0, react.createContext)("");
		function template(columns) {
			return columns.map((c) => c.width).join(" ");
		}
		/**
		* 滚过最后一行：内容真的溢出时，在末尾垫半屏空白，让最后一行能滚到可视区中间。
		* 折叠展开后目标行不至于卡在屏幕最底下够不着，又不至于像「一直滚到只剩一行」
		* 那样底下拖着一大片空白。
		*
		* 「可视区」要扣掉粘顶表头：表头浮在滚动内容之上，按容器高度算会多垫出一个表头
		* 的量，末行反而被表头压住。
		*
		* 用实测而不是 `height: calc(100% - 34px)`：百分比会解析到 Table 自己那个
		* auto 高度的容器上，算出来是 0。另外内容没溢出时不留白，否则七行的列表也能滚，
		* 白白多出一段空白。
		*/
		function useScrollPastEnd(bodyRef, headRef) {
			const [pad, setPad] = (0, react.useState)(0);
			(0, react.useLayoutEffect)(() => {
				const body = bodyRef.current;
				const scroller = body?.parentElement?.parentElement ?? null;
				if (body === null || scroller === null) return void 0;
				const update = () => {
					const head = headRef.current?.getBoundingClientRect().height ?? 0;
					const view = scroller.clientHeight - head;
					const overflows = body.getBoundingClientRect().height > view;
					setPad(overflows ? Math.max(34, Math.round(view / 2)) : 0);
				};
				update();
				const ro = new ResizeObserver(update);
				ro.observe(scroller);
				ro.observe(body);
				return () => ro.disconnect();
			});
			return pad;
		}
		/** 表格容器：渲染粘顶表头，并把网格模板传给行。 */
		function Table({ columns, children }) {
			const cols = template(columns);
			const bodyRef = (0, react.useRef)(null);
			const headRef = (0, react.useRef)(null);
			const pad = useScrollPastEnd(bodyRef, headRef);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ColsContext.Provider, {
				value: cols,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						ref: headRef,
						className: "sticky top-0 z-[1] border-b border-line bg-surface px-[18px] py-[7px] font-mono text-[11px] tracking-[0.1em] text-tertiary uppercase",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "grid w-full gap-3",
							style: { gridTemplateColumns: cols },
							children: columns.map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: `flex items-center gap-1 ${c.align === "right" ? "justify-end" : ""}`,
								children: [c.label, c.hint !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: c.hint,
									side: "bottom",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										tabIndex: 0,
										"aria-label": c.hint,
										className: "inline-flex cursor-help items-center text-tertiary transition-colors duration-150 hover:text-secondary",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HelpIcon, {})
									})
								})]
							}, c.label))
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						ref: bodyRef,
						children
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						"aria-hidden": "true",
						style: { height: pad }
					})
				] })
			});
		}
		/** 一行：高度、分隔线、选中态左边条全在这里定死。 */
		function Row({ selected = false, onClick, indent, children }) {
			const cols = (0, react.useContext)(ColsContext);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				"data-selected": selected,
				onClick,
				className: `grid w-full cursor-pointer items-center gap-3 border-l-2 pr-[18px] text-left transition-colors duration-150 ${selected ? "border-brand-bright bg-hover" : "border-transparent hover:bg-hover"}`,
				style: {
					gridTemplateColumns: cols,
					paddingLeft: indent ?? 18,
					height: 34
				},
				children
			});
		}
		/** 折叠组行（已禁用 N 条 / 插件容器）：与数据行同高、同缩进、同左边条槽位，但不参与选中。 */
		function GroupRow({ open, onToggle, indent, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-expanded": open,
				onClick: onToggle,
				className: "flex w-full cursor-pointer items-center gap-[9px] border-l-2 border-transparent pr-[18px] text-left text-[12.5px] text-tertiary transition-colors duration-150 hover:bg-hover",
				style: {
					paddingLeft: indent ?? 18,
					height: 34
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronBox, { open }), children]
			});
		}
		/**
		* 箭头槽位：20px 见方、左移 4px。数据行的树形前缀（箭头或占位）和折叠组行都用它，
		* 两种行的文字才会落在同一条竖线上——差 7px 肉眼是看得出来的。
		*/
		function ChevronBox({ open, onClick }) {
			const box = "-ml-1 inline-flex size-5 shrink-0 items-center justify-center rounded";
			if (onClick === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: box,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Chevron, { open })
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				role: "button",
				tabIndex: -1,
				"aria-expanded": open,
				onClick,
				className: `${box} cursor-pointer text-tertiary hover:bg-hover hover:text-primary`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Chevron, { open })
			});
		}
		/** 占位：没有子节点的行也要占掉同样的槽位，否则标题会左移一格。 */
		function ChevronSlot() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "-ml-1 inline-block size-5 shrink-0" });
		}
		/** 折叠箭头。translate-y-px 是光学补偿：盒中心已经对齐，但正文有降部（g/p）
		* 把墨迹重心压低，几何居中的箭头看起来偏高，下沉 1px 才是视觉齐平。 */
		function Chevron({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `inline-flex shrink-0 translate-y-px items-center transition-transform duration-150 ${open ? "rotate-90" : ""}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, {})
			});
		}
		/**
		* 主标识格：等宽、截断，首列固定留出一条 25px 的槽位。
		*
		* 槽位里放什么由各轴自己定——按配置放序号，按插件/按工具/按模型放折叠箭头或占位，
		* 按服务空着。但**宽度是固定的**：五张表切来切去，第一列的文字必须落在同一条竖线上，
		* 否则每切一次轴整列都在跳。
		*/
		function NameCell({ children, dim = false, bold = false, prefix }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: `flex min-w-0 items-center gap-[9px] font-mono text-[12.5px] ${bold ? "font-semibold" : ""} ${dim ? "text-tertiary" : "text-primary"}`,
				children: [prefix ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronSlot, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children
				})]
			});
		}
		/** 次标识格：更小、更淡、截断。 */
		function SubCell({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "truncate font-mono text-[11.5px] text-tertiary",
				children
			});
		}
		/**
		* 标记格：0..2 个标记并排。
		* 一行上可能同时成立好几件事（已禁用 + 三方、源码推测 + 三方），挑一个显示等于
		* 把另一个藏起来；并排放才是实话。空的自己不占位。
		*/
		function Marks({ align = "left", children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `flex min-w-0 items-center gap-2 truncate text-[11.5px] ${align === "right" ? "justify-end" : ""}`,
				children
			});
		}
		/** 右对齐的量或标记格。空着也要占位——否则网格列数对不上，右列会整体左移。 */
		function EndCell({ children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "flex items-center justify-end gap-[7px] text-[11.5px] text-tertiary tabular-nums",
				children
			});
		}
		/** 量条：服务的「被依赖」、工具的「连带」共用，视觉重量一致。 */
		function Meter({ value, max, heavy = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
				className: `h-[5px] shrink-0 rounded-[3px] ${heavy ? "bg-brand-bright" : "bg-dimmed opacity-55"}`,
				style: { width: Math.max(3, Math.round(value / Math.max(max, 1) * 52)) }
			});
		}
		//#endregion
		//#region src/client/components/WorkbenchList.tsx
		/** loader 给匿名 entry 生成的 8 位 hash 无信息量，有包名时包名升为主标题。 */
		const HASH_ID = /^[0-9a-f]{8}$/i;
		function labelOf(d) {
			return HASH_ID.test(d.shortId) && d.name !== "" ? d.name : d.shortId;
		}
		function basename(path) {
			return path.split(/[\\/]/).pop() ?? path;
		}
		function WorkbenchList(props) {
			if (props.axis === "layer") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LayerRail, { ...props });
			if (props.axis === "svc") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServiceTable, { ...props });
			if (props.axis === "tool") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolTable, { ...props });
			if (props.axis === "model") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelTable, { ...props });
			if (props.axis === "preset") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetTable, { ...props });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginRows, { ...props });
		}
		function PluginRows({ t, filter, query, rawQuery, dossiers, index, selection, expand, onSelect, toggle, userLayers }) {
			const openGroups = expand.groups;
			const matches = (d) => query === "" || labelOf(d).toLowerCase().includes(query) || d.name.toLowerCase().includes(query) || d.provides.some((s) => s.service.toLowerCase().includes(query)) || d.requires.some((s) => s.service.toLowerCase().includes(query));
			const passes = (d) => {
				if (!matches(d)) return false;
				switch (filter) {
					case "attention": return isAttention(d, index);
					case "overridden": return hasUserOverride(d);
					case "disabled": return d.state === "disabled";
					case "runtime": return d.drift === "extra";
					case "foreign": return isForeign(vendorOf(d));
					case "userdisabled": return disabledBy(d, userLayers) === "user";
					case "bundledisabled": return disabledBy(d, userLayers) === "bundle";
					case "runtimedisabled": return disabledBy(d, userLayers) === "runtime";
					default: return true;
				}
			};
			const forceOpen = query !== "" || filter !== "all";
			const isOpen = (key) => openGroups.has(key) || forceOpen;
			const rows = [];
			/**
			* 把这一层的禁用项收成一组，压在这一层的末尾。
			* **每层各收各的**——禁用的插件仍然属于它所在的那个容器，拍平到根层级会让
			* 「agent-presets 里关掉了哪些」这个问题无从回答。
			*/
			const emitSunk = (list, depth, owner) => {
				if (list.length === 0) return;
				const key = `${owner}::sunk`;
				rows.push({
					key,
					kind: "sunk",
					depth,
					count: list.length,
					sunkKey: key
				});
				if (isOpen(key)) for (const n of list) rows.push({
					key: n.id,
					kind: "plugin",
					depth: depth + 1,
					d: n
				});
			};
			const walk = (nodes, depth, sunk) => {
				for (const n of nodes) {
					if (n.group) {
						if (n.shortId === "include") {
							walk(n.children, depth, sunk);
							continue;
						}
						const startAt = rows.length;
						rows.push({
							key: n.id,
							kind: "realm",
							depth,
							d: n
						});
						if (isOpen(n.id)) {
							const inner = [];
							walk(n.children, depth + 1, inner);
							emitSunk(inner, depth + 1, n.id);
						}
						if (rows.length === startAt + 1 && forceOpen && !passes(n)) rows.pop();
						continue;
					}
					if (n.state === "disabled" && filter === "all") {
						if (passes(n)) sunk.push(n);
						continue;
					}
					if (passes(n)) rows.push({
						key: n.id,
						kind: "plugin",
						depth,
						d: n
					});
				}
			};
			const rootSunk = [];
			walk(dossiers, 0, rootSunk);
			emitSunk(rootSunk, 0, "root");
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const cols = [
				{
					label: t("col.plugin"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("tool.pkg"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "132px",
					align: "right"
				},
				{
					label: t("col.action"),
					width: "104px",
					align: "right"
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Table, {
				columns: cols,
				children: rows.map((row) => {
					const indent = 18 + row.depth * 15;
					if (row.kind === "realm") {
						const realm = row.d;
						const expandable = realm.children.length > 0;
						const open = expandable && isOpen(realm.id);
						const on = selection?.kind === "plugin" && selection.id === realm.id;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
							selected: on,
							indent,
							onClick: () => {
								if (on && expandable) expand.toggleGroup(realm.id);
								else onSelect(on ? void 0 : {
									kind: "plugin",
									id: realm.id
								});
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
									dim: true,
									prefix: expandable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronBox, {
										open,
										onClick: (e) => {
											e.stopPropagation();
											expand.toggleGroup(realm.id);
										}
									}) : void 0,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
										text: labelOf(realm),
										query: rawQuery,
										mono: true
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: realm.name,
									query: rawQuery,
									dim: true
								}) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, { children: expandable ? t("plugins.holds", { count: realm.children.length }) : "" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleCell, {
									t,
									d: realm,
									toggle
								}) })
							]
						}, row.key);
					}
					if (row.kind === "sunk") {
						const open = isOpen(row.sunkKey);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupRow, {
							open,
							indent,
							onToggle: () => expand.toggleGroup(row.sunkKey),
							children: t("plugins.disabledGroup", { count: row.count })
						}, row.key);
					}
					const d = row.d;
					const on = selection?.kind === "plugin" && selection.id === d.id;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						indent,
						onClick: () => onSelect(on ? void 0 : {
							kind: "plugin",
							id: d.id
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								dim: d.state === "disabled",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: labelOf(d),
									query: rawQuery,
									mono: true
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: d.settingsOnly === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-caption",
								children: t("plugins.settingsOnly")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
								text: d.name,
								query: rawQuery,
								dim: true
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, {
								align: "right",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RowMark, {
									t,
									d,
									index,
									userLayers
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
									t,
									v: vendorOf(d)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToggleCell, {
								t,
								d,
								toggle
							}) })
						]
					}, row.key);
				})
			});
		}
		/**
		* 出处标记。官方是常态，常态不出任何东西——这一条在每根轴上都一样，
		* 所以做成一个组件而不是在四处各写一遍。
		*/
		function VendorMark({ t, v }) {
			if (!isForeign(v)) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-tertiary",
				children: t(`vendor.${v}`)
			});
		}
		/**
		* 禁用 / 启用那一格。
		*
		* 要点两次才动手：这一下会写到你的 profile 补丁文件里，是这个面板唯一留在磁盘上的
		* 痕迹，误点一次比误点「打开洞察」贵得多。确认态标红，**2 秒不点、或者鼠标移开，
		* 都会退回去**——两条一起兜：定时器管「点完就不动了」，移开管「反悔了想马上撤」。
		*
		* **这一列不给颜色加过渡。** 这里踩过一个坑：文字是瞬间换的（「禁用」→「确认禁用？」），
		* 颜色却要慢慢淡 150 毫秒，于是中间那几帧是一个**黑色的「确认禁用？」**——蓝到红的
		* 插值正好经过一段发暗的中间色。一个正在问你「确定吗」的提示，不该先用别的颜色
		* 把这句话说一遍。所以这一列的每次跳色要么是即时的，要么就不该发生。
		*
		* 按不动的两种理由分开说：**撞名**是这一条永远不能这么写（换 id 也没用），
		* **版本错位**是重启一次就好。混成一句「不可用」等于什么都没说。
		*/
		function ToggleCell({ t, d, toggle }) {
			const blocked = toggle.blockedBy(d);
			const off = configuredOff(d);
			const busy = toggle.busy === d.id;
			const pending = toggle.pending === d.id;
			const disabled = !toggle.supported || blocked !== void 0 || toggle.busy !== void 0;
			const label = busy ? t("toggle.working") : pending ? off ? t("toggle.confirmOn") : t("toggle.confirmOff") : off ? t("toggle.on") : t("toggle.off");
			const title = blocked === "not-in-config" ? t("toggle.notInConfig") : blocked === "twins" ? t("toggle.twins") : blocked === "dup-in-config" ? t("toggle.dupInConfig") : !toggle.supported ? t("toggle.unsupported") : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				title,
				disabled,
				onClick: (e) => {
					e.stopPropagation();
					toggle.onToggle(d);
				},
				onMouseLeave: () => {
					if (pending) toggle.onCancel();
				},
				onBlur: () => {
					if (pending) toggle.onCancel();
				},
				className: `shrink-0 rounded px-1.5 py-px text-[11.5px] ${disabled ? "cursor-not-allowed text-dimmed" : pending ? "cursor-pointer font-medium text-err" : "cursor-pointer text-tertiary hover:text-brand-bright"}`,
				children: label
			});
		}
		/** 行尾标记：只标异常与人为改动，正常态什么都不出。 */
		function RowMark({ t, d, index, userLayers }) {
			if (isAttention(d, index)) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-warn",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), d.state === void 0 || d.state === "active" ? t("mark.missingProvider") : t(`state.${d.state}`)]
			});
			if (pendingRestart(d)) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				title: t("mark.pendingRestartHint"),
				className: "inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-warn",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("mark.pendingRestart")]
			});
			const off = disabledBy(d, userLayers);
			if (off !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-tertiary",
				children: t(`off.${off}`)
			});
			if (d.state === "disabled") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-[11.5px] text-tertiary",
				children: t("state.disabled")
			});
			if (hasUserOverride(d)) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-brand-bright",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("mark.overridden")]
			});
			if (d.drift === "extra") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "inline-flex shrink-0 items-center gap-1.5 text-[11.5px] text-brand-bright",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("mark.runtime")]
			});
			return null;
		}
		function LayerRail({ t, query, layers, files, vendors, selection, onSelect }) {
			/**
			* 只有 bundle 层是 npm 包；profile / $DSH_HOME / overlay 是你自己的位置，不谈出处。
			*
			* 先问插件树：层的 patchPath 走的是软链（node_modules/dsh-insight/…），而插件
			* 自己的路径是 require.resolve 解析过的真路径——link 进来的包只有后者看得出是本地。
			* 那个包不是插件（纯配置 bundle）时才退回按路径判。
			*/
			const layerVendor = (l) => l.kind === "bundle" ? vendors.ofPackage(l.label) ?? vendorOf({
				name: l.label,
				path: l.patchPath
			}) : void 0;
			const shownLayers = layers.map((l, i) => [l, i]).filter(([l]) => query === "" || l.label.toLowerCase().includes(query) || (l.patchPath ?? "").toLowerCase().includes(query) || l.hits.some((h) => h.id.toLowerCase().includes(query)));
			const shownFiles = files.map((f, i) => [f, i]).filter(([f]) => query === "" || f.path.toLowerCase().includes(query));
			if (shownLayers.length === 0 && shownFiles.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const cols = [
				{
					label: t("col.config"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("layers.file"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "132px",
					hint: t("layers.orderNote")
				},
				{
					label: t("layers.acts"),
					width: "220px",
					align: "right"
				}
			];
			const first = shownLayers[0]?.[1] ?? -1;
			const last = shownLayers.length > 0 ? shownLayers[shownLayers.length - 1][1] : -1;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Table, {
				columns: cols,
				children: [shownLayers.map(([layer, i]) => {
					const on = selection?.kind === "layer" && selection.index === i;
					const counts = KIND_ORDER.map((k) => [k, layer.hits.filter((h) => h.kind === k).length]).filter(([, n]) => n > 0);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						onClick: () => onSelect(on ? void 0 : {
							kind: "layer",
							index: i
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								prefix: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "w-4 shrink-0 text-right text-[11.5px] text-tertiary tabular-nums",
									children: i + 1
								}),
								children: layer.label
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: layer.patchPath === void 0 ? "" : basename(layer.patchPath) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "shrink-0",
								children: i === last ? t("layers.lastWins") : i === first ? t("layers.firstApplied") : ""
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
								t,
								v: layerVendor(layer)
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, { children: counts.map(([k, n]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: KIND_TONE[k] === "dim" ? "text-tertiary" : `${TONE_TEXT[KIND_TONE[k]]} font-medium`,
								children: [
									t(`event.${k}`),
									" ",
									n
								]
							}, k)) })
						]
					}, `${layer.label}-${i}`);
				}), shownFiles.map(([file, i]) => {
					const on = selection?.kind === "file" && selection.index === i;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						onClick: () => onSelect(on ? void 0 : {
							kind: "file",
							index: i
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								dim: true,
								prefix: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "w-4 shrink-0 text-right text-[11.5px] text-caption",
									children: "·"
								}),
								children: basename(file.path)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: t({
								"root-config": "files.rootConfig",
								settings: "files.settings",
								credentials: "files.credentials",
								patch: "files.patch"
							}[file.role]) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "truncate text-[11.5px] text-tertiary",
								children: t("layers.notMerged")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, {})
						]
					}, file.path);
				})]
			});
		}
		function ServiceTable({ t, query, rawQuery, index, vendors, selection, onSelect }) {
			const rows = index.services.filter((s) => query === "" || s.service.toLowerCase().includes(query));
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const max = Math.max(...index.services.map((s) => s.consumers.length), 1);
			const cols = [
				{
					label: t("svc.service"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("svc.provider"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "132px"
				},
				{
					label: t("svc.consumers"),
					width: "96px",
					align: "right"
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Table, {
				columns: cols,
				children: rows.map((s) => {
					const on = selection?.kind === "service" && selection.service === s.service;
					const n = s.consumers.length;
					const hub = n >= 8;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						onClick: () => onSelect(on ? void 0 : {
							kind: "service",
							service: s.service
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								bold: hub,
								dim: n === 0,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: s.service,
									query: rawQuery,
									mono: true
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: s.provider !== void 0 ? shortOf(index, s.provider) : s.builtin ? t("svc.builtin") : t("svc.noProvider") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Marks, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
								t,
								v: s.provider === void 0 ? void 0 : vendors.ofPlugin(s.provider)
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(EndCell, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
								value: n,
								max,
								heavy: hub
							}), n === 0 ? t("svc.unused") : n] })
						]
					}, s.service);
				})
			});
		}
		/**
		* 一行一个**工具插件**，不是一个工具——这个区别在表头写死，别让人误以为看到的是工具清单。
		* 真正的工具名要 agent 跑起来才存在（详见 shared/tools.ts 的头注释）。
		* 这一轴的价值是消歧：同名两份（宿主面禁用 / 预设 realm 启用）合成一行，直接给净结果。
		*/
		function ToolTable({ t, query, rawQuery, tools, inventory, vendors, selection, expand, onSelect }) {
			const showOff = expand.offTools;
			const list = inventory?.tools ?? [];
			if (list.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolPluginTable, {
				t,
				query,
				rawQuery,
				tools,
				selection,
				onSelect
			});
			const rows = list.filter((x) => query === "" || x.name.toLowerCase().includes(query) || (x.plugin ?? "").toLowerCase().includes(query) || (x.pkg ?? "").toLowerCase().includes(query));
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const siblings = /* @__PURE__ */ new Map();
			for (const x of list) {
				const key = x.plugin ?? x.pkg ?? x.name;
				siblings.set(key, (siblings.get(key) ?? 0) + 1);
			}
			const max = Math.max(...siblings.values(), 1);
			const live = rows.filter((x) => x.enabled !== false);
			const off = rows.filter((x) => x.enabled === false);
			const offOpen = showOff || query !== "";
			const toolVendor = (tool) => (tool.pkg === void 0 ? void 0 : vendors.ofPackage(tool.pkg)) ?? vendors.ofShort(tool.plugin ?? "") ?? (tool.pkg === void 0 ? void 0 : vendorOf({ name: tool.pkg }));
			const row = (tool, indent) => {
				const on = selection?.kind === "toolName" && selection.name === tool.name && selection.pkg === tool.pkg;
				const n = siblings.get(tool.plugin ?? tool.pkg ?? tool.name) ?? 1;
				const heavy = n >= 4;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
					selected: on,
					indent,
					onClick: () => onSelect(on ? void 0 : {
						kind: "toolName",
						name: tool.name,
						pkg: tool.pkg
					}),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
							bold: heavy,
							dim: tool.enabled === false,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
								text: tool.name,
								query: rawQuery,
								mono: true
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
							text: tool.plugin ?? tool.pkg ?? "",
							query: rawQuery,
							dim: true
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0",
							children: tool.source === "scan" ? t("tool.srcScan") : ""
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
							t,
							v: toolVendor(tool)
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(EndCell, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
							value: n,
							max,
							heavy
						}), n] })
					]
				}, `${tool.pkg ?? ""}/${tool.name}`);
			};
			const cols = [
				{
					label: t("tool.name"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("tool.from"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "132px"
				},
				{
					label: t("tool.siblings"),
					width: "96px",
					align: "right"
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Table, {
				columns: cols,
				children: [live.map((x) => row(x)), off.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupRow, {
					open: offOpen,
					onToggle: expand.toggleOffTools,
					children: t("tool.disabledGroup", { count: off.length })
				}), offOpen && off.map((x) => row(x, 33))] })]
			});
		}
		/** 退化形态：拿不到工具清单时，仍按工具插件列（旧行为）。 */
		function ToolPluginTable({ t, query, rawQuery, tools, selection, onSelect }) {
			const rows = tools.filter((x) => query === "" || x.id.toLowerCase().includes(query) || x.name.toLowerCase().includes(query));
			if (tools.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: t("tool.empty") });
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const cols = [
				{
					label: t("tool.head"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("tool.pkg"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("tool.state"),
					width: "128px",
					align: "right"
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Table, {
				columns: cols,
				children: rows.map((tool) => {
					const on = selection?.kind === "tool" && selection.id === tool.id;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						onClick: () => onSelect(on ? void 0 : {
							kind: "tool",
							id: tool.id
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								dim: !tool.enabled,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: tool.id,
									query: rawQuery,
									mono: true
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
								text: tool.name,
								query: rawQuery,
								dim: true
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(EndCell, { children: [tool.split && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-brand-bright",
								children: t("tool.split")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: tool.enabled ? "text-tertiary" : "text-warn",
								children: tool.enabled ? t("tool.enabled") : t("tool.disabled")
							})] })
						]
					}, tool.id);
				})
			});
		}
		/** 完整 id → 短名（服务表与详情里的对端插件都用短名，长 id 无信息量）。 */
		function shortOf(index, id) {
			const sep = id.lastIndexOf(":");
			return sep < 0 ? id : id.slice(sep + 1);
		}
		/**
		* 一行一个**模型**（provider + 模型 id）。和「按工具」同构，但底子干净得多：
		* 工具那边要旁听 register 再靠调用栈反推注册者，模型这边 provider 目录自带
		* settingsNs——「谁提供的」是上游正经答案，不是推测。所以这一轴没有「标记：源码推测」，
		* 标记位留给真正要提醒的事：现在默认在用的是哪个。
		*
		* 末尾折叠一组「可配未配的 provider」：上游声明了这些路由可以接，但你还没配。
		* 它们没有模型可列，所以不混进模型行里，收成一组。
		*/
		function ModelTable({ t, query, rawQuery, models, modelsStale, vendors, selection, expand, onSelect }) {
			if (models === void 0) return modelsStale ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: t("model.stale") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
				kind: "loading",
				text: t("status.loading")
			});
			const hit = (text) => query === "" || text.toLowerCase().includes(query);
			const providerOf = new Map(models.providers.map((p) => [p.id, p]));
			const perProvider = /* @__PURE__ */ new Map();
			for (const m of models.models) perProvider.set(m.provider, (perProvider.get(m.provider) ?? 0) + 1);
			const max = Math.max(...perProvider.values(), 1);
			const isDefault = (m) => models.default?.provider === m.provider && models.default.model === m.id;
			const shown = models.models.filter((m) => hit(m.id) || hit(m.name) || hit(m.provider) || hit(providerOf.get(m.provider)?.settingsNs ?? ""));
			const barren = models.providers.filter((p) => p.wired && (perProvider.get(p.id) ?? 0) === 0 && (hit(p.id) || hit(p.settingsNs ?? "")));
			const dormant = models.providers.filter((p) => !p.wired && (hit(p.id) || hit(p.settingsNs ?? "")));
			const dormantOpen = expand.dormant || query !== "";
			if (shown.length === 0 && barren.length === 0 && dormant.length === 0) return models.models.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, { title: t("model.empty") }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const cols = [
				{
					label: t("col.model"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("model.from"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "132px"
				},
				{
					label: t("model.siblings"),
					width: "96px",
					align: "right"
				}
			];
			const providerRow = (p, mark, indent) => {
				const on = selection?.kind === "provider" && selection.id === p.id;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
					selected: on,
					indent,
					onClick: () => onSelect(on ? void 0 : {
						kind: "provider",
						id: p.id
					}),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
							dim: true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
								text: p.id,
								query: rawQuery,
								mono: true
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
							text: p.settingsNs ?? "",
							query: rawQuery,
							dim: true
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-tertiary",
							children: mark
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
							t,
							v: vendors.ofShort(p.settingsNs ?? "")
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, {})
					]
				}, `provider/${p.id}`);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Table, {
				columns: cols,
				children: [
					shown.map((m) => {
						const on = selection?.kind === "model" && selection.provider === m.provider && selection.id === m.id;
						const n = perProvider.get(m.provider) ?? 1;
						const current = isDefault(m);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
							selected: on,
							onClick: () => onSelect(on ? void 0 : {
								kind: "model",
								provider: m.provider,
								id: m.id
							}),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
									bold: current,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
										text: m.id,
										query: rawQuery,
										mono: true
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: m.provider,
									query: rawQuery,
									dim: true
								}) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, { children: [current && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "inline-flex shrink-0 items-center gap-1.5 text-brand-bright",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("model.default")]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
									t,
									v: vendors.ofShort(providerOf.get(m.provider)?.settingsNs ?? "")
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(EndCell, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
									value: n,
									max
								}), n] })
							]
						}, `${m.provider}/${m.id}`);
					}),
					barren.map((p) => providerRow(p, t("model.noModels"))),
					dormant.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupRow, {
						open: dormantOpen,
						onToggle: expand.toggleDormant,
						children: t("model.dormantGroup", { count: dormant.length })
					}), dormantOpen && dormant.map((p) => providerRow(p, t("model.dormant"), 33))] })
				]
			});
		}
		/**
		* 一行一个预设。
		*
		* 这一轴回答的是「会话开起来的时候，模型手里那套东西是从哪儿来的」。
		* 四列各管一件事：叫什么、谁给的、要不要提醒、装了多少插件。
		*
		* 标记位遵守同一条纪律——只标真正要提醒的：现在的默认、此刻在用、以及坏了的。
		* 出处（本地 / 三方）沿用其他轴的纯文字表达，因为它是背景信息不是警报。
		*/
		function PresetTable({ t, query, rawQuery, dossiers, presets, presetsStale, selection, onSelect, onJump }) {
			if (presets === void 0) return presetsStale ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("preset.stale"),
				detail: t("preset.staleWhy")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
				kind: "loading",
				text: t("status.loading")
			});
			if (presets.service === "missing") {
				const owner = [...walkDossiers(dossiers)].find((d) => d.name.includes("dsh-agent-presets"));
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					title: t("preset.noService"),
					detail: t("preset.noServiceWhy"),
					...owner === void 0 ? {} : { action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onJump({
							kind: "plugin",
							id: owner.id
						}),
						className: "cursor-pointer border-0 border-b border-transparent bg-transparent p-0 text-[12.5px] text-brand-bright transition-colors duration-150 hover:border-current",
						children: t("preset.noServiceGoto", { id: owner.shortId })
					}) }
				});
			}
			if (presets.presets.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("preset.empty"),
				detail: t("preset.emptyWhy")
			});
			const hit = (text) => query === "" || text.toLowerCase().includes(query);
			const shown = presets.presets.filter((p) => hit(p.id) || hit(p.name ?? "") || hit(p.description ?? "") || hit(p.pkg ?? "") || hit(p.root));
			if (shown.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
				title: t("status.noMatch"),
				detail: t("status.noMatchWhy")
			});
			const max = Math.max(...presets.presets.map((p) => p.plugins ?? 0), 1);
			const cols = [
				{
					label: t("col.preset"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("preset.from"),
					width: "minmax(0,1fr)"
				},
				{
					label: t("col.mark"),
					width: "156px"
				},
				{
					label: t("preset.plugins"),
					width: "96px",
					align: "right"
				}
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Table, {
				columns: cols,
				children: shown.map((p) => {
					const on = selection?.kind === "preset" && selection.id === p.id;
					const n = p.plugins ?? 0;
					const from = p.pkg ?? basename(p.root);
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Row, {
						selected: on,
						onClick: () => onSelect(on ? void 0 : {
							kind: "preset",
							id: p.id
						}),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(NameCell, {
								bold: p.isDefault,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
									text: p.name ?? p.id,
									query: rawQuery
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubCell, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TruncText, {
								text: from,
								query: rawQuery,
								dim: true,
								mono: true
							}) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Marks, { children: [
								p.broken !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "inline-flex shrink-0 items-center gap-1.5 text-warn",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("preset.brokenMark")]
								}),
								p.isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "inline-flex shrink-0 items-center gap-1.5 text-brand-bright",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "size-1.5 shrink-0 rounded-full bg-current" }), t("preset.default")]
								}),
								p.sessions !== void 0 && p.sessions > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "shrink-0 text-secondary",
									children: t("preset.inUse", { count: p.sessions })
								}),
								p.sessionsTotal !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "shrink-0 tabular-nums text-tertiary",
									children: t("preset.sessionsTotal", { count: p.sessionsTotal })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(VendorMark, {
									t,
									v: p.vendor
								})
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EndCell, { children: p.rows === void 0 ? "—" : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
								value: n,
								max
							}), n] }) })
						]
					}, p.id);
				})
			}), presets.sessionsUnnamed !== void 0 && presets.sessionsUnnamed > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				className: "m-0 px-3 pt-2.5 pb-1 text-[11.5px] leading-[1.55] text-tertiary",
				children: [t("preset.sessionsUnnamed", { count: presets.sessionsUnnamed }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "text-caption",
					children: [" · ", t("preset.sessionsUnnamedNote")]
				})]
			})] });
		}
		//#endregion
		//#region src/client/components/WorkbenchDetail.tsx
		function Section({ label, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "m-0 font-mono text-[11px] tracking-[0.08em] text-tertiary uppercase",
					children: label
				}), children]
			});
		}
		function Head({ title, sub }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "font-mono text-[15px] font-medium break-all",
					children: title
				}), sub !== void 0 && sub !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "text-[12px] break-all text-tertiary",
					children: sub
				})]
			});
		}
		function Link({ children, onClick, mono = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				onClick,
				className: `cursor-pointer border-0 border-b border-transparent bg-transparent p-0 text-brand-bright transition-colors duration-150 hover:border-current ${mono ? "font-mono text-[11.5px]" : "text-[12.5px]"}`,
				children
			});
		}
		function Pill({ children, onClick }) {
			const cls = "inline-flex shrink-0 items-center rounded px-1.5 py-px font-mono text-[11px] whitespace-nowrap bg-hover text-secondary";
			if (onClick === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: cls,
				children
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				onClick,
				className: `${cls} cursor-pointer transition-colors duration-150 hover:text-brand-bright`,
				children
			});
		}
		function WorkbenchDetail(props) {
			const { t, selection, layers, files, byId } = props;
			if (selection === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t });
			if (selection.kind === "layer") {
				const layer = layers[selection.index];
				return layer === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LayerDetail, {
					...props,
					layer,
					order: selection.index
				});
			}
			if (selection.kind === "file") {
				const file = files[selection.index];
				return file === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileDetail, {
					...props,
					file
				});
			}
			if (selection.kind === "service") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ServiceDetail, {
				...props,
				service: selection.service
			});
			if (selection.kind === "tool") {
				const tool = props.tools.find((x) => x.id === selection.id);
				return tool === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolDetail, {
					...props,
					tool
				});
			}
			if (selection.kind === "toolName") {
				const info = props.inventory?.tools.find((x) => x.name === selection.name && x.pkg === selection.pkg);
				return info === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolNameDetail, {
					...props,
					info
				});
			}
			if (selection.kind === "model") {
				const m = props.models?.models.find((x) => x.provider === selection.provider && x.id === selection.id);
				return m === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelDetail, {
					...props,
					model: m
				});
			}
			if (selection.kind === "provider") {
				const p = props.models?.providers.find((x) => x.id === selection.id);
				return p === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProviderDetail, {
					...props,
					route: p
				});
			}
			if (selection.kind === "preset") {
				const p = props.presets?.presets.find((x) => x.id === selection.id);
				return p === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetDetail, {
					...props,
					preset: p
				});
			}
			const d = byId.get(selection.id);
			return d === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Hint, { t }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PluginDetail, {
				...props,
				d
			});
		}
		function Hint({ t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
				children: t("detail.hint")
			});
		}
		function PluginDetail({ ctx, t, d, query, index, byId, layers, onSelect, userLayers }) {
			const layerIndexOf = (label) => layers.findIndex((l) => l.label === label);
			const ins = [...index.dependedBy.get(d.id) ?? []];
			const outs = [...index.dependsOn.get(d.id) ?? []];
			const twins = [...byId.values()].filter((x) => x.shortId === d.shortId && x.id !== d.id);
			const hops = impactHops(index, d.id);
			const impact = hops.reduce((n, h) => n + h.length, 0);
			const goto = (id) => onSelect({
				kind: "plugin",
				id
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: labelOf(d),
						sub: d.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Verdict$1, {
						t,
						d,
						index,
						twins: twins.length,
						userLayers
					}),
					d.group && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold text-tertiary",
							children: t("plugins.container")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: d.children.length > 0 ? t("plugins.containerNote", { count: d.children.length }) : t("plugins.groupOnly") })]
					}),
					d.settingsOnly === true && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold text-tertiary",
							children: t("plugins.settingsOnly")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("plugins.settingsOnlyNote") })]
					}),
					isForeign(vendorOf(d)) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold text-tertiary",
							children: t(`vendor.${vendorOf(d)}`)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: vendorOf(d) === "local" ? t("vendor.localNote") : t("vendor.thirdPartyNote") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]",
						children: [
							d.origin !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("detail.origin")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
									onClick: () => {
										const at = layerIndexOf(d.origin);
										if (at >= 0) onSelect({
											kind: "layer",
											index: at
										});
									},
									children: d.origin
								})
							})] }),
							d.id !== d.shortId && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("detail.fullId")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0 font-mono text-[11.5px] break-all text-secondary",
								children: d.id
							})] }),
							d.path !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("detail.path")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
									ctx,
									t,
									path: d.path,
									highlight: query,
									isDir: true
								})
							})] })
						]
					}),
					twins.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.twin"),
						children: twins.map((x) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "text-[12.5px] text-secondary",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
								mono: true,
								onClick: () => goto(x.id),
								children: x.id
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "text-tertiary",
								children: [" · ", x.state === "disabled" ? t("state.disabled") : t("state.active")]
							})]
						}, x.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Wiring, {
						t,
						d,
						index,
						onSelect
					}),
					(ins.length > 0 || outs.length > 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.neighborhood"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Neighborhood, {
							t,
							label: labelOf(d),
							ins,
							outs,
							index,
							onGoto: goto
						})
					}),
					impact > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Impact, {
						t,
						label: labelOf(d),
						hops,
						index,
						onGoto: goto,
						total: impact
					}),
					d.settings !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.settings"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(JsonPanels, {
							t,
							ns: d.settings
						})
					}),
					d.intent?.events !== void 0 && d.intent.events.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.stack"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
							className: "m-0 flex list-none flex-col gap-0.5 p-0 text-[12.5px]",
							children: d.intent.events.map((ev, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: "text-secondary",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "text-tertiary",
										children: [i + 1, "."]
									}),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
										onClick: () => {
											const at = layerIndexOf(ev.layer);
											if (at >= 0) onSelect({
												kind: "layer",
												index: at
											});
										},
										children: ev.layer
									}),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: TONE_TEXT[{
											insert: "dim",
											update: "info",
											disable: "err",
											enable: "dim"
										}[ev.kind]],
										children: t(`event.${ev.kind}`)
									})
								]
							}, i))
						})
					}),
					d.intent?.config !== null && d.intent?.config !== void 0 && Object.keys(d.intent.config).length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.finalConfig"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
							data: d.intent.config,
							label: d.shortId,
							labels: jsonTreeLabels(t)
						})
					})
				]
			});
		}
		/** 结论行：先说这插件到底怎么了，再给细节。正常态不出结论条。 */
		function Verdict$1({ t, d, index, twins, userLayers }) {
			const missing = d.requires.filter((r) => r.providers.length === 0 && index.serviceOf.get(r.service)?.builtin !== true).map((r) => r.service);
			let tone = "bg-hover text-secondary";
			let title = "";
			let body = "";
			if (d.state === "failed") {
				tone = "bg-hover text-err";
				title = t("state.failed");
				body = d.error?.message ?? "";
			} else if (d.state === "pending" || d.state === "loading") {
				tone = "bg-hover text-warn";
				title = t(`state.${d.state}`);
				body = t("detail.waitingNote");
			} else if (missing.length > 0) {
				tone = "bg-hover text-err";
				title = t("mark.missingProvider");
				body = t("detail.missingNote", { services: missing.join("、") });
			} else if (d.drift === "mismatch") {
				title = t("dossier.mismatch");
				body = twins > 0 ? t("detail.mismatchCollision", { count: twins + 1 }) : t("detail.mismatchExpr");
			} else if (d.drift === "extra") {
				title = t("mark.runtime");
				body = t("dossier.noIntent");
			} else if (d.state === "disabled") {
				const off = disabledBy(d, userLayers) ?? "runtime";
				title = t(`off.${off}`);
				body = t(`off.${off}Note`);
			} else return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${tone}`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "shrink-0 font-semibold",
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: body })]
			});
		}
		/** 提供 / 依赖：服务是插件之间真正的连接介质，所以这里以服务为单位。 */
		function Wiring({ t, d, index, onSelect }) {
			if (d.provides.length === 0 && d.requires.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "m-0 text-[11.5px] text-tertiary",
				children: t("graph.isolated")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3",
				children: [d.provides.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
					label: t("graph.provides"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-1",
						children: d.provides.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-[7px] text-[12px]",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "service",
									service: s.service
								}),
								children: s.service
							}), s.consumers.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11.5px] text-tertiary",
								children: t("graph.noConsumer")
							}) : s.consumers.length > 5 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-caption",
								children: "←"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11.5px] text-tertiary",
								children: t("detail.manyConsumers", { count: s.consumers.length })
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-caption",
								children: "←"
							}), s.consumers.map((c) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
								mono: true,
								onClick: () => onSelect({
									kind: "plugin",
									id: c
								}),
								children: shortOf(index, c)
							}, c))] })]
						}, s.service))
					})
				}), d.requires.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
					label: t("graph.requires"),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-1",
						children: d.requires.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-[7px] text-[12px]",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "service",
									service: s.service
								}),
								children: s.service
							}), s.providers.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: `text-[11.5px] ${index.serviceOf.get(s.service)?.builtin === true ? "text-tertiary" : "text-err"}`,
								children: index.serviceOf.get(s.service)?.builtin === true ? t("svc.builtinNote") : t("graph.noProvider")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-caption",
								children: "→"
							}), s.providers.map((pid) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
								mono: true,
								onClick: () => onSelect({
									kind: "plugin",
									id: pid
								}),
								children: shortOf(index, pid)
							}, pid))] })]
						}, s.service))
					})
				})]
			});
		}
		/** 一度邻域：竖排三段。420px 宽塞不下三列，而上下游关系用「上面 / 中间 / 下面」一样清楚。 */
		function Neighborhood({ t, label, ins, outs, index, onGoto }) {
			const cap = (ids, n) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-[3px]",
				children: [ids.slice(0, n).map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
					onClick: () => onGoto(id),
					children: shortOf(index, id)
				}, id)), ids.length > n && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center rounded bg-hover px-1.5 py-px font-mono text-[11px] text-tertiary",
					children: ["+", ids.length - n]
				})]
			});
			const role = ins.length > 0 && outs.length > 0 ? t("nb.middle") : ins.length > 0 ? t("nb.base") : t("nb.leaf");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-[10px] border border-line",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 px-2.5 py-2",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-[11px] text-tertiary",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "↓" }),
								t("nb.dependedBy"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
									className: "font-medium text-tertiary tabular-nums",
									children: ins.length
								})
							]
						}), ins.length > 0 ? cap(ins, 12) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-secondary",
							children: t("nb.noneIn")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-y border-line bg-hover px-2.5 py-2",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-[11px] text-caption",
								children: "▸"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "font-mono text-[12.5px] font-semibold break-all",
								children: label
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "ml-auto shrink-0 text-[10.5px] text-tertiary",
								children: role
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1.5 px-2.5 py-2",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-[11px] text-tertiary",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "↓" }),
								t("nb.dependsOn"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
									className: "font-medium text-tertiary tabular-nums",
									children: outs.length
								})
							]
						}), outs.length > 0 ? cap(outs, 12) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-secondary",
							children: t("nb.noneOut")
						})]
					})
				]
			});
		}
		/** 影响面：唯一真需要图算法的问题，但输出是按跳数分组的列表。 */
		function Impact({ t, label, hops, index, onGoto, total }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
				className: "overflow-hidden rounded-[10px] border border-line",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", {
					className: "dsh-summary flex cursor-pointer list-none items-center gap-2 bg-hover px-2.5 py-2 text-[12.5px] text-secondary select-none [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-chevron inline-flex shrink-0 items-center text-tertiary",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronMini, {})
						}),
						t("impact.title", { name: label }),
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
							className: "font-semibold tabular-nums text-primary",
							children: total
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2.5 px-2.5 py-2.5",
					children: hops.map((hop, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mb-1 font-mono text-[11px] tracking-[0.06em] text-tertiary",
						children: t("impact.hop", {
							n: i + 1,
							count: hop.length
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: hop.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
							onClick: () => onGoto(id),
							children: shortOf(index, id)
						}, id))
					})] }, i))
				})]
			}) });
		}
		function ChevronMini() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "10",
				height: "10",
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 4l4 4-4 4" })
			});
		}
		function JsonPanels({ t, ns }) {
			const rows = [[t("settings.effective"), ns.value]];
			if (ns.base !== void 0) rows.push([t("settings.base"), ns.base]);
			if (ns.user !== void 0) rows.push([t("settings.user"), ns.user]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [ns.secrets.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "m-0 flex flex-wrap items-center gap-1 text-[11.5px] text-tertiary",
					children: [t("settings.secrets"), ns.secrets.map((s) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pill, { children: [
						s.path,
						"：",
						s.set ? "***" : t("settings.secretUnset")
					] }, s.path))]
				}), rows.map(([label, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "text-[11.5px] text-tertiary",
						children: label
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
						data: value ?? null,
						label,
						labels: jsonTreeLabels(t)
					})]
				}, label))]
			});
		}
		function LayerDetail({ ctx, t, layer, order, query, layers, index, onSelect }) {
			const groups = KIND_ORDER.map((k) => [k, layer.hits.filter((h) => h.kind === k).map((h) => h.id)]).filter(([, ids]) => ids.length > 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: layer.label,
						sub: `${t("layers.order", { n: order + 1 })} · ${layer.kind === "profile" ? t("layers.profileLayer") : t("layers.bundleLayer")} · ${layer.readonly ? t("layers.readonly") : t("layers.writable")}`
					}),
					layer.patchPath !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.path"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: layer.patchPath,
							highlight: query
						})
					}),
					groups.map(([kind, ids]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `flex flex-col gap-1.5 border-l-2 pl-2.5 ${KIND_BAR[kind]}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "m-0 font-mono text-[11px] tracking-[0.08em] text-tertiary uppercase",
							children: [
								t(`event.${kind}`),
								" ",
								ids.length
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: ids.map((id) => {
								const target = [...index.dependsOn.keys()].find((k) => k === id || k.endsWith(`:${id}`));
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
									onClick: target === void 0 ? void 0 : () => onSelect({
										kind: "plugin",
										id: target
									}),
									children: id
								}, id);
							})
						})]
					}, kind)),
					groups.every(([kind]) => kind === "insert") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
						children: t("layers.onlyInserts")
					}),
					layers.length > 0 && order === layers.length - 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
						children: t("layers.highestNote")
					})
				]
			});
		}
		function ServiceDetail({ t, service, index, byId, onSelect }) {
			const entry = index.serviceOf.get(service);
			if (entry === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
				kind: "empty",
				text: t("status.noMatch")
			});
			const provider = entry.provider === void 0 ? void 0 : byId.get(entry.provider);
			const hops = entry.provider === void 0 ? [] : impactHops(index, entry.provider);
			const total = hops.reduce((n, h) => n + h.length, 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: service,
						sub: t("svc.sub", { count: entry.consumers.length })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("svc.provider"),
						children: provider !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "text-[12.5px]",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
								mono: true,
								onClick: () => onSelect({
									kind: "plugin",
									id: provider.id
								}),
								children: labelOf(provider)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "text-[12px] text-tertiary",
								children: [" · ", provider.name]
							})]
						}) : entry.candidates !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: entry.candidates.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "plugin",
									id
								}),
								children: shortOf(index, id)
							}, id))
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 text-[11.5px] text-secondary",
							children: entry.builtin ? t("svc.builtinNote") : t("graph.noProvider")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("svc.consumersN", { count: entry.consumers.length }),
						children: entry.consumers.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: entry.consumers.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "plugin",
									id
								}),
								children: shortOf(index, id)
							}, id))
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 text-[11.5px] text-secondary",
							children: t("svc.unusedNote")
						})
					}),
					provider !== void 0 && total > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Impact, {
						t,
						label: labelOf(provider),
						hops,
						index,
						total,
						onGoto: (id) => onSelect({
							kind: "plugin",
							id
						})
					})
				]
			});
		}
		/** 一个工具名的档案：它由谁注册、那个插件在哪一层被插入 / 被禁用、来源可不可靠。 */
		function ToolNameDetail(props) {
			const { t, info, tools, inventory, onSelect } = props;
			const owner = info.plugin === void 0 ? void 0 : tools.find((x) => x.id === info.plugin);
			const ownerEntry = owner === void 0 ? void 0 : owner.entries.find((e) => e.state === "active") ?? owner.entries[0];
			const key = info.plugin ?? info.pkg;
			const siblings = (inventory?.tools ?? []).filter((x) => (x.plugin ?? x.pkg) === key && x.name !== info.name);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: info.name,
						sub: info.description
					}),
					owner !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${owner.enabled ? "bg-hover text-secondary" : "bg-hover text-warn"}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold",
							children: owner.enabled ? t("tool.enabled") : t("tool.disabled")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: owner.enabled ? t("tool.enabledNote") : t("tool.disabledNote") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("tool.from")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: [owner === void 0 || ownerEntry === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "font-mono text-[11.5px]",
									children: info.pkg ?? "—"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
									mono: true,
									onClick: () => onSelect({
										kind: "plugin",
										id: ownerEntry.id
									}),
									children: owner.id
								}), info.pkg !== void 0 && owner !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "text-[11.5px] text-tertiary",
									children: [" · ", info.pkg]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("tool.source")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: info.source === "runtime" ? t("tool.srcRuntimeNote") : t("tool.srcScanNote")
							})
						]
					}),
					siblings.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("tool.siblingsHead", { count: siblings.length }),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: siblings.map((x) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "toolName",
									name: x.name,
									pkg: x.pkg
								}),
								children: x.name
							}, x.name))
						})
					}),
					owner !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary",
						children: siblings.length > 0 ? t("tool.siblingsNote", {
							plugin: owner.id,
							count: siblings.length + 1
						}) : t("tool.howToDisable")
					})
				]
			});
		}
		/**
		* 「谁提供、谁开、谁禁」的三段回答：
		*   谁提供 —— 哪个包、哪一层插进来的
		*   谁开谁禁 —— 每一份 entry 的运行状态 + 配置层对这个 id 做过什么
		* 最后诚实说明这一层的边界：插件实际注册了哪些工具名，静态拿不到。
		*/
		function ToolDetail({ t, tool, layers, byId, onSelect }) {
			const acts = layers.map((l, i) => ({
				order: i + 1,
				label: l.label,
				hits: l.hits.filter((h) => h.id === tool.id)
			})).filter((x) => x.hits.length > 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: tool.id,
						sub: tool.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `flex gap-2.5 rounded-lg px-2.5 py-2.5 text-[12.5px] leading-[1.55] ${tool.enabled ? "bg-hover text-secondary" : "bg-hover text-warn"}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold",
							children: tool.enabled ? t("tool.enabled") : t("tool.disabled")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tool.split ? t("tool.splitNote") : tool.enabled ? t("tool.enabledNote") : t("tool.disabledNote") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("tool.entries", { count: tool.entries.length }),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-1.5",
							children: tool.entries.map((e) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline gap-2 text-[12.5px]",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "text-[11.5px] text-dimmed",
										children: e.realm === "" ? t("tool.hostPlane") : e.realm
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
										mono: true,
										onClick: () => onSelect({
											kind: "plugin",
											id: e.id
										}),
										children: e.id
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: e.state === "active" ? "text-tertiary" : "text-warn",
										children: e.state === void 0 ? "" : t(`state.${e.state}`)
									})
								]
							}, e.id))
						})
					}),
					acts.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("tool.acts"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
							className: "m-0 flex list-none flex-col gap-0.5 p-0 text-[12.5px]",
							children: acts.map((a) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: "text-secondary",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "text-dimmed",
										children: [a.order, "."]
									}),
									" ",
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
										onClick: () => onSelect({
											kind: "layer",
											index: a.order - 1
										}),
										children: a.label
									}),
									" ",
									a.hits.map((h) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: TONE_TEXT[{
											insert: "dim",
											update: "info",
											disable: "err",
											enable: "dim"
										}[h.kind]],
										children: [t(`event.${h.kind}`), " "]
									}, h.kind))
								]
							}, a.order))
						})
					}),
					tool.path !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.path"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11.5px] leading-[1.55] break-all text-tertiary",
							children: tool.path
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary",
						children: t("tool.limitNote")
					})
				]
			});
		}
		function FileDetail({ ctx, t, file, query }) {
			const roleKey = {
				"root-config": "files.rootConfig",
				settings: "files.settings",
				credentials: "files.credentials",
				patch: "files.patch"
			}[file.role];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: basename(file.path),
						sub: `${t(roleKey)} · ${t("layers.notMergedNote")}`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("detail.path"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: file.path,
							highlight: query,
							previewable: file.previewable,
							openable: file.role !== "credentials"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-1.5",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pill, { children: [(file.size / 1024).toFixed(1), " KB"] }), !file.previewable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, { children: t("files.credentialsNote") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
						children: t("files.notMergedWhy")
					})
				]
			});
		}
		/** provider 是哪个插件声明的：settingsNs 就是那个插件的短 id，上游直接给的，不用猜。 */
		function pluginOfRoute(route, byId) {
			if (route?.settingsNs === void 0) return void 0;
			for (const d of byId.values()) if (d.shortId === route.settingsNs && d.state === "active") return d;
			for (const d of byId.values()) if (d.shortId === route.settingsNs) return d;
		}
		/**
		* 激活方式。写清楚是「环境变量里的 key」还是「登录换来的授权」——这两件事出问题
		* 的排查路径完全不同：前者去看环境变量，后者去重新登录。
		* 只显示环境变量的**名字**，值一次也不经手（host 那边连读都没读）。
		*/
		function AuthLine({ t, route }) {
			if (route.auth === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "text-secondary",
				children: [t(`auth.${route.auth}`), route.auth === "env" && route.authEnv !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "ml-1.5 font-mono text-[11.5px] text-tertiary",
					children: route.authEnv
				})]
			});
		}
		/** 配置落点：`llm-pi-ai › providers › kimi-coding`，照着这条路径去 settings 里找。 */
		function ConfigAt({ route }) {
			const parts = [route.settingsNs ?? "", ...route.settingsPath ?? []].filter((x) => x !== "");
			if (parts.length === 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11.5px] leading-[1.55] break-all text-secondary",
				children: parts.join(" › ")
			});
		}
		/**
		* 一个模型的档案。要回答的和工具那边是同一组问题——从哪来、现在算不算数、
		* 关掉会连带什么——只是这里每一跳都有上游正经答案，不需要标注可信度。
		*/
		function ModelDetail(props) {
			const { t, model, models, byId, onSelect } = props;
			const route = models?.providers.find((p) => p.id === model.provider);
			const plugin = pluginOfRoute(route, byId);
			const siblings = (models?.models ?? []).filter((m) => m.provider === model.provider && m.id !== model.id);
			const current = models?.default?.provider === model.provider && models.default.model === model.id;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: model.id,
						sub: model.name === model.id ? void 0 : model.name
					}),
					current && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-semibold text-brand-bright",
							children: t("model.default")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("model.defaultNote", { effort: models?.default?.reasoningEffort ?? "" }) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.from")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "font-mono text-[11.5px]",
									children: model.provider
								}), route?.name !== void 0 && route.name !== model.provider && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "text-[11.5px] text-tertiary",
									children: [" · ", route.name]
								})]
							}),
							route?.auth !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.auth")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthLine, {
									t,
									route
								})
							})] }),
							plugin !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.plugin")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
									mono: true,
									onClick: () => onSelect({
										kind: "plugin",
										id: plugin.id
									}),
									children: labelOf(plugin)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "text-[11.5px] text-tertiary",
									children: [" · ", plugin.name]
								})]
							})] }),
							route !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.configAt")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfigAt, { route })
							})] }),
							model.inputModalities !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.modalities")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: model.inputModalities.join(" · ")
							})] })
						]
					}),
					model.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
						children: model.description
					}),
					siblings.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("model.siblingsHead", {
							count: siblings.length,
							provider: model.provider
						}),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: siblings.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "model",
									provider: m.provider,
									id: m.id
								}),
								children: m.id
							}, m.id))
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 rounded-lg bg-surface px-2.5 py-2.5 text-[12px] leading-[1.6] text-secondary",
						children: plugin === void 0 ? t("model.howToSwitch") : t("model.siblingsNote", {
							plugin: labelOf(plugin),
							count: siblings.length + 1
						})
					})
				]
			});
		}
		/** 一条 provider 路由的档案：接线了但没模型，或者声明了可配却还没配。 */
		function ProviderDetail(props) {
			const { t, route, models, byId, onSelect } = props;
			const plugin = pluginOfRoute(route, byId);
			const mine = (models?.models ?? []).filter((m) => m.provider === route.id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: route.id,
						sub: route.name === route.id ? void 0 : route.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex gap-2.5 rounded-lg bg-hover px-2.5 py-2.5 text-[12.5px] leading-[1.55] text-secondary",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `shrink-0 font-semibold ${route.wired ? "text-warn" : "text-tertiary"}`,
							children: route.wired ? t("model.wired") : t("model.unwired")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: route.wired ? t("model.noModelsNote") : t("model.dormantNote") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "m-0 grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-3 gap-y-[7px] text-[12.5px]",
						children: [
							route.auth !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.auth")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthLine, {
									t,
									route
								})
							})] }),
							plugin !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.plugin")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", {
								className: "m-0 min-w-0 text-secondary",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
									mono: true,
									onClick: () => onSelect({
										kind: "plugin",
										id: plugin.id
									}),
									children: labelOf(plugin)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "text-[11.5px] text-tertiary",
									children: [" · ", plugin.name]
								})]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", {
								className: "text-tertiary",
								children: t("model.configAt")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
								className: "m-0 min-w-0",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfigAt, { route })
							})
						]
					}),
					mine.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("model.siblingsHead", {
							count: mine.length,
							provider: route.id
						}),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: mine.map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, {
								onClick: () => onSelect({
									kind: "model",
									provider: m.provider,
									id: m.id
								}),
								children: m.id
							}, m.id))
						})
					})
				]
			});
		}
		/**
		* 一个包名在插件树里的落点。
		*
		* 为什么按**包名**找而不按短 id：预设挂上去之后，同一个短 id 在树里会有两份
		* （宿主面的 `include:tool-bash` 和挂载的 `include:agent-presets:tool-bash`），
		* 短 id 认不出该跳哪一个——这正是这个仓库对撞名一贯的态度。包名唯一，
		* 而这一跳要回答的问题（这个包是什么、装在哪、连着谁）在两份之间是同一个答案。
		*
		* 挑哪一份：先要活着的（跳到已经被禁掉的副本上等于死链接），再要 id 最短的
		* ——宿主面那条比挂载那条短，它更稳定，不随预设换来换去。
		*/
		function entryForPackage(byId, name) {
			if (name === "" || name.startsWith("cordis:")) return void 0;
			let best;
			for (const d of byId.values()) {
				if (d.name !== name) continue;
				if (best === void 0) {
					best = d;
					continue;
				}
				if (d.state === "active" !== (best.state === "active") ? d.state === "active" : d.id.length < best.id.length) best = d;
			}
			return best;
		}
		/** composition 的一行。容器行往下缩进，不给它自己上颜色——它只是个盒子。 */
		function PresetRowLine({ t, row, depth, byId, onSelect }) {
			const off = row.disabled;
			const target = row.group ? void 0 : entryForPackage(byId, row.name);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-baseline gap-2 py-[3px] text-[11.5px] leading-[1.5]",
				style: { paddingLeft: `${String(depth * 14)}px` },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `shrink-0 font-mono ${off ? "text-dimmed line-through" : row.group ? "text-tertiary" : "text-secondary"}`,
						children: row.id === "" ? "—" : row.id
					}),
					row.group ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "shrink-0 text-[11px] text-tertiary",
						children: [t("preset.group"), row.isolate !== void 0 && ` · ${t("preset.isolate")} ${row.isolate.join(", ")}`]
					}) : target === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "min-w-0 truncate font-mono text-[11px] text-tertiary",
						children: row.name
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "min-w-0 truncate",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Link, {
							mono: true,
							onClick: () => onSelect({
								kind: "plugin",
								id: target.id
							}),
							children: row.name
						})
					}),
					row.disabledExpr !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "ml-auto shrink-0 font-mono text-[10.5px] text-tertiary",
						children: "!!js"
					})
				]
			}), row.children?.map((child, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetRowLine, {
				t,
				row: child,
				depth: depth + 1,
				byId,
				onSelect
			}, `${child.id}/${String(i)}`))] });
		}
		/**
		* 一个预设的档案。
		*
		* 顺序按「问的人最先想知道什么」排：这是什么 → 谁给的 → 文件在哪 → 里面装了什么。
		* 出处那一段要说两件不同的事：上游记的 trust（发行带的 / 本地写的）和我们按磁盘
		* 位置判的 vendor（官方 / 三方 / 本地）。它们经常一致，但不一致的那种情况才是重点：
		* 一个三方插件带进来的预设，上游也记成 `system`。
		*/
		function PresetDetail({ ctx, t, preset, query, presets, byId, onSelect }) {
			const root = presets?.roots.find((r) => r.path === preset.root);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-[15px]",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Head, {
						title: preset.name ?? preset.id,
						sub: preset.name === void 0 ? void 0 : preset.id
					}),
					preset.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
						children: preset.description
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-1.5",
						children: [
							preset.isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, { children: t("preset.default") }),
							preset.plugins !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pill, { children: [
								preset.plugins,
								" ",
								t("preset.plugins")
							] }),
							isForeign(preset.vendor) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pill, { children: t(`vendor.${preset.vendor}`) }),
							preset.bytes !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Pill, { children: [(preset.bytes / 1024).toFixed(1), " KB"] })
						]
					}),
					preset.broken !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 text-[12.5px] leading-[1.6] text-warn",
							children: t("preset.brokenNote", { reason: preset.broken })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
							children: t("preset.brokenWhy")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
						label: t("vendor.head"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
								children: [t(`preset.trust.${preset.trust}`), preset.pkg !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "ml-1.5 font-mono text-[11.5px] text-tertiary",
									children: preset.pkg
								})]
							}),
							preset.vendor === "third-party" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
								children: t("vendor.thirdPartyNote")
							}),
							preset.trust === "user" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
								children: t("preset.userTrustNote")
							}),
							preset.isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
								children: t("preset.defaultNote")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
						label: t("preset.sessions"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 text-[12.5px] leading-[1.6] text-secondary",
							children: preset.sessions === void 0 ? t("preset.sessionsUnknown") : preset.sessions === 0 ? t("preset.noSessions") : t("preset.inUse", { count: preset.sessions })
						}), preset.sessionsTotal !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 mt-1 text-[12.5px] leading-[1.6] text-secondary tabular-nums",
							children: t("preset.sessionsTotal", { count: preset.sessionsTotal })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "m-0 mt-1 text-[11.5px] leading-[1.55] text-tertiary",
							children: t("preset.sessionsTotalNote")
						})] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("preset.dir"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: preset.dir,
							highlight: query,
							isDir: true
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("preset.file"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: preset.path,
							highlight: query
						})
					}),
					preset.metaPath !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Section, {
						label: t("preset.meta"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: preset.metaPath,
							highlight: query
						})
					}),
					root !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
						label: t("preset.root"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePath, {
							ctx,
							t,
							path: root.path,
							highlight: query,
							isDir: true
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "text-[11.5px] text-tertiary",
							children: t("preset.rootCount", { count: root.count })
						})]
					}),
					preset.rowsError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "m-0 text-[12.5px] leading-[1.6] text-warn",
						children: t("preset.rowsError", { message: preset.rowsError })
					}),
					preset.rows !== void 0 && preset.rows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Section, {
						label: `${t("preset.composition")} · ${String(preset.plugins ?? 0)}`,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "flex flex-col rounded-lg border border-line bg-surface-2 px-2.5 py-2",
								children: preset.rows.map((row, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetRowLine, {
									t,
									row,
									depth: 0,
									byId,
									onSelect
								}, `${row.id}/${String(i)}`))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
								children: t("preset.planeNote")
							}),
							preset.rows.some((r) => hasExpr(r)) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "m-0 text-[11.5px] leading-[1.55] text-tertiary",
								children: t("preset.exprNote")
							})
						]
					})
				]
			});
		}
		/** 这棵子树里有没有「开关是表达式」的行——有才值得多说那一句。 */
		function hasExpr(row) {
			return row.disabledExpr !== void 0 || (row.children ?? []).some(hasExpr);
		}
		//#endregion
		//#region src/client/components/Workbench.tsx
		/**
		* Insight 工作台：一块屏幕，左边扫描，右边深入，上面给结论。
		*
		* 为什么是独立的全屏模态而不是设置页里的一块：设置弹窗写死 800×800，Insight 只拿到
		* 556px，主从布局在这个宽度里数学上不成立（最长包名 316px）。自绘全屏模态这条路
		* 是现成的——旧依赖图对话框就是这么开的（portal + Esc 捕获拦截 + 开关动画），
		* 宿主完全支持。工作台独立之后它盖住整个设置弹窗，不再受 800×800 约束。
		*
		* 三根排序轴是同一份数据的三种排列，不是三个数据源：
		*   按配置 = 同一份数据按配置层排，末尾接不参与合并的普通配置文件
		*   按插件 = 运行时骨架 × 配置意图 × 服务关系 × 设置，一行一档案
		*   按服务 = 插件之间真正的连接介质（60 个服务里 56 个恰好一个提供者，所以是表不是图）
		*   按工具 = agent 真正拿到手的工具名，运行时旁听 register 得来
		*   按模型 = agent 能选的模型，全部走 llm 服务的只读面（这一轴不需要任何 hack）
		* 排序是因果链：配置生出插件，插件提供服务，服务里跑出工具和模型。
		* 切轴不清空选中，右栏永远在原地：列表里点一行只换右栏，搜索词和筛选都不动。
		* 但右栏里的链接（服务 → 提供者、层 → 该层、工具 → 注册它的插件）是跨轴的，目标
		* 多半不在当前视野里——那一跳仍然要「切轴 + 展开 + 滚到中间 + 闪一下」，见 jump()。
		*/
		/**
		* 顺序即因果：配置生出插件，插件提供服务，服务里跑出工具和模型。
		* 「按预设」收在最后：前五根讲的是这个**进程**里已经跑着的东西，而预设是另一份
		* 配置——agent 面那份，会话开起来时才挂上去。它不在那条因果链上，所以不插进去打断它。
		*/
		const AXES = [
			"layer",
			"plug",
			"svc",
			"tool",
			"model",
			"preset"
		];
		function Workbench(props) {
			const { t, open, onClose } = props;
			const [mounted, setMounted] = (0, react.useState)(open);
			const [shown, setShown] = (0, react.useState)(false);
			const settled = useSettled(shown);
			(0, react.useEffect)(() => {
				if (open) {
					setMounted(true);
					const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
					return () => cancelAnimationFrame(id);
				}
				setShown(false);
				const id = setTimeout(() => setMounted(false), 200);
				return () => clearTimeout(id);
			}, [open]);
			(0, react.useEffect)(() => {
				if (!mounted) return void 0;
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					e.stopImmediatePropagation();
					onClose();
				};
				document.addEventListener("keydown", onKey, true);
				return () => document.removeEventListener("keydown", onKey, true);
			}, [mounted, onClose]);
			if (!mounted) return null;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				role: "presentation",
				onClick: onClose,
				className: `dsh-insight fixed inset-0 z-[1010] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${shown ? "opacity-100" : "opacity-0"}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					role: "dialog",
					"aria-label": t("workbench.title"),
					onClick: (e) => e.stopPropagation(),
					style: SURFACE_SIZE,
					className: `relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-primary shadow-2xl transition-all duration-200 ease-out ${surfaceMotion(shown, settled)}`,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkbenchBody, { ...props })
				})
			}), document.body);
		}
		function WorkbenchBody({ ctx, t, onClose, tree, graph, final, settings, layers, files, inventory, models, modelsStale, presets, presetsStale, loading, error, onReload, initialJump }) {
			const [axis, setAxis] = (0, react.useState)("plug");
			const [filter, setFilter] = (0, react.useState)("all");
			const [query, setQuery] = (0, react.useState)("");
			const [selection, setSelection] = (0, react.useState)();
			const [openGroups, setOpenGroups] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [showOffTools, setShowOffTools] = (0, react.useState)(false);
			const [showDormant, setShowDormant] = (0, react.useState)(false);
			/** 跳转序号：每跳一次自增，驱动「滚到中间 + 闪一下」。用计数而不是 selection，
			因为可能连着跳到同一行（点两次同一个链接），那时 selection 没变但仍要再闪。 */
			const [reveal, setReveal] = (0, react.useState)(0);
			const listRef = (0, react.useRef)(null);
			/** 禁用/启用：确认态、写盘中、以及写完那一条横幅。都只允许同时存在一份。 */
			const [pendingToggle, setPendingToggle] = (0, react.useState)();
			const [busyToggle, setBusyToggle] = (0, react.useState)();
			const [notice, setNotice] = (0, react.useState)();
			/**
			* 写盘提示自己退场。它报的是一件已经做完的事，读一眼就没用了——
			* 留在那儿只会变成需要你动手关掉的垃圾。失败那条留久一点：那是要照着排查的。
			*/
			(0, react.useEffect)(() => {
				if (notice === void 0) return;
				const timer = setTimeout(() => setNotice(void 0), notice.tone === "err" ? 12e3 : 6e3);
				return () => clearTimeout(timer);
			}, [notice]);
			(0, react.useEffect)(() => {
				if (pendingToggle === void 0) return;
				const timer = setTimeout(() => setPendingToggle(void 0), 2e3);
				return () => clearTimeout(timer);
			}, [pendingToggle]);
			const dossiers = (0, react.useMemo)(() => tree === void 0 || graph === void 0 || final === void 0 ? [] : buildDossiers(tree, graph, final, settings ?? []), [
				tree,
				graph,
				final,
				settings
			]);
			const index = (0, react.useMemo)(() => buildGraphIndex(graph ?? []), [graph]);
			const tools = (0, react.useMemo)(() => buildToolPlugins(dossiers), [dossiers]);
			const vendors = (0, react.useMemo)(() => buildVendorIndex(dossiers), [dossiers]);
			const byId = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				for (const d of walkDossiers(dossiers)) map.set(d.id, d);
				return map;
			}, [dossiers]);
			/** 子 id → 父 id，跳转时用来算「要展开哪几层」。 */
			const parentOf = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				const walk = (nodes, parent) => {
					for (const n of nodes) {
						if (parent !== void 0) map.set(n.id, parent);
						if (n.children.length > 0) walk(n.children, n.id);
					}
				};
				walk(dossiers);
				return map;
			}, [dossiers]);
			/**
			* 一条 entry 的禁用组落在哪一层：往上找最近的、会渲染成一行的容器。
			* include 被拍平（它自己不占行），所以要跳过去继续往上。
			*/
			const sunkKeyFor = (id) => {
				let at = parentOf.get(id);
				while (at !== void 0 && byId.get(at)?.shortId === "include") at = parentOf.get(at);
				return `${at ?? "root"}::sunk`;
			};
			/** 手里已经有一份能画的数据了——决定刷新时要不要让占位符接管整块。 */
			const hasData = dossiers.length > 0;
			const expand = {
				groups: openGroups,
				toggleGroup: (id) => setOpenGroups((prev) => {
					const next = new Set(prev);
					if (!next.delete(id)) next.add(id);
					return next;
				}),
				offTools: showOffTools,
				toggleOffTools: () => setShowOffTools((v) => !v),
				dormant: showDormant,
				toggleDormant: () => setShowDormant((v) => !v)
			};
			/** 属于「你」的那些层：profile 补丁层与 $DSH_HOME 层。标签从 kind 现算，不写死字符串。 */
			const userLayers = (0, react.useMemo)(() => new Set((layers ?? []).filter((l) => l.kind === "profile" || l.kind === "home").map((l) => l.label)), [layers]);
			/**
			* 这一行为什么按不动。判据分两层，因为补丁作用的对象和你眼前看到的树不是一回事：
			*
			*   **配置里有几条**——补丁按 id 命中的是**重放出来的那份配置**（宿主面）。
			*   0 条 = 手写也没用（运行时注册的插件、只存在于预设里的行都是这样）；
			*   ≥2 条 = 配置本身有重名，写下去会同时命中。
			*
			*   **运行时有几份**——配置里唯一、运行时却有两份，是会话把预设挂上来了
			*   （include:tool-bash 与 include:agent-presets:tool-bash）。这时补丁仍然有效
			*   （它命中配置那一条），只是面板分不清你点的是哪一行，所以不替你决定。
			*   注意这一份是**随会话来去的**：关掉对话它就只剩一份，按钮又能点了。
			*/
			const configCount = (0, react.useMemo)(() => {
				const seen = /* @__PURE__ */ new Map();
				for (const e of final?.entries ?? []) seen.set(e.id, (seen.get(e.id) ?? 0) + 1);
				return seen;
			}, [final]);
			const runtimeCount = (0, react.useMemo)(() => {
				const seen = /* @__PURE__ */ new Map();
				for (const d of walkDossiers(dossiers)) seen.set(d.shortId, (seen.get(d.shortId) ?? 0) + 1);
				return seen;
			}, [dossiers]);
			const blockedBy = (d) => {
				const inConfig = configCount.get(d.shortId) ?? 0;
				if (inConfig === 0) return "not-in-config";
				if (inConfig > 1) return "dup-in-config";
				if ((runtimeCount.get(d.shortId) ?? 1) > 1 && d.origin === void 0) return "twins";
			};
			/** 写一次开关：第一下进确认态，第二下才真写。写完重新拉数据，让面板显示实况而不是我们的期望。 */
			const runToggle = (d) => {
				if (busyToggle !== void 0) return;
				if (pendingToggle !== d.id) {
					setNotice(void 0);
					setPendingToggle(d.id);
					return;
				}
				setPendingToggle(void 0);
				setBusyToggle(d.id);
				const next = d.state !== "disabled";
				const stateText = next ? t("toggle.stateOff") : t("toggle.stateOn");
				callInsight(ctx, "config/toggle", {
					id: d.shortId,
					disabled: next
				}).then((result) => {
					if (!result.ok) {
						setNotice({
							tone: "err",
							text: t("toggle.fail", { message: result.message })
						});
						return;
					}
					const key = {
						inserted: "toggle.doneInserted",
						updated: "toggle.doneUpdated",
						removed: "toggle.doneRemoved",
						unchanged: "toggle.doneUnchanged"
					}[result.action];
					setNotice({
						tone: "ok",
						text: t(key, {
							id: d.shortId,
							state: stateText,
							path: result.path
						})
					});
					if (result.action !== "unchanged") onReload();
				}).catch((cause) => {
					const message = cause instanceof InsightRpcError ? cause.message : t("toggle.unsupported");
					setNotice({
						tone: "err",
						text: t("toggle.fail", { message })
					});
				}).finally(() => setBusyToggle(void 0));
			};
			const toggle = {
				supported: true,
				...pendingToggle === void 0 ? {} : { pending: pendingToggle },
				...busyToggle === void 0 ? {} : { busy: busyToggle },
				blockedBy,
				onToggle: runToggle,
				onCancel: () => setPendingToggle(void 0)
			};
			/** 列表里点一行：只换右栏，搜索词与筛选保持不动——它们是你刚设的，凭什么替你清掉。 */
			const select = (next) => setSelection(next);
			/**
			* 从右栏链接跳到别处（服务名 → 提供者、层名 → 该层、工具 → 注册它的插件）。
			* 目标多半不在当前视野里，所以这一跳要把挡路的东西全部让开：
			*   切到目标所在的轴 → 清掉搜索与筛选（否则跳过去是一片空白）
			*   → 展开目标的祖先链、并把别的分组折回去（免得展开一堆无关的东西）
			*   → 滚到可视区中间 → 闪一下再平静（见下面的 effect）
			*/
			const jump = (next) => {
				setQuery("");
				switch (next.kind) {
					case "plugin": {
						setAxis("plug");
						setFilter("all");
						const chain = /* @__PURE__ */ new Set();
						for (let at = parentOf.get(next.id); at !== void 0; at = parentOf.get(at)) chain.add(at);
						if (byId.get(next.id)?.state === "disabled") chain.add(sunkKeyFor(next.id));
						setOpenGroups(chain);
						break;
					}
					case "layer":
					case "file":
						setAxis("layer");
						break;
					case "service":
						setAxis("svc");
						break;
					case "preset":
						setAxis("preset");
						break;
					case "tool":
						setAxis("tool");
						break;
					case "toolName": {
						setAxis("tool");
						const hit = inventory?.tools.find((x) => x.name === next.name && x.pkg === next.pkg);
						setShowOffTools(hit?.enabled === false);
						break;
					}
					case "model":
						setAxis("model");
						break;
					case "provider":
						setAxis("model");
						setShowDormant(models?.providers.find((p) => p.id === next.id)?.wired === false);
				}
				setSelection(next);
				setReveal((n) => n + 1);
			};
			/**
			* 外部落点只跳一次：跳完使用者多半要自己切轴、换选中，不能每次重渲染都被
			* 拽回去。要等 tree 到齐——jump 靠它算祖先链，空着跳过去是一片没展开的树。
			* initialJump 换了新值（又点了一块别的 UI）才允许再跳。
			*/
			const consumedJump = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (initialJump === void 0 || tree === void 0) return;
				if (consumedJump.current === initialJump) return;
				consumedJump.current = initialJump;
				jump(initialJump);
			}, [initialJump, tree]);
			/**
			* 跳转落地：把目标行滚到可视区中间并闪一下。
			* 只对跳转做，不对列表点选做——你刚点的那一行本来就在眼皮底下，替你滚一下是添乱。
			*
			* 要等两帧再滚：展开祖先链和「滚过末行」的留白都要先落到布局上。抢在那之前滚，
			* 可滚范围还没长出来，目标行会停在离中线两百多像素的地方。
			* 滚的是实测差值而不是 scrollIntoView({block:'center'})——后者算的是「最近的
			* 可滚祖先」，这里的滚动容器没有定位上下文，落点不可控。
			*
			* 瞬时定位而不是平滑滚动：跨百来行时 Chrome 的平滑滚动要跑一秒半，闪烁都放完了
			* 目标行还没到，中间那段飞驰的列表也读不出任何东西。直接落位、再闪一下交代
			* 「你被带到这儿了」，反而比动画好读。
			*/
			(0, react.useEffect)(() => {
				if (reveal === 0) return void 0;
				let flashed;
				let timer;
				let inner = 0;
				const outer = requestAnimationFrame(() => {
					inner = requestAnimationFrame(() => {
						const scroller = listRef.current;
						const node = scroller?.querySelector("[data-selected=\"true\"]");
						if (scroller === null || node === null || node === void 0) return;
						const box = scroller.getBoundingClientRect();
						const row = node.getBoundingClientRect();
						const delta = row.top + row.height / 2 - (box.top + box.height / 2);
						scroller.scrollTo({ top: scroller.scrollTop + delta });
						node.classList.remove("dsh-row-flash");
						node.offsetWidth;
						node.classList.add("dsh-row-flash");
						flashed = node;
						timer = setTimeout(() => node.classList.remove("dsh-row-flash"), 1200);
					});
				});
				return () => {
					cancelAnimationFrame(outer);
					cancelAnimationFrame(inner);
					if (timer !== void 0) clearTimeout(timer);
					flashed?.classList.remove("dsh-row-flash");
				};
			}, [reveal]);
			const q = normQuery(query);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "flex h-[55px] shrink-0 items-center gap-3 border-b border-line px-4",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "text-[14px] font-medium",
							children: t("workbench.title")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onReload,
							className: "ml-auto shrink-0 cursor-pointer rounded px-2.5 py-1 text-[12.5px] text-secondary transition-colors duration-150 hover:bg-hover hover:text-primary",
							children: t("action.refresh")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": t("action.close"),
							onClick: onClose,
							className: "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-tertiary transition-colors duration-150 hover:bg-hover hover:text-primary",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-[18px] py-[13px] leading-[26px]",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Verdict, {
						t,
						dossiers,
						index,
						layers,
						tools,
						inventory,
						models,
						presets
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "flex min-h-[56px] shrink-0 flex-wrap items-center gap-2.5 border-b border-line px-[18px] py-[11px]",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "relative inline-flex items-center",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: t("search.placeholder"),
								"aria-label": t("search.placeholder"),
								className: "box-border w-[220px] rounded-[7px] border border-line bg-surface py-[5px] pr-[26px] pl-2.5 text-[12.5px] text-primary outline-none transition-colors duration-150 placeholder:text-tertiary focus:border-line-2"
							}), query !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": t("search.clear"),
								onClick: () => setQuery(""),
								className: "absolute right-1.5 cursor-pointer p-0.5 text-[12px] leading-none text-tertiary transition-colors duration-150 hover:text-primary",
								children: "✕"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "inline-flex gap-0.5 rounded-lg bg-surface-2 p-0.5",
							children: AXES.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": axis === id,
								onClick: () => setAxis(id),
								className: `cursor-pointer rounded-md px-[13px] py-1 text-[12.5px] font-medium transition-colors duration-150 ${axis === id ? "bg-surface text-primary shadow-sm" : "text-tertiary hover:text-primary"}`,
								children: t(`axis.${id}`)
							}, id))
						}),
						axis === "plug" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Chips, {
							t,
							dossiers,
							index,
							filter,
							onPick: setFilter,
							userLayers
						})
					]
				}),
				error !== void 0 && !hasData ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
					kind: "error",
					text: t("status.error", { message: error })
				}) : loading && !hasData ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
					kind: "loading",
					text: t("status.loading")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						ref: listRef,
						className: "min-h-0 overflow-y-auto overscroll-contain border-r border-line",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkbenchList, {
							t,
							axis,
							filter,
							query: q,
							rawQuery: query,
							dossiers,
							index,
							layers: layers ?? [],
							files: files ?? [],
							tools,
							inventory,
							models,
							modelsStale: modelsStale === true,
							presets,
							presetsStale: presetsStale === true,
							vendors,
							toggle,
							userLayers,
							selection,
							expand,
							onSelect: select,
							onJump: jump
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
						className: "min-h-0 overflow-y-auto overscroll-contain p-[18px]",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkbenchDetail, {
							ctx,
							t,
							selection,
							query,
							byId,
							index,
							layers: layers ?? [],
							files: files ?? [],
							tools,
							inventory,
							models,
							presets,
							userLayers,
							onSelect: jump
						})
					})]
				}),
				notice !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: `absolute right-4 bottom-4 z-10 flex max-w-[min(560px,70%)] items-start gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[12px] leading-[1.55] shadow-lg ${notice.tone === "err" ? "text-err" : "text-secondary"}`,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "min-w-0 break-all",
						children: [notice.text, notice.tone === "ok" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "text-tertiary",
							children: [" ", t("toggle.restartHint")]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setNotice(void 0),
						className: "shrink-0 cursor-pointer text-[11.5px] text-tertiary transition-colors duration-150 hover:text-primary",
						children: t("toggle.dismiss")
					})]
				})
			] });
		}
		/** 顶栏结论条：先说结果，再给你翻。 */
		function Verdict({ t, dossiers, index, layers, tools, inventory, models, presets }) {
			const all = [...walkDossiers(dossiers)].filter((d) => !d.group);
			const attention = all.filter((d) => isAttention(d, index)).length;
			const t2 = countTools(tools);
			const items = [
				[
					"",
					all.length,
					t("summary.plugins")
				],
				[
					"",
					all.filter((d) => d.state === "active").length,
					t("summary.active")
				],
				[
					"",
					all.filter((d) => d.state === "disabled").length,
					t("summary.disabled")
				],
				[
					attention > 0 ? "text-warn" : "",
					attention,
					t("summary.attention")
				],
				[
					"text-brand-bright",
					all.filter(hasUserOverride).length,
					t("summary.overrides")
				],
				[
					"",
					layers?.length ?? 0,
					t("summary.layers")
				],
				[
					"",
					inventory?.tools.length ?? t2.enabled,
					inventory === void 0 ? t("summary.toolsEnabled") : t("summary.tools")
				],
				...models === void 0 ? [] : [[
					"",
					models.models.length,
					t("summary.models")
				]],
				...presets === void 0 ? [] : [[
					"",
					presets.presets.length,
					t("summary.presets")
				]]
			];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: items.map(([tone, value, label], i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-baseline gap-1.5 text-[13px] text-tertiary",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
					className: `text-[15px] font-semibold tabular-nums ${tone === "" ? "text-primary" : tone}`,
					children: value
				}), label]
			}, i)) });
		}
		function hasUserOverride(d) {
			return d.settings?.user !== void 0;
		}
		/**
		* 这条插件是**谁**关的。分三档，因为你能做的事完全不同：
		*   user    —— 你自己那两层关的，点一下「启用」就能撤；
		*   bundle  —— 某个插件自带的补丁层关的，撤它要在你的层写一行 disabled: false；
		*   runtime —— 配置层里没人关它，是运行时才关的（`!!js` 表达式，或者容器被关了），
		*              这种改配置没用，得去看那个表达式或那个容器。
		* @returns 关它的那一档；这条根本没关就是 undefined。
		*/
		function disabledBy(d, userLayers) {
			if (d.state !== "disabled" && !d.disabled) return void 0;
			const events = d.intent?.events ?? [];
			for (let i = events.length - 1; i >= 0; i -= 1) {
				const e = events[i];
				if (e === void 0 || e.kind !== "disable" && e.kind !== "enable") continue;
				if (e.kind === "enable") return "runtime";
				return userLayers.has(e.layer) ? "user" : "bundle";
			}
			return "runtime";
		}
		/**
		* 配置层已经改了，但这个进程还在按旧配置跑。
		*
		* 补丁层是热加载的，可这一条落没落到运行时由 dsh 说了算。差在这一步的时候，界面既不能
		* 说「已经关了」（它还在跑），也不能什么都不说——那就成了「点了一下没反应」。
		* 判据直接用 host 那份对账（`drift === 'mismatch'`）：`!!js` 表达式与撞名短 id 本来就
		* 被排除在它之外，这里跟着它走，不另立一套判断。
		*/
		function pendingRestart(d) {
			return d.drift === "mismatch" && d.intent !== void 0;
		}
		/**
		* 这一行此刻**算不算关着**——开关按钮给出哪个动作由它决定。
		*
		* 配置与运行时打架时跟**配置**走：你刚点下的那一笔立刻反映在按钮上（再点一下就是撤回），
		* 而不是让按钮停在原地、让人以为没写进去。至于它生效没有，由行尾的「待重启」去说——
		* 生效与否仍然由数据说了算，不由按钮宣布。
		*/
		function configuredOff(d) {
			return pendingRestart(d) ? d.intent?.disabled === true : d.state === "disabled";
		}
		/** 需要人处理：加载失败 / 卡在等待 / 依赖无人提供（内置不算）。 */
		function isAttention(d, index) {
			if (d.state === "failed" || d.state === "pending" || d.state === "loading" || d.state === "unknown") return true;
			if (!index.knowsBuiltin) return false;
			return d.requires.some((r) => r.providers.length === 0 && index.serviceOf.get(r.service)?.builtin !== true);
		}
		function Chips({ t, dossiers, index, filter, onPick, userLayers }) {
			const everyone = [...walkDossiers(dossiers)];
			const all = everyone.filter((d) => !d.group);
			const counts = {
				all: all.length,
				attention: all.filter((d) => isAttention(d, index)).length,
				overridden: all.filter(hasUserOverride).length,
				disabled: all.filter((d) => d.state === "disabled").length,
				runtime: all.filter((d) => d.drift === "extra").length,
				foreign: all.filter((d) => isForeign(vendorOf(d))).length,
				userdisabled: everyone.filter((d) => disabledBy(d, userLayers) === "user").length,
				bundledisabled: everyone.filter((d) => disabledBy(d, userLayers) === "bundle").length,
				runtimedisabled: everyone.filter((d) => disabledBy(d, userLayers) === "runtime").length
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "flex flex-wrap gap-1.5",
				children: [
					"all",
					"attention",
					"runtime",
					"foreign",
					"disabled",
					"bundledisabled",
					"runtimedisabled",
					"overridden",
					"userdisabled"
				].map((id) => {
					if (counts[id] === 0 && id !== "all" && filter !== id) return null;
					const on = filter === id;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": on,
						onClick: () => onPick(id),
						className: `inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[12.5px] transition-colors duration-150 ${on ? "border-brand bg-brand text-surface" : "border-line text-secondary hover:bg-hover"}`,
						children: [t(`filter.${id}`), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: `tabular-nums ${on ? "opacity-60" : "text-tertiary"}`,
							children: counts[id]
						})]
					}, id);
				})
			});
		}
		//#endregion
		//#region src/client/components/InsightSection.tsx
		/**
		* 设置页的 Insight 区。
		*
		* 只做两件事：给结论（556px 摘要卡），和开工作台（全屏模态）。
		* 分工的理由见 SummaryCard 与 Workbench 的头注释——一句话是：
		* 设置页只有 556px，主从布局在这个宽度里放不下一个包名，所以过程要另开一块屏幕。
		*
		* 数据也跟着分：摘要走独立的 insight/summary 端点（host 算完只发一小把数字），
		* 打开工作台才拉全量四源。设置页不该为了显示几个数字去拉 174 个节点的树。
		*
		* 版本错位：客户端 bundle 随页面刷新就更新，host 是长驻进程要重启才更新。
		* 改完没重启时，新前端会去调 host 还不认识的端点。这是开发循环里的常态，
		* 不该让面板整块变红——summary 端点缺席就退回用四个老端点在客户端算同一份摘要
		* （buildSummary 本来就是 shared 纯函数），并明说一句「host 比前端旧」。
		*/
		function InsightSection({ ctx, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const summary = useRpc(ctx, "insight/summary", true);
			const stale = !summary.loading && summary.error !== void 0;
			const sources = useInsightSources(ctx, open || stale);
			const effective = (0, react.useMemo)(() => {
				if (summary.data !== void 0) return summary.data;
				if (!stale) return void 0;
				if (sources.tree === void 0 || sources.graph === void 0 || sources.settings === void 0 || sources.layers === void 0) return void 0;
				return buildSummary(sources.tree, sources.graph, sources.settings, sources.layers, sources.final);
			}, [
				summary.data,
				stale,
				sources.tree,
				sources.graph,
				sources.settings,
				sources.layers,
				sources.final
			]);
			const reloadAll = () => {
				summary.reload();
				sources.reload();
			};
			const fatal = stale && effective === void 0 && !sources.loading && sources.error !== void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				summary.loading && effective === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
					kind: "loading",
					text: t("status.loading")
				}),
				fatal && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PanelStatus, {
					kind: "error",
					text: t("status.error", { message: summary.error ?? "" })
				}),
				effective !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SummaryCard, {
					t,
					summary: effective,
					stale,
					onOpen: () => setOpen(true),
					action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RestartRow, {
						ctx,
						t
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(InspectorRow, { t }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Workbench, {
					ctx,
					t,
					open,
					onClose: () => setOpen(false),
					tree: sources.tree,
					graph: sources.graph,
					final: sources.final,
					settings: sources.settings,
					layers: sources.layers,
					files: sources.files,
					inventory: sources.inventory,
					models: sources.models,
					modelsStale: sources.modelsStale,
					presets: sources.presets,
					presetsStale: sources.presetsStale,
					loading: sources.loading,
					error: sources.error,
					onReload: reloadAll
				})
			] });
		}
		//#endregion
		//#region src/client/inspector/attribute.ts
		/**
		* UI 归因：从一个 DOM 元素反查「这块界面是哪个插件插进来的」。
		*
		* 两条信息源，一条不用 hack、一条要读 React 私有字段：
		*
		*   1. `[data-slot]` 锚点——ui-renderer 给每个 slot 出口包了一层
		*      `<div data-slot="<key>" style="display:contents">`（不参与布局，纯粹是
		*      可寻址的锚点）。DOM 里现成的，一句 closest() 就有。但它只说「在哪个
		*      slot 里」：list / keyed slot 里挤着好几个插件的 entry，光靠它分不出
		*      命中的是哪一个。
		*
		*   2. React fiber——每个 entry 外面有 RootEntry / SessionEntry /
		*      SlotErrorBoundary 这几层包装，它们的 props 带着那条 slot 注册记录
		*      （StoredEntry）。从命中元素沿 fiber.return 往上收一遍，就得到一条
		*      「当前 → 根」的归因链，精确到 entry。代价是读 `__reactFiber$*`——
		*      React 没承诺过这个字段（DevTools 也是这么读的），所以读不到时退回
		*      第 1 条，只给 slot 名。
		*
		* 注册者名字（entry.registrant）在生产构建里往往是压缩后的类名（实测是
		* `Z8` 这种），明文包名靠 probe.ts 的记账补上——见那边的头注释与它的边界。
		*
		* 这个模块只做纯遍历：不 import React，不碰组件，输入是「像 fiber 的对象」，
		* 于是可以拿手写的假链条单测。
		*/
		/** fiber 上挂在 DOM 节点的键前缀（React 18/19 都是这个形状）。 */
		const FIBER_KEY_PREFIX = "__reactFiber$";
		/** 往上爬的层数上限：够深（实测一条真链 26 层），又不至于在异常环里转死。 */
		const MAX_DEPTH = 2e3;
		function str(value) {
			return typeof value === "string" && value !== "" ? value : void 0;
		}
		function isEntry(value) {
			return typeof value === "object" && value !== null && "component" in value;
		}
		/** 这个宿主节点是不是一个 slot 出口锚点。鸭子类型判断，测试里可以拿假对象喂。 */
		function anchorOf(node) {
			if (typeof node !== "object" || node === null) return void 0;
			const el = node;
			return typeof el.hasAttribute === "function" && el.hasAttribute("data-slot") ? el : void 0;
		}
		/** 取挂在 DOM 节点上的 fiber。节点没被 React 管、或字段改名了都返回 undefined。 */
		function fiberOf(node) {
			for (const key of Object.keys(node)) if (key.startsWith(FIBER_KEY_PREFIX)) {
				const value = node[key];
				if (typeof value === "object" && value !== null) return value;
			}
		}
		/**
		* 沿 fiber.return 收集归因链。
		*
		* 同一条 entry 会在好几层上重复出现（SessionEntry 与它外面的
		* StrictSessionEntry 拿的是同一个 entry 对象），所以按 entry 对象引用去重，
		* 保留最深那一次——那一层的 slotKey 才是它真正被注册进去的 slot。
		*/
		function framesFromFiber(start, lookup) {
			const frames = [];
			const seen = /* @__PURE__ */ new Set();
			let pending = [];
			let fiber = start;
			for (let depth = 0; fiber !== void 0 && fiber !== null && depth < MAX_DEPTH; depth++) {
				const props = fiber.memoizedProps;
				if (props !== void 0 && props !== null) {
					const entry = props["entry"];
					if (isEntry(entry) && !seen.has(entry)) {
						seen.add(entry);
						const frame = {
							slotKey: str(props["slotKey"]),
							entryKey: str(entry.options?.key),
							entryId: str(entry.options?.id),
							registrant: str(entry.registrant),
							pkg: lookup?.(entry)
						};
						frames.push(frame);
						pending.push(frame);
					}
				}
				const anchor = anchorOf(fiber.stateNode);
				if (anchor !== void 0 && pending.length > 0) {
					for (const frame of pending) frame.anchor = anchor;
					pending = [];
				}
				fiber = fiber.return ?? void 0;
			}
			return frames;
		}
		/**
		* 归因一个 DOM 元素。
		*
		* fiber 从元素自己身上取不到是常态（文本节点的父元素、伪元素命中等），所以
		* 沿 parentElement 往上试几层；实在拿不到就只给 `[data-slot]` 锚点名。
		*/
		function attribute(el, lookup) {
			let at = el;
			let fiber;
			for (let hop = 0; at !== null && fiber === void 0 && hop < 8; hop++) {
				fiber = fiberOf(at);
				if (fiber === void 0) at = at.parentElement;
			}
			const anchor = el.closest("[data-slot]");
			const anchorSlot = anchor === null ? void 0 : str(anchor.getAttribute("data-slot"));
			return {
				frames: framesFromFiber(fiber, lookup),
				anchorSlot
			};
		}
		/**
		* 归因链里第一个能给出明文包名的层。
		*
		* 为什么不是直接取第 0 层：最贴近鼠标的那条 entry 可能是我们记不到账的
		* （比我们早加载），而它外面那层往往记得到。跳转要的是「一个能落到插件轴上
		* 的包」，所以取最内层的**有名**归因，拿不到就返回 undefined，让上层照实
		* 显示未知，而不是拿压缩名去插件轴里瞎猜。
		*/
		function ownerOf(frames) {
			return frames.find((f) => f.pkg !== void 0);
		}
		//#endregion
		//#region src/client/inspector/probe.ts
		/**
		* 注册者记账：给 slot 注册记录补上明文包名。
		*
		* ## 为什么需要它
		*
		* ui-renderer 记下的 registrant 是 `options.registrant ?? ctx.fiber.name`，
		* 而 cordis 的 fiber 名来自插件模块的 `name` 导出——没写的退回函数名，生产
		* 构建里被压成 `Z8` 这种，认不出是哪个包。
		*
		* 更要紧的是**压缩名在包之间会撞车**：在跑着的 web 客户端上枚举
		* `ctx.get('loader').entries()`（58 个 client 插件），`dsh-api-gateway`、
		* `dsh-client-ui-open-in-app`、`dsh-api-workspace-files`、`dsh-client-modules`
		* 的 fiber 名全都是 `Z8`。所以 registrant 只能当线索，反查包名这条路是死的——
		* 明文包名必须在注册发生的那一刻、从调用方身上取。
		*
		* ## 怎么补
		*
		* cordis 服务方法里的 `this.ctx` 指向**调用方**插件（服务是 caller-traced 的），
		* 而 loader 给插件 fiber 挂了它自己的 entry，`entry.options.name` 就是明文的
		* 模块说明符——也就是包名，与浏览器 boot 表里的 id 一致（实测 58 个 client
		* 插件里 57 个能按这个名字在 host 插件树里找到对应节点）。
		*
		* 所以：在 slots 服务原型的 `register` 外面包一层，注册发生时把
		* 「StoredEntry → 包名」记进 WeakMap。
		*
		* ## 这是「插件从外面伸手」，不是改核心
		*
		* 补丁只存在于内存里的那个原型对象上：包一层、转调原方法、dispose 时按栈
		* 还原。dsh 的任何文件、产物、配置都不动。原方法的行为不被改变——记账在它
		* 返回之后做，并且整段包在 try/catch 里：记账失败只是少一条账，绝不能让别人
		* 的注册失败。
		*
		* ## 边界（必须说清楚，否则会被当成完整归因用）
		*
		*   - **只记得到装上补丁之后的注册。** 比我们早加载的插件（boot 表里
		*     `immediately` 的那批）记不到账，归因链上那几层就只有 slot 名和压缩的
		*     registrant，包名显示为「未知」——照实说，不拿压缩名去猜。
		*   - 补丁幂等：同一个原型只包一层。
		*   - 还原之后已经记下的账继续有效（键是 entry 对象本身，插件卸载时跟着
		*     一起被回收）。
		*/
		/** entry / 组件 → 明文包名。键是别人的对象，用 WeakMap 不留生命周期。 */
		const LEDGER = /* @__PURE__ */ new WeakMap();
		/** 幂等标记：打在被包过的原型上。 */
		const PATCHED = Symbol.for("dsh-insight.inspector.registrant-probe");
		function pkgOfCaller(self) {
			const name = self.ctx?.fiber?.entry?.options?.name;
			return typeof name === "string" && name !== "" ? name : void 0;
		}
		/**
		* 把刚注册进去的那条 StoredEntry 找出来记账。
		*
		* register 的返回值只有 disposer，拿不到 StoredEntry 本身，所以注册完再从
		* `entries(slotKey)` 里按组件引用倒着找——同一个组件重复注册时，最后一条就是
		* 刚加进去的那条。找不到（服务没有 entries、或 key 不可读）就退一步，只按
		* 组件引用记账。
		*/
		function record(self, options, component, pkg) {
			if (typeof component === "function" || typeof component === "object" && component !== null) LEDGER.set(component, pkg);
			const slotKey = typeof options === "object" && options !== null ? options.name : void 0;
			if (typeof slotKey !== "string" || typeof self.entries !== "function") return;
			const list = self.entries(slotKey);
			for (let i = list.length - 1; i >= 0; i--) {
				const entry = list[i];
				if (typeof entry === "object" && entry !== null && entry.component === component) {
					LEDGER.set(entry, pkg);
					return;
				}
			}
		}
		/**
		* 装上记账补丁。
		* @param slots - `ctx.get('slots')` 拿到的服务实例（补丁打在它的原型上，
		*   于是对所有调用方生效——这正是目的：我们要记的是**别人**的注册）。
		* @returns 还原函数（幂等；已经被别人包过时返回一个空操作）。
		*/
		function installRegistrantProbe(slots) {
			const proto = Object.getPrototypeOf(slots);
			if (proto === null || typeof proto.register !== "function") return () => {};
			if (proto[PATCHED] === true) return () => {};
			const original = proto.register;
			function patched(...args) {
				const result = original.apply(this, args);
				try {
					const pkg = pkgOfCaller(this);
					if (pkg !== void 0) record(this, args[0], args[1], pkg);
				} catch {}
				return result;
			}
			Object.defineProperty(proto, "register", {
				value: patched,
				writable: true,
				configurable: true
			});
			Object.defineProperty(proto, PATCHED, {
				value: true,
				writable: true,
				configurable: true
			});
			let restored = false;
			return () => {
				if (restored) return;
				restored = true;
				if (proto.register === patched) Object.defineProperty(proto, "register", {
					value: original,
					writable: true,
					configurable: true
				});
				Object.defineProperty(proto, PATCHED, {
					value: false,
					writable: true,
					configurable: true
				});
			};
		}
		/** 查一条 StoredEntry 的明文包名：先按 entry 自己，再退到它的组件引用。 */
		function pkgOfEntry(entry) {
			const direct = LEDGER.get(entry);
			if (direct !== void 0) return direct;
			const component = entry.component;
			if (typeof component === "function" || typeof component === "object" && component !== null) return LEDGER.get(component);
		}
		//#endregion
		//#region src/client/inspector/useInspector.ts
		/**
		* Inspector 的交互内核：按住修饰键 → 悬停归因 → 点击选中 / 右键出层级菜单。
		*
		* 按住修饰键的那几秒里，浮层**接管全部指针事件**（`pointer-events: auto` 铺满
		* 视口），页面收不到任何鼠标事件——这是 Chrome DevTools 选取模式的同一招，
		* 也是唯一能同时挡住三类干扰的办法：
		*   点击的副作用  「按住 Option 点一下」在这个页面里可能是发消息、切会话、
		*                 删附件，必须在它发生之前截住；
		*   JS 的 hover   宿主的 tooltip 挂在 mouseenter 上，光拦 click 挡不住；
		*   CSS 的 :hover 按钮变色、浮出更多控件——这类根本没有事件可拦，只有让底下
		*                 的元素不再是 :hover 的目标才治得了。
		* 事件仍装在 window 的捕获阶段兜一道（接管切换有一帧的缝），命中测试因此不能
		* 用 elementFromPoint（会命中浮层自己），改用 elementsFromPoint 取第一个不属于
		* 浮层的元素。松开修饰键，接管立刻撤掉，页面一切照旧。
		*
		* 高亮画两层：命中的那个元素（你指的那一小块），外加它所属 entry 的**地盘**
		* ——那个 slot 锚点下所有子元素的包围盒。锚点自己是 `display: contents`，
		* getBoundingClientRect 恒为 0，所以地盘只能靠孩子们的并集算。
		*/
		/** 浮层根节点带这个属性：命中测试要跳过它，才能问到它底下是什么。 */
		const INSPECTOR_ATTR = "data-dsh-inspector";
		/**
		* 浮层里**真正可交互**的部分（只有层级菜单）带这个属性。
		*
		* 为什么要跟 INSPECTOR_ATTR 分开：按住修饰键时浮层接管了指针，于是**每一个**
		* 真实鼠标事件的 target 都是浮层根节点。如果按「是不是我们的元素」来放行，
		* 就等于把按住期间的所有事件全放过去——右键弹不出层级菜单、左键也不跳转
		* （这个坑踩过一次：合成事件的 target 是页面元素，测不出来）。
		* 判据必须是「落在菜单里吗」：遮罩、高亮框、提示牌一律当透明的看。
		*/
		const INSPECTOR_UI_ATTR = "data-dsh-inspector-ui";
		/**
		* 空标记列表的**唯一**实例。
		*
		* 每次都 `setForeign([])` 会喂给 React 一个新引用，于是「清空」也算一次状态变化。
		* 调用方要是每次渲染都传一个新的 prefs 对象（合理的写法），effect 就会重跑、又清
		* 一次、又渲染一次——转成死循环，实测能把 Node 的堆吃光。下面的依赖也因此按**值**
		* 比较修饰键，不按数组引用。
		*/
		const NO_MARKS = [];
		/** 按住期间一并截住的原始鼠标事件（click / contextmenu 另有各自的处理）。 */
		const RAW_MOUSE_EVENTS = [
			"mousedown",
			"mouseup",
			"dblclick",
			"auxclick",
			"pointerdown",
			"pointerup"
		];
		function boxOf(rect) {
			return {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height
			};
		}
		/** 一个 display:contents 锚点的地盘：它所有孩子的包围盒并集。 */
		function territoryOf(anchor) {
			if (anchor === null) return void 0;
			let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
			for (let i = 0; i < anchor.children.length; i++) {
				const r = anchor.children[i].getBoundingClientRect();
				if (r.width === 0 && r.height === 0) continue;
				top = Math.min(top, r.top);
				left = Math.min(left, r.left);
				right = Math.max(right, r.right);
				bottom = Math.max(bottom, r.bottom);
			}
			if (top === Infinity) return void 0;
			return {
				top,
				left,
				width: right - left,
				height: bottom - top
			};
		}
		/** 命中测试用：这个节点属于浮层（要跳过，去看它底下）。 */
		function isOurs(node) {
			return node instanceof Element && node.closest(`[data-dsh-inspector]`) !== null;
		}
		/** 事件放行用：这一下落在层级菜单上（交给菜单自己处理，别拦）。 */
		function isMenuUI(node) {
			return node instanceof Element && node.closest(`[data-dsh-inspector-ui]`) !== null;
		}
		/**
		* 进入探索模式时，把鼠标底下那些元素的 hover **卸掉**。
		*
		* 为什么需要这一步：浏览器只在指针移动时重做命中测试。如果鼠标已经悬停在某个
		* 按钮上、然后才按下修饰键，浮层虽然接管了指针，那个按钮却收不到任何离开事件
		* ——宿主挂在 mouseleave 上的 tooltip 就一直挂在屏幕上（正是「按住热键还能 hover
		* 出『在本地打开』」那个毛病）。所以按下的那一刻主动补一轮离开事件。
		*
		* 只补 JS 的那一半：CSS `:hover` 由浏览器自己维护，派发合成事件动不了它，得等
		* 指针真的动一下。那部分只是变色，不会弹出东西挡住视线，可以接受。
		*/
		function shedHover(x, y) {
			const stack = document.elementsFromPoint(x, y);
			for (const el of stack) {
				if (isOurs(el)) continue;
				el.dispatchEvent(new MouseEvent("mouseout", {
					bubbles: true,
					relatedTarget: null
				}));
				el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
				el.dispatchEvent(new PointerEvent("pointerout", { bubbles: true }));
				el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false }));
			}
		}
		/**
		* 命中测试：视口坐标 → 归因结果。
		*
		* 按住时浮层接管了指针，elementFromPoint 只会返回浮层自己，所以取整条命中栈里
		* 第一个不属于浮层的元素。
		*/
		function probeAt(x, y) {
			const stack = document.elementsFromPoint(x, y);
			let el;
			for (const candidate of stack) if (!isOurs(candidate)) {
				el = candidate;
				break;
			}
			if (el === void 0) return void 0;
			const result = attribute(el, pkgOfEntry);
			const anchor = el.closest("[data-slot]");
			const hit = {
				box: boxOf(el.getBoundingClientRect()),
				pointer: {
					x,
					y
				},
				frames: result.frames
			};
			const territory = territoryOf(anchor);
			if (territory !== void 0) hit.territory = territory;
			if (result.anchorSlot !== void 0) hit.anchorSlot = result.anchorSlot;
			return hit;
		}
		/** 这个框在视口里露出来了吗（屏外的不用画，也不用算）。 */
		function onScreen(r) {
			return r.width >= 1 && r.height >= 1 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
		}
		/** 画上去了也看不见的：自己藏起来了。 */
		function isHiddenBySelf(el) {
			const style = getComputedStyle(el);
			return style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0;
		}
		/**
		* 这块地方是不是**整块**被别的东西盖住了。
		*
		* 光看 getBoundingClientRect 不够：设置面板背后的元素、滚出了滚动容器可视区的
		* 行，坐标都还在视口里，画个框上去就是凭空一个框。所以在框里取五个采样点做命中
		* 测试——只要有一点命中的是自己或自己的后代，就算露着（部分露出也画，那是对的）。
		*
		* 命中栈要跳过我们自己的浮层：按住修饰键时它接管着指针，栈顶永远是它。
		*/
		function isOccluded(el, r) {
			const points = [
				[r.left + r.width / 2, r.top + r.height / 2],
				[r.left + 2, r.top + 2],
				[r.right - 2, r.top + 2],
				[r.left + 2, r.bottom - 2],
				[r.right - 2, r.bottom - 2]
			];
			for (const [x, y] of points) {
				if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
				for (const candidate of document.elementsFromPoint(x, y)) {
					if (isOurs(candidate)) continue;
					if (candidate === el || el.contains(candidate)) return false;
					break;
				}
			}
			return true;
		}
		/**
		* 整屏扫一遍非官方插入。
		*
		* 走的是每个 `[data-slot]` 锚点的**直接子元素**：那一层就是「这个出口里此刻装
		* 着谁」的边界，从它往上收一次归因，第 0 层就是占着这个格子的 entry。
		*
		* 一个子元素一个框，**不做并集**：曾经按「包名 + 出口 + 格子」把同一条 entry 的
		* 兄弟节点合成一个框，结果一条 entry 铺在每条消息左侧的图标列上时，并集出来是一
		* 根贯穿全屏的竖线——看着像「这一整段都是第三方的」，正好是这个功能最不该给出的
		* 误导。宁可多几个小框。
		*
		* 只标**这一屏真的看得见的**：屏外的、自己藏起来的、被别的东西整块盖住的
		* （设置面板背后那些、滚出滚动容器的行）都不画——否则满屏是凭空的框。
		*
		* 判据由调用方给（insight 的 vendor.ts 那份，靠磁盘路径与 npm scope，不靠名单），
		* 这个模块因此不必知道什么叫「官方」。
		*/
		function scanForeign(isForeignPkg) {
			const marks = /* @__PURE__ */ new Map();
			const anchors = document.querySelectorAll("[data-slot]");
			for (let a = 0; a < anchors.length; a++) {
				const anchor = anchors[a];
				if (isOurs(anchor)) continue;
				for (let c = 0; c < anchor.children.length; c++) {
					const child = anchor.children[c];
					const rect = child.getBoundingClientRect();
					if (!onScreen(rect)) continue;
					const own = framesFromFiber(fiberOf(child), pkgOfEntry)[0];
					if (own?.pkg === void 0 || !isForeignPkg(own.pkg)) continue;
					if (isHiddenBySelf(child) || isOccluded(child, rect)) continue;
					const box = boxOf(rect);
					const key = `${own.pkg}|${own.slotKey ?? ""}|${box.top},${box.left},${box.width},${box.height}`;
					if (marks.has(key)) continue;
					const mark = {
						pkg: own.pkg,
						box
					};
					if (own.slotKey !== void 0) mark.slotKey = own.slotKey;
					marks.set(key, mark);
				}
			}
			return [...marks.values()];
		}
		function useInspector({ prefs, onPick, isForeignPkg }) {
			const [armed, setArmed] = (0, react.useState)(false);
			const [foreign, setForeign] = (0, react.useState)(NO_MARKS);
			const [hit, setHit] = (0, react.useState)();
			const [menu, setMenu] = (0, react.useState)();
			const pointer = (0, react.useRef)({
				x: 0,
				y: 0
			});
			const frame = (0, react.useRef)(void 0);
			const state = (0, react.useRef)({
				prefs,
				armed: false,
				menuOpen: false,
				onPick,
				isForeignPkg
			});
			state.current = {
				prefs,
				armed,
				menuOpen: menu !== void 0,
				onPick,
				isForeignPkg
			};
			const closeMenu = (0, react.useCallback)(() => setMenu(void 0), []);
			const pickFrame = (0, react.useCallback)((picked) => {
				const at = state.current.menuOpen ? menu : hit;
				if (at !== void 0) state.current.onPick(picked, at);
				setMenu(void 0);
			}, [hit, menu]);
			(0, react.useEffect)(() => {
				if (!prefs.enabled) {
					setArmed(false);
					setHit(void 0);
					setMenu(void 0);
					setForeign(NO_MARKS);
					return;
				}
				/** 非官方标记只在按住时算：布局可能刚变过，所以每次进入都重扫。 */
				const remark = () => {
					const judge = state.current.isForeignPkg;
					const marks = judge === void 0 ? NO_MARKS : scanForeign(judge);
					setForeign(marks.length === 0 ? NO_MARKS : marks);
				};
				/** 合并到下一帧再做命中测试：mousemove 一秒能来上百次。 */
				const schedule = () => {
					if (frame.current !== void 0) return;
					frame.current = requestAnimationFrame(() => {
						frame.current = void 0;
						if (!state.current.armed || state.current.menuOpen) return;
						setHit(probeAt(pointer.current.x, pointer.current.y));
					});
				};
				const sync = (event) => {
					const next = matchesModifiers(event, state.current.prefs.modifiers);
					if (state.current.menuOpen) return;
					const entering = next && !state.current.armed;
					setArmed(next);
					if (!next) {
						setHit(void 0);
						setForeign(NO_MARKS);
					} else {
						if (entering) {
							shedHover(pointer.current.x, pointer.current.y);
							remark();
						}
						schedule();
					}
				};
				const onMove = (event) => {
					pointer.current = {
						x: event.clientX,
						y: event.clientY
					};
					sync(event);
					if (state.current.armed) schedule();
				};
				const onKey = (event) => {
					if (event.key === "Escape" && state.current.menuOpen) {
						setMenu(void 0);
						setArmed(false);
						setHit(void 0);
						return;
					}
					sync(event);
				};
				const onClick = (event) => {
					if (isMenuUI(event.target)) return;
					if (state.current.menuOpen) {
						event.preventDefault();
						event.stopImmediatePropagation();
						setMenu(void 0);
						setArmed(false);
						setHit(void 0);
						return;
					}
					if (!state.current.armed) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					const current = probeAt(event.clientX, event.clientY);
					if (current === void 0) return;
					const picked = ownerOf(current.frames) ?? current.frames[0];
					if (picked !== void 0) state.current.onPick(picked, current);
					setArmed(false);
					setHit(void 0);
				};
				const onContextMenu = (event) => {
					if (isMenuUI(event.target) || !state.current.armed) return;
					event.preventDefault();
					event.stopImmediatePropagation();
					const current = probeAt(event.clientX, event.clientY);
					if (current === void 0) return;
					const levels = current.frames.map((frame) => {
						const box = territoryOf(frame.anchor ?? null);
						return box === void 0 ? { frame } : {
							frame,
							box
						};
					});
					const next = {
						x: event.clientX,
						y: event.clientY,
						levels
					};
					if (current.anchorSlot !== void 0) next.anchorSlot = current.anchorSlot;
					setMenu(next);
				};
				/**
				* 滚动、改窗口大小之后框就错位了；重算比清掉体验好，但只在按住时算。
				*
				* scroll 装在捕获阶段（滚动事件不冒泡，只能这么听），于是**菜单自己那个列表
				* 在滚**也会走到这里。那正是它该做的事——层级深的时候列表本来就要滚——不能
				* 当成「页面动了」把菜单关掉。
				*/
				const onViewportChange = (event) => {
					if (isMenuUI(event.target)) return;
					if (state.current.menuOpen) {
						setMenu(void 0);
						return;
					}
					if (state.current.armed) {
						schedule();
						remark();
					}
				};
				const onBlur = () => {
					setArmed(false);
					setHit(void 0);
					setMenu(void 0);
					setForeign([]);
				};
				/**
				* 接管切换有一帧的缝，这些事件在缝里仍可能落到页面上（mousedown 会开始
				* 选中文本、按下按钮的 active 态；dblclick 会选词）。按住时一律截住。
				*/
				const onRawMouse = (event) => {
					if (isMenuUI(event.target) || !state.current.armed && !state.current.menuOpen) return;
					event.preventDefault();
					event.stopImmediatePropagation();
				};
				window.addEventListener("mousemove", onMove, true);
				window.addEventListener("keydown", onKey, true);
				window.addEventListener("keyup", onKey, true);
				window.addEventListener("click", onClick, true);
				window.addEventListener("contextmenu", onContextMenu, true);
				for (const name of RAW_MOUSE_EVENTS) window.addEventListener(name, onRawMouse, true);
				window.addEventListener("scroll", onViewportChange, true);
				window.addEventListener("resize", onViewportChange);
				window.addEventListener("blur", onBlur);
				return () => {
					window.removeEventListener("mousemove", onMove, true);
					window.removeEventListener("keydown", onKey, true);
					window.removeEventListener("keyup", onKey, true);
					window.removeEventListener("click", onClick, true);
					window.removeEventListener("contextmenu", onContextMenu, true);
					for (const name of RAW_MOUSE_EVENTS) window.removeEventListener(name, onRawMouse, true);
					window.removeEventListener("scroll", onViewportChange, true);
					window.removeEventListener("resize", onViewportChange);
					window.removeEventListener("blur", onBlur);
					if (frame.current !== void 0) cancelAnimationFrame(frame.current);
					frame.current = void 0;
				};
			}, [prefs.enabled, prefs.modifiers.join(",")]);
			return {
				armed,
				foreign,
				hit,
				menu,
				closeMenu,
				pickFrame
			};
		}
		//#endregion
		//#region src/client/inspector/InspectorOverlay.tsx
		/**
		* Inspector 的浮层：高亮 + 提示条 + 「当前 → 根」层级菜单。
		*
		* 注册进 `shell.overlay`（list slot，root scope）——ui-layout 的注释里明说
		* 「要浮在整个 app 之上就注册这里，它是 additive 的，且在你自己开启
		* pointer-events 之前对点击透明」。
		*
		* 但画面必须 **portal 到 body**：`shell.overlay` 的锚点在 AppFrame 里面，而设置
		* 对话框是 portal 到 body 的——跨 stacking context 时 z-index 不参与比较，于是
		* 设置面板打开后高亮框和提示牌会被整块盖住，只从面板边缘露出一点，看着就像
		* 「在查面板背后的东西」（归因其实是对的，只是看不见）。portal 到 body 之后
		* 我们是 body 的最后一个孩子，才真的浮在所有东西之上。工作台也是这么做的。
		*
		* 指针接管是按需的：没按修饰键时 `pointer-events: none`，页面完全照常用；
		* 按住的那几秒（或菜单开着时）改成 auto 铺满视口，页面收不到任何鼠标事件——
		* 这样连宿主的 tooltip 和 CSS `:hover` 一起挡掉（理由见 useInspector 的头注释）。
		* 十字准星也因此设在浮层自己身上，不必去改 document.body 的行内样式。
		*
		* 视觉分三层：
		*   非官方（琥珀框）按住的那一刻整屏扫一遍，把三方与本地插件插进来的界面全标出来。
		*   地盘（蓝虚线框）鼠标所指那条 entry 的整块范围——看得出这个插件占多大。
		*   命中（蓝实线框）鼠标正指的那个元素。
		* 菜单开着时地盘框改成跟着菜单项走：滑到哪一层，背后就框出那一层管的地方。
		*
		* 两种颜色都来自房子的 token，不新引色板：选取用 brand-bright（蓝），非官方用
		* warn（琥珀）。这两件事必须一眼分得开——一个是「你正指着这个」，另一个是
		* 「这一屏里这些不是 dsh 自带的」，混成同色就白标了。
		*
		* 定位一律用 `left: 0` + `translate()` 里的 clamp：`100%` 在 transform 的
		* 百分比里指**自身宽度**，于是「贴着目标、又不越出视口」纯 CSS 就能夹住，
		* 不用先量一遍宽度（量就要多渲染一帧，牌子会闪一下）。
		*/
		/** 视口边距：牌子与菜单都不贴边。 */
		const GUTTER = 8;
		/**
		* 两种「范围框」的**唯一**形状：2px 虚线 + 同一个圆角，谁都不许自己改。
		*
		* 地盘框（蓝）和非官方框（琥珀）说的是同一类事——「这一块地方归谁」，只有归谁
		* 不同。所以形状必须一模一样、差别只在颜色：一旦线宽或线型也跟着变，读的人会
		* 以为那是两种不同性质的东西。
		*
		* 线宽跟命中框（实线）取齐：细一档在虚线上会退成"若有若无"的灰线，尤其琥珀在
		* 浅色底上。虚实之别已经足够区分「这一片归谁」和「你正指着这个」，不需要再靠
		* 粗细多说一遍。
		*/
		const OUTLINE = "rounded-sm border-2 border-dashed";
		function boxStyle(box) {
			return {
				top: box.top,
				left: box.left,
				width: box.width,
				height: box.height
			};
		}
		/**
		* 贴着目标放，但夹在视口里。
		*
		* `100%` 在 transform 的百分比里指**自身尺寸**，所以「不越出视口」纯 CSS 就能
		* 夹住，不必先量一遍宽高（量就要多渲染一帧，牌子会闪）。`desired` 允许是
		* calc 表达式——上方摆放要减掉自身高度，只有 calc 写得出来。
		*/
		function clamped(desired, axis) {
			return `clamp(${GUTTER}px, ${desired}, calc(${axis === "x" ? "100vw" : "100vh"} - 100% - ${GUTTER}px))`;
		}
		/** 一层归因的两行文本：谁插的 + 插在哪。 */
		function frameLines(t, frame, anchorSlot) {
			const slot = frame?.slotKey ?? anchorSlot;
			const cell = frame?.entryKey ?? frame?.entryId;
			const where = slot === void 0 ? "" : cell === void 0 ? slot : `${slot} · ${cell}`;
			if (frame?.pkg !== void 0) return {
				who: frame.pkg,
				where,
				known: true
			};
			return {
				who: frame?.registrant === void 0 ? t("inspector.unknown") : t("inspector.unknownAs", { name: frame.registrant }),
				where,
				known: false
			};
		}
		function InspectorOverlay({ t, armed, foreign, hit, menu, onPick, canJump }) {
			const capture = armed || menu !== void 0;
			const showHit = menu === void 0 && hit !== void 0;
			return (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				[INSPECTOR_ATTR]: "",
				className: `dsh-insight fixed inset-0 z-[2147483000] ${capture ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"}`,
				children: [
					armed && foreign.map((mark) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: `pointer-events-none absolute ${OUTLINE} border-warn/45`,
						style: boxStyle(mark.box)
					}, `${mark.pkg}|${mark.slotKey ?? ""}|${mark.box.top},${mark.box.left}`)),
					armed && foreign.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-surface-2 px-3 py-1.5 text-[11px] whitespace-nowrap shadow-lg ring-1 ring-line",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "mr-1.5 inline-block size-2.5 rounded-sm border border-dashed border-warn/70 bg-warn/15 align-middle" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "text-secondary",
							children: t("inspector.foreignLegend", { count: foreign.length })
						})]
					}),
					showHit && hit.territory !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: `pointer-events-none absolute ${OUTLINE} border-brand-bright/45`,
						style: boxStyle(hit.territory)
					}),
					showHit && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute rounded-sm border-2 border-brand-bright bg-brand-bright/12",
						style: boxStyle(hit.box)
					}),
					showHit && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HitBadge, {
						t,
						hit
					}),
					menu !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FrameMenu, {
						t,
						menu,
						onPick,
						canJump
					})
				]
			}), document.body);
		}
		/**
		* 命中提示条：贴着**鼠标**放，不贴高亮框。
		*
		* 贴框是最初的做法，但框可能是整条侧栏那么大——牌子于是跑到框底下、离鼠标一
		* 屏远，甚至掉出视口。贴鼠标就永远在视线里、永远离手近。默认放在光标右下，
		* 下方或右侧不够时由 clamp 拉回来（`100%` 是牌子自身尺寸，见 clamped）。
		*/
		function HitBadge({ t, hit }) {
			const { who, where, known } = frameLines(t, hit.frames.find((f) => f.pkg !== void 0) ?? hit.frames[0], hit.anchorSlot);
			const below = `${Math.round(hit.pointer.y) + 18}px`;
			const above = `calc(${Math.round(hit.pointer.y) - 14}px - 100%)`;
			const roomBelow = window.innerHeight - hit.pointer.y > 140;
			const style = {
				left: 0,
				top: 0,
				transform: `translate(${clamped(`${Math.round(hit.pointer.x) + 12}px`, "x")}, ${clamped(roomBelow ? below : above, "y")})`,
				maxWidth: `calc(100vw - 16px)`
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute w-max rounded-lg bg-surface-2 px-3 py-2 shadow-lg ring-1 ring-line",
				style,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: `truncate text-[13px] font-medium ${known ? "text-primary" : "text-warn"}`,
						children: who
					}),
					where !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "truncate font-mono text-[11px] text-tertiary",
						children: where
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mt-1 text-[11px] text-caption",
						children: t("inspector.badgeHint")
					})
				]
			});
		}
		/**
		* 层级菜单：由内向外一层一层，点哪层跳哪层的插件。
		*
		* 滑过某一层时背后框出那一层管的地方——不然「当前 → 根」这五六行长得都差不多，
		* 光看名字分不出哪层对应屏幕上的哪块。
		*/
		function FrameMenu({ t, menu, onPick, canJump }) {
			const [hovered, setHovered] = (0, react.useState)(void 0);
			const style = {
				left: 0,
				top: 0,
				transform: `translate(${clamped(`${Math.round(menu.x)}px`, "x")}, ${clamped(`${Math.round(menu.y)}px`, "y")})`
			};
			const preview = hovered === void 0 ? void 0 : menu.levels[hovered]?.box;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [preview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute rounded-sm border-2 border-brand-bright bg-brand-bright/12",
				style: boxStyle(preview)
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				[INSPECTOR_UI_ATTR]: "",
				className: "pointer-events-auto absolute w-[360px] max-w-[calc(100vw-16px)] overflow-hidden rounded-lg bg-surface-2 shadow-xl ring-1 ring-line",
				style,
				onMouseLeave: () => setHovered(void 0),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "border-b border-line px-3 py-2",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "text-[12px] font-medium text-secondary",
						children: t("inspector.menuTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "text-[11px] text-caption",
						children: t("inspector.menuHint")
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "max-h-[260px] overflow-y-auto py-1",
					children: [menu.levels.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "px-3 py-2 text-[12px] text-tertiary",
						children: menu.anchorSlot === void 0 ? t("inspector.noFrames") : t("inspector.onlyAnchor", { slot: menu.anchorSlot })
					}), menu.levels.map((level, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MenuRow, {
						t,
						level,
						jumpable: level.frame.pkg !== void 0 && canJump(level.frame.pkg),
						onEnter: () => setHovered(i),
						onPick: () => onPick(level.frame)
					}, `${level.frame.slotKey ?? "?"}/${level.frame.entryKey ?? level.frame.entryId ?? i}`))]
				})]
			})] });
		}
		function MenuRow({ t, level, jumpable, onEnter, onPick }) {
			const { who, where, known } = frameLines(t, level.frame, void 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: !jumpable,
				onMouseEnter: onEnter,
				onFocus: onEnter,
				onClick: onPick,
				className: `flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left ${jumpable ? "hover:bg-hover" : "cursor-default"} ${jumpable ? "" : "opacity-70"}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: `w-full truncate text-[12px] ${known ? "text-primary" : "text-warn"}`,
						children: who
					}),
					where !== "" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "w-full truncate font-mono text-[11px] text-tertiary",
						children: where
					}),
					known && !jumpable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "text-[11px] text-caption",
						children: t("inspector.notInTree")
					})
				]
			});
		}
		//#endregion
		//#region src/client/inspector/pkgIndex.ts
		const DEAD = /* @__PURE__ */ new Set(["disposed", "failed"]);
		function buildPkgIndex(tree) {
			const best = /* @__PURE__ */ new Map();
			const walk = (nodes) => {
				for (const node of nodes) {
					if (node.name !== "") {
						const held = best.get(node.name);
						if (held === void 0 || DEAD.has(held.state) && !DEAD.has(node.state)) best.set(node.name, node);
					}
					walk(node.children);
				}
			};
			walk(tree ?? []);
			return { idOf(pkg) {
				if (pkg === void 0) return void 0;
				return best.get(pkg)?.id;
			} };
		}
		//#endregion
		//#region src/client/inspector/InspectorHost.tsx
		/**
		* Inspector 的宿主：把「按住修饰键指界面」和「洞察工作台」接起来。
		*
		* 这个组件注册在 `shell.overlay` 里，是**常驻**的——所以它必须在关着的时候
		* 几乎不存在：偏好里 enabled 为假时不装任何事件监听（见 useInspector），也不
		* 发一个 RPC。开启之后才拉一份插件树，用来判断归因到的包能不能落到插件轴上
		* （hover 的时候就得知道点了会不会白点）。
		*
		* 工作台开着时 inspector 自己让位：否则按住修饰键在工作台里点什么都会被截住，
		* 而工作台本身也是插件插进来的 UI，指着它归因只会得到「洞察自己」——自指没有
		* 信息量，还挡住了正经操作。
		*/
		function InspectorHost({ ctx, t }) {
			const prefs = useInspectorPrefs();
			const [jumpTo, setJumpTo] = (0, react.useState)();
			const [open, setOpen] = (0, react.useState)(false);
			const tree = useRpc(ctx, "plugins/tree", prefs.enabled);
			const index = (0, react.useMemo)(() => buildPkgIndex(tree.data), [tree.data]);
			const canJump = (0, react.useCallback)((pkg) => index.idOf(pkg) !== void 0, [index]);
			const vendors = (0, react.useMemo)(() => buildVendorIndex(tree.data ?? []), [tree.data]);
			const isForeignPkg = (0, react.useCallback)((pkg) => isForeign(vendors.ofPackage(pkg)), [vendors]);
			const onPick = (0, react.useCallback)((frame) => {
				const id = index.idOf(frame.pkg);
				if (id === void 0) return;
				setJumpTo({
					kind: "plugin",
					id
				});
				setOpen(true);
			}, [index]);
			const { armed, foreign, hit, menu, pickFrame } = useInspector({
				prefs: (0, react.useMemo)(() => open ? {
					...prefs,
					enabled: false
				} : prefs, [open, prefs]),
				onPick,
				isForeignPkg
			});
			const sources = useInsightSources(ctx, open);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(InspectorOverlay, {
				t,
				armed,
				foreign,
				hit,
				menu,
				onPick: pickFrame,
				canJump
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Workbench, {
				ctx,
				t,
				open,
				onClose: () => setOpen(false),
				tree: sources.tree,
				graph: sources.graph,
				final: sources.final,
				settings: sources.settings,
				layers: sources.layers,
				files: sources.files,
				inventory: sources.inventory,
				models: sources.models,
				modelsStale: sources.modelsStale,
				presets: sources.presets,
				presetsStale: sources.presetsStale,
				loading: sources.loading,
				error: sources.error,
				onReload: sources.reload,
				initialJump: jumpTo
			})] });
		}
		//#endregion
		//#region src/client/index.tsx
		const inject = ["slots", "locale"];
		function apply(ctx) {
			installStyles();
			ctx.locale.register(INSIGHT_NS, {
				zh,
				en
			});
			const t = ctx.locale.bind(INSIGHT_NS);
			try {
				const slots = ctx.get("slots");
				if (typeof slots === "object" && slots !== null) ctx.effect(() => installRegistrantProbe(slots), "dsh-insight inspector registrant probe");
			} catch {}
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "insight",
				order: 90,
				label: () => t("section.label"),
				locale: INSIGHT_NS
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InsightSection, {
				ctx,
				t: props.t
			})));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "insight-inspector",
				locale: INSIGHT_NS
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(InspectorHost, {
				ctx,
				t: props.t
			})));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map