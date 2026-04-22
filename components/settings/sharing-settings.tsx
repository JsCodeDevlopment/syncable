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
import { useState } from "react";

type SharingSettingsProps = {
  userId: number;
  initialSettings: {
    allow_sharing: boolean;
    share_duration_days: number;
  };
};

import { cn } from "@/lib/utils";
import { Hourglass, Info, Share2, ShieldCheck } from "lucide-react";

export function SharingSettings({
  userId,
  initialSettings,
}: SharingSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [shareReports, setShareReports] = useState(
    initialSettings.allow_sharing,
  );
  const [shareDuration, setShareDuration] = useState(
    initialSettings.share_duration_days.toString(),
  );

  const handleSaveSharingSettings = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        allow_sharing: shareReports,
        share_duration_days: Number.parseInt(shareDuration),
      });

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your report sharing preferences have been updated.",
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
              <Share2 className="h-5 w-5 text-primary/80" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Sharing
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Configure public visibility of your reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/[0.02] border border-primary/5 hover:bg-primary/[0.04] transition-all">
              <div className="space-y-0.5">
                <Label
                  htmlFor="share-reports"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Public Link Sharing
                </Label>
                <p className="text-[11px] text-muted-foreground font-medium opacity-70">
                  Allow reports to be accessed via public links
                </p>
              </div>
              <Switch
                id="share-reports"
                checked={shareReports}
                onCheckedChange={setShareReports}
                className="data-[state=checked]:bg-primary shadow-sm"
              />
            </div>

            <div
              className={cn(
                "p-6 rounded-xl border transition-all duration-300",
                shareReports
                  ? "bg-card/40 border-border/60"
                  : "bg-muted/10 border-transparent grayscale opacity-50",
              )}
            >
              <div className="grid gap-4">
                <Label
                  htmlFor="default-share-duration"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2 ml-0.5"
                >
                  <Hourglass className="h-3 w-3" /> Link Expiration
                </Label>
                <Select
                  value={shareDuration}
                  onValueChange={setShareDuration}
                  disabled={!shareReports}
                >
                  <SelectTrigger
                    id="default-share-duration"
                    className="h-11 rounded-xl bg-background/40 border-border/60 font-medium"
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/60 backdrop-blur-xl">
                    <SelectItem value="1">24 Hours</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="0">Never (No expiration)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground/70 font-medium flex items-center gap-2 mt-1 italic">
                  <Info className="h-3.5 w-3.5 text-primary/60" /> Shared links automatically expire after this period.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-500/80" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Secure Encryption</p>
              <p className="text-[11px] font-medium text-muted-foreground/80 leading-relaxed">
                We use secure cryptographic tokens to ensure your shared data is only viewable by those with the link.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t border-border/40 pt-6">
          <Button
            onClick={handleSaveSharingSettings}
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
