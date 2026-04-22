"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { GeneralSettings } from "@/components/settings/general-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProjectSettings } from "@/components/settings/project-settings";
import { SharingSettings } from "@/components/settings/sharing-settings";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../actions/auth";
import { getUserSettings } from "../actions/user-settings";

import {
    User,
    Bell,
    Briefcase,
    Share2,
    ChevronRight,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState<{
        working_hours: number;
        timezone: string;
        auto_detect_breaks: boolean;
        enable_notifications: boolean;
        enable_email_notifications: boolean;
        allow_sharing: boolean;
        share_duration_days: number;
        theme: "light" | "dark" | "system";
        hourly_rate: number | null;
        currency: string;
    } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await getCurrentUser();

                if (!user) {
                    setAuthError("Session expired. Please log in again.");
                    setIsLoading(false);
                    return;
                }

                setUserId(user.id);

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
                setAuthError("Failed to load settings. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const navItems = [
        { id: "general", label: "General", icon: User, description: "Profile & preferences" },
        { id: "projects", label: "Projects", icon: Briefcase, description: "Manage workspaces" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "Alerts & emails" },
        { id: "sharing", label: "Sharing", icon: Share2, description: "External permissions" },
    ];

    if (authError) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
                <Card className="w-full max-w-md border border-border/50 shadow-sm bg-card/30 backdrop-blur-sm">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Access Restricted
                        </CardTitle>
                        <CardDescription className="font-medium text-muted-foreground">
                            {authError}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-6">
                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full h-11 rounded-xl font-semibold"
                        >
                            Back to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (isLoading || !settings || !userId) {
        return (
            <DashboardShell>
                <DashboardHeader heading="Settings" text="Loading your preferences..." />
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                    <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <p className="text-xs font-medium text-muted-foreground">Syncing settings...</p>
                </div>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Settings"
                text="Manage your account preferences and system configuration"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-card/40 backdrop-blur-md rounded-2xl border-none shadow-sm p-2 bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 relative group/btn",
                                    activeTab === item.id
                                        ? "bg-primary/[0.05] border border-primary/10"
                                        : "hover:bg-muted/30 border border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                    activeTab === item.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                )}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={cn(
                                        "text-sm font-semibold tracking-tight",
                                        activeTab === item.id ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </p>
                                    <p className="text-[11px] font-medium opacity-50 mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-all opacity-40",
                                    activeTab === item.id ? "translate-x-0" : "-translate-x-2 opacity-0"
                                )} />
                            </button>
                        ))}
                    </div>

                    <div className="p-5 bg-card/30 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent border-none rounded-2xl relative overflow-hidden group">
                        <div className="absolute -left-10 -bottom-10 h-32 w-32 bg-primary/5 rounded-full blur-3xl opacity-40" />
                        <div className="flex items-center gap-3 mb-3 relative z-10">
                            <Info className="h-4 w-4 text-primary/60" />
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">General Info</h4>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground/70 leading-relaxed relative z-10">
                            Your settings are saved automatically. Changes apply across all active sessions and exports.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-8">
                    <div className="animate-in fade-in duration-500">
                        {activeTab === "general" && (
                            <GeneralSettings
                                userId={userId}
                                initialSettings={{
                                    working_hours: settings.working_hours,
                                    timezone: settings.timezone,
                                    auto_detect_breaks: settings.auto_detect_breaks,
                                    theme: settings.theme,
                                    hourly_rate: settings.hourly_rate,
                                    currency: settings.currency,
                                }}
                            />
                        )}

                        {activeTab === "projects" && (
                            <ProjectSettings userId={userId} />
                        )}

                        {activeTab === "notifications" && (
                            <NotificationSettings
                                userId={userId}
                                initialSettings={{
                                    enable_notifications: settings.enable_notifications,
                                    enable_email_notifications: settings.enable_email_notifications,
                                }}
                            />
                        )}

                        {activeTab === "sharing" && (
                            <SharingSettings
                                userId={userId}
                                initialSettings={{
                                    allow_sharing: settings.allow_sharing,
                                    share_duration_days: settings.share_duration_days,
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
