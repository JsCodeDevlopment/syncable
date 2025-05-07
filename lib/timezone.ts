// Time zone utilities for consistent handling of dates and times in Brazilian time zone

// Brazilian time zone identifier
export const BRAZIL_TIMEZONE = "America/Sao_Paulo"

// Time zone offset for Brazil (UTC-3)
export const BRAZIL_TIMEZONE_OFFSET = "-03:00"

/**
 * Converts a date to Brazilian time zone
 */
export function toBrazilianTime(date: Date): Date {
  // Create a new date object with the Brazilian time zone
  return new Date(date.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }))
}

/**
 * Formats a date for display in Brazilian format (DD/MM/YYYY)
 */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Formats time for display in 24-hour format (Brazilian standard)
 */
export function formatTimeBR(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    timeZone: BRAZIL_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Formats a date string for HTML date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  const brazilDate = toBrazilianTime(date)
  const year = brazilDate.getFullYear()
  const month = String(brazilDate.getMonth() + 1).padStart(2, "0")
  const day = String(brazilDate.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Formats a time string for HTML time input (HH:MM in 24-hour format)
 */
export function formatTimeForInput(date: Date): string {
  const brazilDate = toBrazilianTime(date)
  const hours = String(brazilDate.getHours()).padStart(2, "0")
  const minutes = String(brazilDate.getMinutes()).padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * Creates a Date object from date and time strings in Brazilian time zone
 */
export function createBrazilianDate(dateStr: string, timeStr: string): Date {
  // Create a date string with explicit Brazilian time zone offset
  return new Date(`${dateStr}T${timeStr}:00${BRAZIL_TIMEZONE_OFFSET}`)
}

/**
 * Gets the current date and time in Brazilian time zone
 */
export function getNowInBrazil(): Date {
  return toBrazilianTime(new Date())
}

/**
 * Checks if two dates are on the same day in Brazilian time zone
 */
export function isSameDayBR(date1: Date, date2: Date): boolean {
  const d1 = toBrazilianTime(date1)
  const d2 = toBrazilianTime(date2)

  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

/**
 * Gets the start of day for a given date in Brazilian time zone
 */
export function getStartOfDayBR(date: Date): Date {
  const brazilDate = toBrazilianTime(date)
  brazilDate.setHours(0, 0, 0, 0)
  return brazilDate
}

/**
 * Gets the end of day for a given date in Brazilian time zone
 */
export function getEndOfDayBR(date: Date): Date {
  const brazilDate = toBrazilianTime(date)
  brazilDate.setHours(23, 59, 59, 999)
  return brazilDate
}
