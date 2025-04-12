import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Function to get the database URL from environment variables
function getDatabaseUrl(): string {
  // Try different environment variables
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL;

  if (!url) {
    throw new Error(
      "Database URL not found. Please set DATABASE_URL or POSTGRES_URL in your environment variables."
    );
  }

  return url;
}

// Create a SQL client with error handling
let sqlClient: NeonQueryFunction<any, any>;

try {
  const dbUrl = getDatabaseUrl();
  sqlClient = neon(dbUrl);
  console.log("Database connection initialized successfully");
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  // Provide a dummy function that throws an error when used
  sqlClient = (() => {
    throw new Error(
      "Database connection failed. Check server logs for details."
    );
  }) as unknown as NeonQueryFunction<any, any>;
}

export const sql = sqlClient;

// Helper function to format time in hours and minutes
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

// Helper function to calculate the total duration between two timestamps
export function calculateDuration(
  startTime: Date,
  endTime: Date | null
): number {
  if (!endTime) return 0;
  return endTime.getTime() - startTime.getTime();
}
