import { sql } from "@/lib/db";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export type SharedReport = {
  id: number;
  user_id: number;
  share_token: string;
  report_type: string;
  start_date: string;
  end_date: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

// List all shared reports for a user
export async function getUserSharedReports(userId: number): Promise<SharedReport[]> {
  const result = (await sql`
    SELECT * FROM shared_reports WHERE user_id = ${userId} ORDER BY created_at DESC
  `) as unknown as SharedReport[];
  return Array.isArray(result) ? result : [];
}

// Delete a shared report by id (only if it belongs to the user)
export async function deleteSharedReport(userId: number, reportId: number) {
  await sql`
    DELETE FROM shared_reports WHERE id = ${reportId} AND user_id = ${userId}
  `;
  revalidatePath("/reports");
  return { success: true };
}

// Get or create a share link for a report
export async function getOrCreateShareLink(userId: number, reportId: number) {
  // Try to get existing token
  const existing = (await sql`
    SELECT share_token FROM shared_reports WHERE id = ${reportId} AND user_id = ${userId}
  `) as unknown as { share_token: string }[];
  if (existing && existing.length > 0 && existing[0].share_token) {
    return { share_token: existing[0].share_token };
  }
  // Generate new token
  const newToken = randomUUID();
  await sql`
    UPDATE shared_reports SET share_token = ${newToken}, updated_at = NOW() WHERE id = ${reportId} AND user_id = ${userId}
  `;
  return { share_token: newToken };
} 