"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

type Theme = "light" | "dark" | "system";

type UserSettings = {
  working_hours: number;
  timezone: string;
  auto_detect_breaks: boolean;
  enable_notifications: boolean;
  enable_email_notifications: boolean;
  allow_sharing: boolean;
  share_duration_days: number;
  theme: Theme;
};

type DbUserSettings = UserSettings & {
  user_id: number;
  created_at: Date;
  updated_at: Date;
};

export async function getUserSettings(userId: number) {
  try {
    const result = (await sql`
      SELECT 
        working_hours,
        timezone,
        auto_detect_breaks,
        enable_notifications,
        enable_email_notifications,
        allow_sharing,
        share_duration_days,
        theme
      FROM user_settings
      WHERE user_id = ${userId}
    `) as DbUserSettings[];

    if (!result || result.length === 0) {
      const defaultSettings: UserSettings = {
        working_hours: 8,
        timezone: "UTC",
        auto_detect_breaks: true,
        enable_notifications: true,
        enable_email_notifications: false,
        allow_sharing: false,
        share_duration_days: 7,
        theme: "system",
      };

      await sql`
        INSERT INTO user_settings (
          user_id,
          working_hours,
          timezone,
          auto_detect_breaks,
          enable_notifications,
          enable_email_notifications,
          allow_sharing,
          share_duration_days,
          theme
        ) VALUES (
          ${userId},
          ${defaultSettings.working_hours},
          ${defaultSettings.timezone},
          ${defaultSettings.auto_detect_breaks},
          ${defaultSettings.enable_notifications},
          ${defaultSettings.enable_email_notifications},
          ${defaultSettings.allow_sharing},
          ${defaultSettings.share_duration_days},
          ${defaultSettings.theme}
        )
      `;

      return {
        success: true,
        data: defaultSettings,
      };
    }

    const settings: UserSettings = {
      working_hours: result[0].working_hours,
      timezone: result[0].timezone,
      auto_detect_breaks: result[0].auto_detect_breaks,
      enable_notifications: result[0].enable_notifications,
      enable_email_notifications: result[0].enable_email_notifications,
      allow_sharing: result[0].allow_sharing,
      share_duration_days: result[0].share_duration_days,
      theme: result[0].theme as Theme,
    };

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return {
      success: false,
      error: "Failed to fetch user settings",
    };
  }
}

export async function updateUserSettings(
  userId: number,
  settings: Partial<UserSettings>
) {
  try {
    const existingSettings = (await sql`
      SELECT 1 FROM user_settings WHERE user_id = ${userId}
    `) as { "?column?": number }[];

    if (existingSettings.length === 0) {
      const defaultSettings: UserSettings = {
        working_hours: settings.working_hours ?? 8,
        timezone: settings.timezone ?? "UTC",
        auto_detect_breaks: settings.auto_detect_breaks ?? true,
        enable_notifications: settings.enable_notifications ?? true,
        enable_email_notifications:
          settings.enable_email_notifications ?? false,
        allow_sharing: settings.allow_sharing ?? false,
        share_duration_days: settings.share_duration_days ?? 7,
        theme: settings.theme ?? "system",
      };

      await sql`
        INSERT INTO user_settings (
          user_id,
          working_hours,
          timezone,
          auto_detect_breaks,
          enable_notifications,
          enable_email_notifications,
          allow_sharing,
          share_duration_days,
          theme
        ) VALUES (
          ${userId},
          ${defaultSettings.working_hours},
          ${defaultSettings.timezone},
          ${defaultSettings.auto_detect_breaks},
          ${defaultSettings.enable_notifications},
          ${defaultSettings.enable_email_notifications},
          ${defaultSettings.allow_sharing},
          ${defaultSettings.share_duration_days},
          ${defaultSettings.theme}
        )
      `;
    } else {
      let updateQuery = sql`UPDATE user_settings SET `;
      const conditions: any[] = [];

      if (settings.working_hours !== undefined) {
        conditions.push(sql`working_hours = ${settings.working_hours}`);
      }
      if (settings.timezone !== undefined) {
        conditions.push(sql`timezone = ${settings.timezone}`);
      }
      if (settings.auto_detect_breaks !== undefined) {
        conditions.push(
          sql`auto_detect_breaks = ${settings.auto_detect_breaks}`
        );
      }
      if (settings.enable_notifications !== undefined) {
        conditions.push(
          sql`enable_notifications = ${settings.enable_notifications}`
        );
      }
      if (settings.enable_email_notifications !== undefined) {
        conditions.push(
          sql`enable_email_notifications = ${settings.enable_email_notifications}`
        );
      }
      if (settings.allow_sharing !== undefined) {
        conditions.push(sql`allow_sharing = ${settings.allow_sharing}`);
      }
      if (settings.share_duration_days !== undefined) {
        conditions.push(
          sql`share_duration_days = ${settings.share_duration_days}`
        );
      }
      if (settings.theme !== undefined) {
        conditions.push(sql`theme = ${settings.theme}`);
      }

      if (conditions.length > 0) {
        for (let i = 0; i < conditions.length; i++) {
          if (i > 0) {
            updateQuery = sql`${updateQuery}, `;
          }
          updateQuery = sql`${updateQuery}${conditions[i]}`;
        }

        updateQuery = sql`${updateQuery} WHERE user_id = ${userId}`;

        await updateQuery;
      }
    }

    revalidatePath("/settings");

    return {
      success: true,
      data: settings,
    };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return {
      success: false,
      error: "Failed to update user settings",
    };
  }
}
