import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Simple query to test the database connection
    const result = await sql`SELECT NOW() as time`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      time: result[0].time,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasPgUrl: !!process.env.POSTGRES_URL,
        hasPgNonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
        hasPgPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      },
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
        env: {
          hasDbUrl: !!process.env.DATABASE_URL,
          hasPgUrl: !!process.env.POSTGRES_URL,
          hasPgNonPoolingUrl: !!process.env.POSTGRES_URL_NON_POOLING,
          hasPgPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
        },
      },
      { status: 500 },
    )
  }
}
