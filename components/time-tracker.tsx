"use client";

import {
  endBreak,
  endTimeEntry,
  getActiveTimeEntry,
  getTotalBreakTime,
  startBreak,
  startTimeEntry,
  updateTimeEntry,
} from "@/app/actions/time-entries";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { formatDuration, formatTimer } from "@/lib/format-duration";
import {
  createBrazilianDate,
  formatDateForInput,
  formatTimeForInput,
  getNowInBrazil,
} from "@/lib/timezone";
import {
  AlertCircle,
  Clock,
  Coffee,
  FileText,
  LogOut,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Descendant } from "slate";
import { ManualTimeEntry } from "./manual-time-entry";

export function TimeTracker({ userId }: { userId: number }) {
  const [status, setStatus] = useState<"idle" | "working" | "break">("idle");
  const [activeTimeEntryId, setActiveTimeEntryId] = useState<number | null>(
    null,
  );
  const [activeBreakId, setActiveBreakId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [breakTime, setBreakTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [observations, setObservations] = useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);
  const [isAdjustingStart, setIsAdjustingStart] = useState(false);
  const [adjustedStartTime, setAdjustedStartTime] = useState("");
  const [isDelayedExit, setIsDelayedExit] = useState(false);
  const [adjustedEndTime, setAdjustedEndTime] = useState("");

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
    const event = new CustomEvent("timeEntryUpdated");
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const checkActiveTimeEntry = async () => {
      try {
        const result = await getActiveTimeEntry(userId);

        if (result.success && result.data) {
          const { timeEntry, activeBreak } = result.data;

          setActiveTimeEntryId(timeEntry.id);
          setStartTime(new Date(timeEntry.start_time));

          if (activeBreak) {
            setStatus("break");
            setActiveBreakId(activeBreak.id);
            setBreakStartTime(new Date(activeBreak.start_time));
          } else {
            setStatus("working");
          }

          const breakResult = await getTotalBreakTime(timeEntry.id);
          if (breakResult.success && breakResult.data) {
            setTotalBreakTime(breakResult.data);
          }
        }
      } catch (error) {
        console.error("Error checking active time entry:", error);
        toast({
          title: "Error",
          description:
            "Failed to check active time entries. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    checkActiveTimeEntry();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "working" && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        let totalElapsed =
          Math.floor((now.getTime() - startTime.getTime()) / 1000) * 1000;
        if (totalBreakTime > 0) {
          totalElapsed -= totalBreakTime;
        }
        setElapsedTime(totalElapsed);
      }, 1000);
    } else if (status === "break" && breakStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed =
          Math.floor((now.getTime() - breakStartTime.getTime()) / 1000) * 1000;
        setBreakTime(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status, startTime, breakStartTime, totalBreakTime]);

  const handleStartWorking = async () => {
    setIsLoading(true);

    try {
      const result = await startTimeEntry(userId);

      if (result.success && result.data) {
        setStatus("working");
        setActiveTimeEntryId(result.data.id);
        setStartTime(new Date(result.data.start_time));
        setElapsedTime(0);
        setBreakTime(0);
        setTotalBreakTime(0);
        triggerRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start working",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting work:", error);
      toast({
        title: "Error",
        description: "Failed to start working. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustStartTime = async () => {
    if (!activeTimeEntryId || !adjustedStartTime) return;

    setIsLoading(true);
    try {
      const now = getNowInBrazil();
      const dateStr = formatDateForInput(now);
      const newStartDateTime = createBrazilianDate(dateStr, adjustedStartTime);

      const result = await updateTimeEntry(activeTimeEntryId, {
        start_time: newStartDateTime,
      });

      if (result.success && result.data) {
        setStartTime(new Date(result.data.start_time));
        setIsAdjustingStart(false);
        triggerRefresh();
        toast({
          title: "Entry Adjusted",
          description: "Your start time has been successfully adjusted.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to adjust start time",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adjusting start time:", error);
      toast({
        title: "Error",
        description: "Failed to adjust start time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBreak = async () => {
    if (!activeTimeEntryId) return;

    setIsLoading(true);

    try {
      const result = await startBreak(activeTimeEntryId);

      if (result.success && result.data) {
        setStatus("break");
        setActiveBreakId(result.data.id);
        setBreakStartTime(new Date(result.data.start_time));
        triggerRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start break",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting break:", error);
      toast({
        title: "Error",
        description: "Failed to start break. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeWorking = async () => {
    if (!activeBreakId) return;

    setIsLoading(true);

    try {
      const result = await endBreak(activeBreakId);

      if (result.success) {
        setStatus("working");
        setActiveBreakId(null);
        const breakDuration = breakStartTime
          ? new Date().getTime() - breakStartTime.getTime()
          : 0;
        setTotalBreakTime(totalBreakTime + breakDuration);
        setBreakTime(0);
        setBreakStartTime(null);
        triggerRefresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to resume working",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resuming work:", error);
      toast({
        title: "Error",
        description: "Failed to resume working. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndDay = async () => {
    const now = getNowInBrazil();
    setAdjustedEndTime(formatTimeForInput(now));
    setIsDelayedExit(false);
    setIsFinishDialogOpen(true);
  };

  const confirmEndDay = async () => {
    if (!activeTimeEntryId) return;

    setIsLoading(true);

    try {
      if (status === "break" && activeBreakId) {
        await endBreak(activeBreakId);
      }

      let finalEndTime: Date | undefined = undefined;
      if (isDelayedExit && adjustedEndTime) {
        const now = getNowInBrazil();
        const dateStr = formatDateForInput(now);
        finalEndTime = createBrazilianDate(dateStr, adjustedEndTime);
      }

      const result = await endTimeEntry(
        activeTimeEntryId,
        JSON.stringify(observations),
        finalEndTime,
      );

      if (result.success) {
        setStatus("idle");
        setActiveTimeEntryId(null);
        setActiveBreakId(null);
        setStartTime(null);
        setBreakStartTime(null);
        setElapsedTime(0);
        setBreakTime(0);
        setTotalBreakTime(0);
        setObservations([{ type: "paragraph", children: [{ text: "" }] }]);
        setIsFinishDialogOpen(false);

        triggerRefresh();

        toast({
          title: "Success",
          description: "Your workday has been successfully recorded.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to end your workday",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error ending day:", error);
      toast({
        title: "Error",
        description: "Failed to end your workday. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    triggerRefresh();
  };

  const getStatusColor = () => {
    switch (status) {
      case "working":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "break":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "working":
        return "Working";
      case "break":
        return "On Break";
      default:
        return "Ready to Start";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <div
          className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor()}`}
        >
          <div
            className={`h-2 w-2 rounded-full bg-current ${status !== "idle" ? "animate-pulse" : ""}`}
          />
          {getStatusText()}
        </div>

        <div className="text-center relative">
          <div className="text-7xl font-bold tracking-tighter tabular-nums text-foreground">
            {status === "idle"
              ? "00:00"
              : formatTimer(elapsedTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-2 font-medium">
            {status === "break"
              ? `Break time: ${formatDuration(totalBreakTime + breakTime)}`
              : `Total break: ${formatDuration(totalBreakTime)}`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {status === "idle" && (
          <>
            <Button
              onClick={handleStartWorking}
              className="h-12 text-lg w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              {isLoading ? "Starting..." : "Start Working"}
            </Button>
            <div className="w-full">
              <ManualTimeEntry userId={userId} onSuccess={refreshData} />
            </div>
          </>
        )}

        {status === "working" && (
          <>
            <Button
              onClick={handleStartBreak}
              variant="outline"
              className="h-12 text-md w-full border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-orange-800 dark:hover:bg-orange-900/20"
              disabled={isLoading}
            >
              <Coffee className="mr-2 h-5 w-5" />
              {isLoading ? "Processing..." : "Take a Break"}
            </Button>
            <Button
              onClick={handleEndDay}
              variant="destructive"
              className="h-12 text-md w-full"
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoading ? "Processing..." : "End Day"}
            </Button>
          </>
        )}

        {status === "break" && (
          <>
            <Button
              onClick={handleResumeWorking}
              className="h-12 text-md w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              {isLoading ? "Processing..." : "Resume Working"}
            </Button>
            <Button
              onClick={handleEndDay}
              variant="destructive"
              className="h-12 text-md w-full"
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-5 w-5" />
              {isLoading ? "Processing..." : "End Day"}
            </Button>
          </>
        )}
      </div>

      {status !== "idle" && (
        <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          Started working at{" "}
          <span className="font-medium text-foreground">
            {startTime?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-7 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            onClick={() => {
              if (startTime) {
                setAdjustedStartTime(formatTimeForInput(startTime));
                setIsAdjustingStart(true);
              }
            }}
          >
            <Clock className="mr-1 h-3 w-3" />
            Delayed entry?
          </Button>
          {status === "break" && (
            <span>
              {" "}
              • Break started at{" "}
              <span className="font-medium text-foreground">
                {breakStartTime?.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          )}
        </div>
      )}

      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalize Your Jornada</DialogTitle>
            <DialogDescription>
              Great job today! Would you like to add any observations about what
              you've done?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col gap-4 p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <Clock className="h-4 w-4" />
                <span>Delayed Exit?</span>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delayed-exit"
                  checked={isDelayedExit}
                  onCheckedChange={(checked) =>
                    setIsDelayedExit(checked === true)
                  }
                />
                <Label
                  htmlFor="delayed-exit"
                  className="text-sm cursor-pointer font-normal"
                >
                  I forgot to end my jornada earlier
                </Label>
              </div>

              {isDelayedExit && (
                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="end-time" className="text-xs">
                    Actual End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={adjustedEndTime}
                    onChange={(e) => setAdjustedEndTime(e.target.value)}
                    className="max-w-[150px]"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Your jornada will be recorded as ending at this time.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
                <span>Observations (Optional)</span>
              </div>

              <div className="border rounded-lg overflow-hidden min-h-[200px]">
                <RichTextEditor
                  value={observations}
                  onChange={setObservations}
                  mode="controlled"
                  minHeight="200px"
                  maxHeight="400px"
                  placeholder="Summary of today's work..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsFinishDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEndDay}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {isLoading ? "Saving..." : "End My Day"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdjustingStart} onOpenChange={setIsAdjustingStart}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adjust Start Time</DialogTitle>
            <DialogDescription>
              Forgot to start your jornada? Set the time you actually started
              working.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs">
                This will adjust your entry start time for today's session.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adj-start-time">Actual Start Time</Label>
              <Input
                id="adj-start-time"
                type="time"
                value={adjustedStartTime}
                onChange={(e) => setAdjustedStartTime(e.target.value)}
                className="max-w-[150px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAdjustingStart(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjustStartTime}
              disabled={isLoading || !adjustedStartTime}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {isLoading ? "Updating..." : "Update Start Time"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
