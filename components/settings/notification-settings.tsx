"use client"

import { updateUserSettings } from "@/app/actions/user-settings"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

type NotificationSettingsProps = {
  userId: number
  initialSettings: {
    enable_notifications: boolean
    enable_email_notifications: boolean
  }
}

export function NotificationSettings({ userId, initialSettings }: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [notifications, setNotifications] = useState(initialSettings.enable_notifications)
  const [emailNotifications, setEmailNotifications] = useState(initialSettings.enable_email_notifications)
  const [notificationEmail, setNotificationEmail] = useState("")

  const handleSaveNotificationSettings = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserSettings(userId, {
        enable_notifications: notifications,
        enable_email_notifications: emailNotifications,
      })

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your notification settings have been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 pt-4">
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
          <Button onClick={handleSaveNotificationSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 