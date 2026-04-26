// Time zone utilities for consistent handling of dates and times
export const DEFAULT_TIMEZONE = "America/Sao_Paulo"
export const DEFAULT_OFFSET = "-03:00"

/**
 * Converts a date to a specific time zone
 */
export function toUserTime(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  return new Date(date.toLocaleString("en-US", { timeZone }))
}

/**
 * Formats a date for display
 */
export function formatDate(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return date.toLocaleDateString("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Alias for backward compatibility
export const formatDateBR = formatDate

/**
 * Formats time for display
 */
export function formatTime(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return date.toLocaleTimeString("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

// Alias for backward compatibility
export const formatTimeBR = formatTime

/**
 * Formats a date string for HTML date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const userDate = toUserTime(date, timeZone)
  const year = userDate.getFullYear()
  const month = String(userDate.getMonth() + 1).padStart(2, "0")
  const day = String(userDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a time string for HTML time input (HH:MM in 24-hour format)
 */
export function formatTimeForInput(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const userDate = toUserTime(date, timeZone)
  const hours = String(userDate.getHours()).padStart(2, "0")
  const minutes = String(userDate.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Creates a Date object from date and time strings in a specific time zone
 * Note: This is tricky with offsets. Better to use the timeZone name if possible, 
 * but standard Date constructor doesn't take timeZone name easily.
 */
export function createZonedDate(dateStr: string, timeStr: string, offset: string = DEFAULT_OFFSET): Date {
  return new Date(`${dateStr}T${timeStr}:00${offset}`)
}

// Alias for backward compatibility
export const createBrazilianDate = createZonedDate

/**
 * Gets the current date and time in a specific time zone
 */
export function getNow(timeZone: string = DEFAULT_TIMEZONE): Date {
  return toUserTime(new Date(), timeZone)
}

// Alias for backward compatibility
export const getNowInBrazil = getNow

/**
 * Checks if two dates are on the same day in a specific time zone
 */
export function isSameDay(date1: Date, date2: Date, timeZone: string = DEFAULT_TIMEZONE): boolean {
  const d1 = toUserTime(date1, timeZone)
  const d2 = toUserTime(date2, timeZone)

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

// Alias for backward compatibility
export const isSameDayBR = isSameDay

/**
 * Gets the start of day for a given date in a specific time zone
 */
export function getStartOfDay(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const userDate = toUserTime(date, timeZone)
  userDate.setHours(0, 0, 0, 0)
  return userDate
}

// Alias for backward compatibility
export const getStartOfDayBR = getStartOfDay

/**
 * Gets the end of day for a given date in a specific time zone
 */
export function getEndOfDay(date: Date, timeZone: string = DEFAULT_TIMEZONE): Date {
  const userDate = toUserTime(date, timeZone)
  userDate.setHours(23, 59, 59, 999)
  return userDate
}

// Alias for backward compatibility
export const getEndOfDayBR = getEndOfDay
