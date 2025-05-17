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
import { toast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
import { useState } from "react";

type ThemeSettingsProps = {
  userId: number;
  initialTheme: "light" | "dark" | "system";
};

export function ThemeSettings({ userId, initialTheme }: ThemeSettingsProps) {
  const { setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setCurrentTheme(value);
    setHasChanges(value !== initialTheme);
  };

  const handleSaveTheme = async () => {
    if (currentTheme === initialTheme) {
      toast({
        title: "No Changes",
        description: "Theme hasn't changed. No update needed.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateUserSettings(userId, {
        theme: currentTheme,
      });

      if (result.success) {
        setTheme(currentTheme);
        toast({
          title: "Theme Updated Successfully",
          description: "Your theme preference has been saved and applied.",
        });
        setHasChanges(false);
      } else {
        toast({
          title: "Failed to Update Theme",
          description:
            result.error || "We couldn't update your theme. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Unexpected Error",
        description:
          "Something went wrong while updating your theme. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>
          Choose your preferred theme for the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={currentTheme} onValueChange={handleThemeChange}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveTheme} disabled={isSaving || !hasChanges}>
          {isSaving ? "Saving..." : hasChanges ? "Save Changes" : "No Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
