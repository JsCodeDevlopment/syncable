"use client";

import { getUserProfile, updateUserName } from "@/app/actions/user-profile";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { formatDateBR } from "@/lib/timezone";
import { useEffect, useState } from "react";
import { ThemeSettings } from "./theme-settings";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type GeneralSettingsProps = {
  userId: number;
  initialSettings: {
    working_hours: number;
    timezone: string;
    auto_detect_breaks: boolean;
    theme: "light" | "dark" | "system";
    hourly_rate: number | null;
    currency: string;
  };
};

export function GeneralSettings({
  userId,
  initialSettings,
}: GeneralSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [workingHours, setWorkingHours] = useState(
    initialSettings.working_hours.toString()
  );
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [autoBreak, setAutoBreak] = useState(
    initialSettings.auto_detect_breaks
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(
    initialSettings.hourly_rate?.toString() || ""
  );
  const [currency, setCurrency] = useState(initialSettings.currency || "BRL");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await getUserProfile(userId);
        if (result.success && result.data) {
          setProfile(result.data);
          setName(result.data.name);
        } else {
          toast({
            title: "Error Loading Profile",
            description:
              "We couldn't load your profile information. Please try refreshing the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error Loading Profile",
          description:
            "An unexpected error occurred while loading your profile. Please try again later.",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (profile && name !== profile.name) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [name, profile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Your name cannot be empty. Please enter a valid name.",
        variant: "destructive",
      });
      return;
    }

    if (name === profile?.name) {
      toast({
        title: "No Changes",
        description: "Your name hasn't changed. No update needed.",
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateUserName(userId, name.trim());
      if (result.success) {
        toast({
          title: "Profile Updated Successfully",
          description:
            "Your name has been updated. The changes will be reflected across your account.",
        });
        if (profile) {
          setProfile({ ...profile, name: name.trim() });
          setHasChanges(false);
        }
      } else {
        toast({
          title: "Failed to Update Profile",
          description:
            result.error || "We couldn't update your name. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Unexpected Error",
        description:
          "Something went wrong while updating your profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        working_hours: Number.parseInt(workingHours),
        timezone,
        auto_detect_breaks: autoBreak,
        hourly_rate: hourlyRate ? Number.parseFloat(hourlyRate) : null,
        currency,
      });

      if (result.success) {
        toast({
          title: "Settings Saved Successfully",
          description:
            "Your preferences have been updated and will be applied immediately.",
        });
      } else {
        toast({
          title: "Failed to Save Settings",
          description:
            result.error || "We couldn't save your settings. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Unexpected Error",
        description:
          "Something went wrong while saving your settings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label>Account Created</Label>
              <div className="text-sm text-muted-foreground">
                {formatDateBR(new Date(profile.created_at))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile || !hasChanges}
            >
              {isSavingProfile
                ? "Saving..."
                : hasChanges
                ? "Save Changes"
                : "No Changes"}
            </Button>
          </CardFooter>
        </Card>

        <ThemeSettings userId={userId} initialTheme={initialSettings.theme} />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Time Tracking Settings
            <span className="inline-flex items-center rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-gray-200 ring-1 ring-inset ring-gray-700">
              Coming Soon
            </span>
          </CardTitle>
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
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Billing & Hourly Rates
          </CardTitle>
          <CardDescription>
            Configure your billable rates to automatically calculate earnings in reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="hourly-rate">Hourly Rate</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">
                {currency === "BRL" ? "R$" : currency === "USD" ? "$" : currency === "GBP" ? "£" : "€"}
              </span>
              <Input
                id="hourly-rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Amount you charge per hour of work.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">Brazilian Real (BRL)</SelectItem>
                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGeneralSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Billing Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
