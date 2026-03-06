import {en} from './en'
import {zhCn} from './zhCn'
import {cs} from './cs'
import {zhHant} from './zhHant'
import {config} from "../consts";
const ui = {
  en, 'zh-cn': zhCn, 'zh-Hant': zhHant, cs
}
export function useTranslations(lang: keyof typeof ui) {
  const dictionary = ui[lang] as Record<string, string>;
  return function t(key: string) {
    return dictionary[key];
  }
}

export const t = useTranslations(config.lang as keyof typeof ui)
