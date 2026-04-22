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

import { Sun, Moon, Monitor, Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
        title: "No changes",
        description: "Your theme is already up to date.",
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
          title: "Theme updated",
          description: "Your interface preferences have been synchronized.",
        });
        setHasChanges(false);
      } else {
        toast({
          title: "Error",
          description:
            result.error || "We couldn't update your theme. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Error",
        description:
          "Something went wrong while updating your theme.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const themes = [
    { id: "light", label: "Light", icon: Sun, color: "bg-orange-500/10 text-orange-600", activeColor: "bg-orange-500 text-white" },
    { id: "dark", label: "Dark", icon: Moon, color: "bg-blue-500/10 text-blue-600", activeColor: "bg-blue-600 text-white" },
    { id: "system", label: "System", icon: Monitor, color: "bg-purple-500/10 text-purple-600", activeColor: "bg-purple-600 text-white" },
  ];

  return (
    <Card className="w-full border-none shadow-sm bg-card/40 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
      <CardHeader className="pb-4">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
               <Palette className="h-5 w-5 text-primary/80" />
            </div>
            <div>
               <CardTitle className="text-xl font-bold tracking-tight">Appearance</CardTitle>
               <CardDescription className="text-xs font-medium opacity-60">Personalize your visual experience</CardDescription>
            </div>
         </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
               key={t.id}
               onClick={() => handleThemeChange(t.id as any)}
               className={cn(
                 "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 border",
                 currentTheme === t.id 
                    ? "bg-primary/[0.03] border-primary/30 shadow-sm" 
                    : "bg-transparent border-transparent hover:bg-muted/30"
               )}
            >
               <div className={cn(
                 "h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300",
                 currentTheme === t.id ? t.activeColor + " shadow-md" : t.color
               )}>
                  <t.icon className="h-5 w-5" />
               </div>
               <span className={cn(
                 "text-[11px] font-semibold transition-colors",
                 currentTheme === t.id ? "text-foreground" : "text-muted-foreground"
               )}>
                 {t.label}
               </span>
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
           onClick={handleSaveTheme} 
           disabled={isSaving || !hasChanges}
           className="w-full h-11 rounded-xl font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          {isSaving ? "Saving..." : "Apply Theme"}
        </Button>
      </CardFooter>
    </Card>
  );
}
