import { neon } from "@neondatabase/serverless"
import { Pool } from 'pg'

const isDev = process.env.NODE_ENV === 'development'
let pgPool: Pool | null = null

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

export const sql = async (
  strings: TemplateStringsArray,
  ...values: any[]
) => {
  if (isDev) {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: getDatabaseUrl(),
      })
    }

    const client = await pgPool.connect()
    try {
      await client.query(`SET timezone = 'America/Sao_Paulo'`)
      
      console.log("PG Database connection initialized successfully with Brazil time zone")

      // Convert the tagged template to a parameterized query
      const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '')
      const res = await client.query(text, values)
      return res.rows
    } finally {
      client.release()
    }
  } else {
    const neonSql = neon(getDatabaseUrl())

    // Initialize the database with the correct time zone
    neonSql`SET timezone = 'America/Sao_Paulo'`.catch((err) => {
      console.error("Failed to set database timezone:", err)
    })

    console.log("Neon Database connection initialized successfully with Brazil time zone")
    return await neonSql(strings, ...values)
  }
}
