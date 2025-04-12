import { neon } from "@neondatabase/serverless"

// Create a SQL client with the database URL from environment variables
export const sql = neon(process.env.DATABASE_URL!)

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
