/**
 * Date utilities — all times are Asia/Kolkata (IST = UTC+5:30).
 * All timestamps stored in UTC in the database.
 * Convert to IST only for display.
 */

export const IST_TIMEZONE = 'Asia/Kolkata'

/**
 * Get current date and time in IST.
 */
export function nowIST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: IST_TIMEZONE }))
}

/**
 * Format a date for display in Indian format.
 * @example formatDate(new Date()) → "25 Jun 2026"
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TIMEZONE,
    ...options,
  })
}

/**
 * Format a date+time for display.
 * @example formatDateTime(new Date()) → "25 Jun 2026, 11:47 PM"
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TIMEZONE,
  })
}

/**
 * Format time only.
 * @example formatTime(new Date()) → "11:47 PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TIMEZONE,
  })
}

/**
 * Get start of day in IST (midnight IST → UTC).
 */
export function startOfDayIST(date: Date = new Date()): Date {
  const ist = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }))
  ist.setHours(0, 0, 0, 0)
  const offsetMs = date.getTime() - new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE })).getTime()
  return new Date(ist.getTime() + offsetMs)
}

/**
 * Get end of day in IST (23:59:59.999 IST → UTC).
 */
export function endOfDayIST(date: Date = new Date()): Date {
  const ist = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }))
  ist.setHours(23, 59, 59, 999)
  const offsetMs = date.getTime() - new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE })).getTime()
  return new Date(ist.getTime() + offsetMs)
}

/**
 * Check if a date is today (IST).
 */
export function isToday(date: Date): boolean {
  const today = nowIST()
  const check = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }))
  return (
    check.getFullYear() === today.getFullYear() &&
    check.getMonth() === today.getMonth() &&
    check.getDate() === today.getDate()
  )
}

/**
 * Format elapsed time as human-readable string.
 * @example formatElapsed(new Date(Date.now() - 65000)) → "1m 5s ago"
 */
export function formatElapsed(from: Date, to: Date = new Date()): string {
  const seconds = Math.floor((to.getTime() - from.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

/**
 * Parse HH:MM time string to hours and minutes.
 * @example parseTime("14:30") → { hours: 14, minutes: 30 }
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number)
  if (h === undefined || m === undefined || h > 23 || m > 59) {
    throw new Error(`Invalid time format: "${time}". Expected HH:MM.`)
  }
  return { hours: h, minutes: m }
}

/**
 * Check if a time string (HH:MM) is within a range.
 * Handles overnight ranges (e.g., open 22:00 – close 02:00).
 */
export function isWithinTimeRange(
  timeToCheck: string,
  openTime: string,
  closeTime: string,
): boolean {
  const { hours: ch, minutes: cm } = parseTime(timeToCheck)
  const { hours: oh, minutes: om } = parseTime(openTime)
  const { hours: clh, minutes: clm } = parseTime(closeTime)

  const checkMins = ch * 60 + cm
  const openMins = oh * 60 + om
  const closeMins = clh * 60 + clm

  if (openMins <= closeMins) {
    return checkMins >= openMins && checkMins <= closeMins
  }
  // Overnight: e.g. 22:00 to 02:00
  return checkMins >= openMins || checkMins <= closeMins
}
