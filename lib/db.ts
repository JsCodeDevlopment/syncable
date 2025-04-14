import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Function to get the database URL from environment variables
function getDatabaseUrl(): string {
  // Try different environment variables
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL

  if (!url) {
    throw new Error("Database URL not found. Please set DATABASE_URL or POSTGRES_URL in your environment variables.")
  }

  return url
}

// Create a SQL client with error handling
let sqlClient: NeonQueryFunction<any, any>

try {
  const dbUrl = getDatabaseUrl()
  // Set the time zone to Brazil (America/Sao_Paulo) for all database connections
  sqlClient = neon(dbUrl)

  // Initialize the database with the correct time zone
  sqlClient`SET timezone = 'America/Sao_Paulo'`.catch((err) => {
    console.error("Failed to set database timezone:", err)
  })

  console.log("Database connection initialized successfully with Brazil time zone")
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  // Provide a dummy function that throws an error when used
  sqlClient = (() => {
    throw new Error("Database connection failed. Check server logs for details.")
  }) as unknown as NeonQueryFunction<any, any>
}

export const sql = sqlClient

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
