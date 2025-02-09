import initTranslations from '@/lib/i18n'
import { cookies } from 'next/headers'

export async function translate(namespaces: string[] | string) {
  if (typeof namespaces === 'string') namespaces = [namespaces]
  const cookieStore = await cookies()
  const locale = cookieStore.get('locale')?.value

  return {
    locale,
    ...await initTranslations(locale, namespaces)
  }
}
