"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { GeneralSettings } from "@/components/settings/general-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SharingSettings } from "@/components/settings/sharing-settings";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import { getUserSettings } from "../actions/user-settings";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    working_hours: number;
    timezone: string;
    auto_detect_breaks: boolean;
    enable_notifications: boolean;
    enable_email_notifications: boolean;
    allow_sharing: boolean;
    share_duration_days: number;
  } | null>(null);

  useEffect(() => {
    // Get user ID from cookie and check authentication
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();

        if (!user) {
          setAuthError("You must be logged in to access settings");
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Load user settings
        const result = await getUserSettings(user.id);

        if (result.success && result.data) {
          setSettings(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load settings",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setAuthError("Failed to load settings. You may need to log in again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (authError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <h1 className="text-2xl font-bold">Syncable</h1>
            </div>
            <CardTitle className="text-2xl font-bold">
              Authentication Error
            </CardTitle>
            <CardDescription>{authError}</CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col space-y-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Go to Login
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading || !settings || !userId) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Settings" text="Loading your settings..." />
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your account settings and preferences"
      />

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sharing">Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings
            userId={userId}
            initialSettings={{
              working_hours: settings.working_hours,
              timezone: settings.timezone,
              auto_detect_breaks: settings.auto_detect_breaks,
            }}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings
            userId={userId}
            initialSettings={{
              enable_notifications: settings.enable_notifications,
              enable_email_notifications: settings.enable_email_notifications,
            }}
          />
        </TabsContent>

        <TabsContent value="sharing">
          <SharingSettings
            userId={userId}
            initialSettings={{
              allow_sharing: settings.allow_sharing,
              share_duration_days: settings.share_duration_days,
            }}
          />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
