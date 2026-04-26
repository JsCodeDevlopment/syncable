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
import {
  User,
  Mail,
  Calendar,
  Clock,
  Timer,
  Globe,
  Coins,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

type GeneralSettingsProps = {
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
  initialSettings,
}: GeneralSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [workingHours, setWorkingHours] = useState(
    initialSettings.working_hours.toString()
  );
  const [timezone, setTimezone] = useState(initialSettings.timezone);
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
        const result = await getUserProfile();
        if (result.success && result.data) {
          setProfile(result.data);
          setName(result.data.name);
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile information.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile && name !== profile.name) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [name, profile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSavingProfile(true);
    try {
      const result = await updateUserName(name.trim());
      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your name has been saved.",
        });
        if (profile) {
          setProfile({ ...profile, name: name.trim() });
          setHasChanges(false);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserSettings({
        working_hours: Number.parseInt(workingHours),
        timezone,
        hourly_rate: hourlyRate ? Number.parseFloat(hourlyRate) : null,
        currency,
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
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
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-medium text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-500">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile Section */}
        <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                <User className="h-5 w-5 text-primary/80" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Identity</CardTitle>
                <CardDescription className="text-xs font-medium opacity-60">Manage your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="name" className="text-xs font-semibold ml-1">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl font-medium"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email" className="text-xs font-semibold ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="pl-10 h-11 bg-muted/20 border-border/20 text-muted-foreground cursor-not-allowed rounded-xl"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/[0.02] border border-primary/5">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Member since</span>
              </div>
              <span className="text-sm font-semibold">
                {formatDateBR(new Date(profile.created_at))}
              </span>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/10 border-t border-border/40 pt-6">
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile || !hasChanges}
              className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              {isSavingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Theme Section */}
        <ThemeSettings initialTheme={initialSettings.theme} />
      </div>

      {/* Preferences Section */}
      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/5 flex items-center justify-center border border-orange-500/10">
              <Timer className="h-5 w-5 text-orange-500/80" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Preferences</CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">Control how tracking and billing works</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="working-hours" className="text-xs font-semibold flex items-center gap-2 ml-1 text-muted-foreground/80">
                  <Clock className="h-3.5 w-3.5" /> Target Workload
                </Label>
                <Select value={workingHours} onValueChange={setWorkingHours}>
                  <SelectTrigger id="working-hours" className="h-11 rounded-xl bg-background/50 border-border/60 font-medium">
                    <SelectValue placeholder="Hours per day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 backdrop-blur-xl">
                    <SelectItem value="4">4 hours / day</SelectItem>
                    <SelectItem value="6">6 hours / day</SelectItem>
                    <SelectItem value="8">8 hours / day</SelectItem>
                    <SelectItem value="10">10 hours / day</SelectItem>
                    <SelectItem value="12">12 hours / day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 p-4 rounded-xl bg-primary/[0.03] border border-primary/10 transition-all hover:bg-primary/[0.05]">
                <div className="flex items-center justify-between">
                   <Label htmlFor="timezone" className="text-xs font-bold flex items-center gap-2 ml-1 text-primary/80">
                     <Globe className="h-3.5 w-3.5" /> Localization
                   </Label>
                   <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">Region Set</span>
                </div>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="h-11 rounded-xl bg-background/60 border-primary/20 font-medium">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 backdrop-blur-xl">
                    <SelectItem value="UTC">UTC (Universal)</SelectItem>
                    <SelectItem value="America/Sao_Paulo">Brasília (BRT)</SelectItem>
                    <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-3 p-4 rounded-xl bg-primary/[0.03] border border-primary/10 transition-all hover:bg-primary/[0.05]">
                <div className="flex items-center justify-between">
                   <Label htmlFor="hourly-rate" className="text-xs font-bold flex items-center gap-2 ml-1 text-primary/80">
                     <Coins className="h-3.5 w-3.5" /> Billing Rate
                   </Label>
                   <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">Active rate</span>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-3.5 text-xs font-bold text-primary/60">
                    {currency === "BRL" ? "R$" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}
                  </div>
                  <Input
                    id="hourly-rate"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-12 h-11 bg-background/60 border-primary/20 focus:border-primary/50 rounded-xl font-medium tabular-nums"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="currency" className="text-xs font-semibold flex items-center gap-2 ml-1 text-muted-foreground/80">
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency" className="h-11 rounded-xl bg-background/50 border-border/60 font-medium">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 backdrop-blur-xl">
                    <SelectItem value="BRL">BRL - Real</SelectItem>
                    <SelectItem value="USD">USD - Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-500/80" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
              Your billing data and hourly rates are private and used only for personal revenue projections.
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t border-border/40 pt-6">
          <Button
            onClick={handleSaveGeneralSettings}
            disabled={isSaving}
            className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
