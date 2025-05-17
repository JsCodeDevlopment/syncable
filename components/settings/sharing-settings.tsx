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
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

type SharingSettingsProps = {
  userId: number
  initialSettings: {
    allow_sharing: boolean
    share_duration_days: number
  }
}

export function SharingSettings({ userId, initialSettings }: SharingSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [shareReports, setShareReports] = useState(initialSettings.allow_sharing)
  const [shareDuration, setShareDuration] = useState(initialSettings.share_duration_days.toString())

  const handleSaveSharingSettings = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserSettings(userId, {
        allow_sharing: shareReports,
        share_duration_days: Number.parseInt(shareDuration),
      })

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your sharing settings have been updated successfully.",
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
    </div>
  )
} 