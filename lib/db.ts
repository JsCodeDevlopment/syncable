import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

function getDatabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL

  if (!url) {
    throw new Error("Database URL not found. Please set DATABASE_URL or POSTGRES_URL in your environment variables.")
  }

  return url
}

let sqlClient: NeonQueryFunction<any, any>

try {
  const dbUrl = getDatabaseUrl()
  sqlClient = neon(dbUrl)

  console.log("Database connection initialized successfully")
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  sqlClient = (() => {
    throw new Error("Database connection failed. Check server logs for details.")
  }) as unknown as NeonQueryFunction<any, any>
}

export const sql = sqlClient


export function calculateDuration(startTime: Date, endTime: Date | null): number {
  if (!endTime) return 0
  return endTime.getTime() - startTime.getTime()
}

export function formatTimeForDisplay(date: Date, timeZone: string = "UTC"): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone,
  })
}

export function formatDateForDisplay(date: Date, timeZone: string = "UTC"): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  })
}
