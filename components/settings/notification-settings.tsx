"use client";

import { updateUserSettings } from "@/app/actions/user-settings";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

type NotificationSettingsProps = {
  userId: number;
  initialSettings: {
    enable_notifications: boolean;
    enable_email_notifications: boolean;
  };
};

import { cn } from "@/lib/utils";
import { Bell, Mail, ShieldAlert, Zap } from "lucide-react";

export function NotificationSettings({
  userId,
  initialSettings,
}: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState(
    initialSettings.enable_notifications,
  );
  const [emailNotifications, setEmailNotifications] = useState(
    initialSettings.enable_email_notifications,
  );
  const [notificationEmail, setNotificationEmail] = useState("");

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        enable_notifications: notifications,
        enable_email_notifications: emailNotifications,
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated.",
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

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <Bell className="h-5 w-5 text-primary/80" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Notifications
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Choose how you want to be notified
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/[0.02] border border-primary/5 hover:bg-primary/[0.04] transition-all">
              <div className="space-y-0.5">
                <Label
                  htmlFor="notifications"
                  className="text-sm font-semibold cursor-pointer"
                >
                  System Notifications
                </Label>
                <p className="text-[11px] text-muted-foreground font-medium opacity-70">
                  Enable browser and desktop alerts
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-primary shadow-sm"
              />
            </div>

            <div
              className={cn(
                "p-5 rounded-xl border transition-all duration-300",
                notifications
                  ? "bg-card/40 border-border/60"
                  : "bg-muted/10 border-transparent grayscale opacity-50",
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground/60" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Email Notifications
                  </span>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notifications}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="notification-email"
                  className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 ml-0.5"
                >
                  Recipient Email
                </Label>
                <div className="relative">
                  <ShieldAlert className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
                  <Input
                    id="notification-email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 bg-background/40 border-border/60 focus:border-primary/50 rounded-xl font-medium transition-all"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    disabled={!notifications || !emailNotifications}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-orange-500/80" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
              We recommend keeping <b>System Notifications</b> on for real-time status updates and important alerts.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t border-border/40 pt-6">
          <Button
            onClick={handleSaveNotificationSettings}
            disabled={isSaving}
            className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
