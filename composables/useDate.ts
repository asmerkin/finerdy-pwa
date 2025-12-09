import { format, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { es, enUS } from 'date-fns/locale'

const locales: Record<string, Locale> = {
  en: enUS,
  es: es,
}

export function useDate() {
  const auth = useAuthStore()

  const getUserTimezone = () => {
    return auth.user?.timezone || 'UTC'
  }

  const getDateLocale = () => {
    const userLocale = auth.user?.locale || 'en'
    return locales[userLocale] || enUS
  }

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return ''

    // Ensure the date string is treated as UTC by appending 'Z' if it doesn't have timezone info
    let dateStr = date
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+') && !date.includes('-', 10)) {
      dateStr = date + 'Z'
    }

    const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    const timezone = getUserTimezone()
    const locale = getDateLocale()

    return formatInTimeZone(dateObj, timezone, 'dd/MM/yyyy', { locale })
  }

  const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return ''

    // Ensure the date string is treated as UTC by appending 'Z' if it doesn't have timezone info
    let dateStr = date
    if (typeof date === 'string' && !date.endsWith('Z') && !date.includes('+') && !date.includes('-', 10)) {
      dateStr = date + 'Z'
    }

    const dateObj = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    const timezone = getUserTimezone()
    const locale = getDateLocale()

    return formatInTimeZone(dateObj, timezone, 'dd/MM/yyyy HH:mm', { locale })
  }

  const formatRelative = (date: string | Date | null | undefined): string => {
    if (!date) return ''

    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const timezone = getUserTimezone()
    const zonedDate = toZonedTime(dateObj, timezone)
    const locale = getDateLocale()

    return format(zonedDate, 'PPP', { locale })
  }

  return {
    formatDate,
    formatDateTime,
    formatRelative,
    getUserTimezone,
  }
}
