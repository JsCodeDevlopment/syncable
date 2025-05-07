"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import { getUserSettings, updateUserSettings } from "../actions/user-settings";

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Time tracking settings
  const [workingHours, setWorkingHours] = useState("8");
  const [timezone, setTimezone] = useState("UTC");
  const [autoBreak, setAutoBreak] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");

  // Sharing settings
  const [shareReports, setShareReports] = useState(false);
  const [shareDuration, setShareDuration] = useState("7");

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
          const settings = result.data;

          // Set time tracking settings
          setWorkingHours(settings.working_hours.toString());
          setTimezone(settings.timezone);
          setAutoBreak(settings.auto_detect_breaks);

          // Set notification settings
          setNotifications(settings.enable_notifications);
          setEmailNotifications(settings.enable_email_notifications);

          // Set sharing settings
          setShareReports(settings.allow_sharing);
          setShareDuration(settings.share_duration_days.toString());
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

  const handleSaveGeneralSettings = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        working_hours: Number.parseInt(workingHours),
        timezone,
        auto_detect_breaks: autoBreak,
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your general settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        enable_notifications: notifications,
        enable_email_notifications: emailNotifications,
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description:
            "Your notification settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSharingSettings = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        allow_sharing: shareReports,
        share_duration_days: Number.parseInt(shareDuration),
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your sharing settings have been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isLoading) {
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

        <TabsContent
          value="general"
          className="flex flex-col items-center justify-between mt-3 gap-5 md:flex-row"
        >
          <Card className="flex-1 h-96 w-full">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="flex-1 h-96 w-full">
            <CardHeader>
              <CardTitle>Time Tracking Settings</CardTitle>
              <CardDescription>
                Configure your time tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="working-hours">Working Hours Per Day</Label>
                <Select value={workingHours} onValueChange={setWorkingHours}>
                  <SelectTrigger id="working-hours">
                    <SelectValue placeholder="Select working hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="10">10 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      Eastern Time (EST)
                    </SelectItem>
                    <SelectItem value="America/Chicago">
                      Central Time (CST)
                    </SelectItem>
                    <SelectItem value="America/Denver">
                      Mountain Time (MST)
                    </SelectItem>
                    <SelectItem value="America/Los_Angeles">
                      Pacific Time (PST)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-break"
                  checked={autoBreak}
                  onCheckedChange={setAutoBreak}
                />
                <Label htmlFor="auto-break">Automatically detect breaks</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneralSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <Separator />
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notifications}
                />
                <Label htmlFor="email-notifications">Email notifications</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  disabled={!notifications || !emailNotifications}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveNotificationSettings}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sharing Settings</CardTitle>
              <CardDescription>
                Configure how your time tracking data can be shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="share-reports"
                  checked={shareReports}
                  onCheckedChange={setShareReports}
                />
                <Label htmlFor="share-reports">
                  Allow sharing reports via public links
                </Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="default-share-duration">
                  Default Share Duration
                </Label>
                <Select
                  value={shareDuration}
                  onValueChange={setShareDuration}
                  disabled={!shareReports}
                >
                  <SelectTrigger id="default-share-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="0">No expiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSharingSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
