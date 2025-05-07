import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format time in hours and minutes
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`
}

// Helper function to calculate the total duration between two timestamps
export function calculateDuration(startTime: Date, endTime: Date | null): number {
  if (!endTime) return 0
  return endTime.getTime() - startTime.getTime()
}

// Format time with proper 24-hour format for Brazil
export function formatTimeForDisplay(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Sao_Paulo",
  })
}

// Format date for Brazil
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  })
}
