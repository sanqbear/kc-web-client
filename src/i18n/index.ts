import { createI18n } from 'vue-i18n'
import ko from './locales/ko'
import en from './locales/en'

export type MessageSchema = typeof ko
export type Locale = 'ko' | 'en'

const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,
  locale: (localStorage.getItem('locale') as Locale) || 'ko',
  fallbackLocale: 'ko',
  messages: {
    ko,
    en,
  },
})

export function setLocale(locale: Locale) {
  ;(i18n.global.locale as unknown as { value: Locale }).value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale
}

export function getLocale(): Locale {
  return (i18n.global.locale as unknown as { value: Locale }).value
}

export default i18n
