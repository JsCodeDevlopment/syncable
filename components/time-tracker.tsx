"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Coffee, LogOut } from "lucide-react"
import { startTimeEntry, endTimeEntry, startBreak, endBreak, getActiveTimeEntry } from "@/app/actions/time-entries"
import { formatDuration } from "@/lib/db"
import { toast } from "@/components/ui/use-toast"
import { ManualTimeEntry } from "./manual-time-entry"

export function TimeTracker({ userId }: { userId: number }) {
  const [status, setStatus] = useState<"idle" | "working" | "break">("idle")
  const [activeTimeEntryId, setActiveTimeEntryId] = useState<number | null>(null)
  const [activeBreakId, setActiveBreakId] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [breakTime, setBreakTime] = useState<number>(0)
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  // Check for active time entry on component mount
  useEffect(() => {
    const checkActiveTimeEntry = async () => {
      const result = await getActiveTimeEntry(userId)

      if (result.success && result.data) {
        const { timeEntry, activeBreak } = result.data

        setActiveTimeEntryId(timeEntry.id)
        setStartTime(new Date(timeEntry.start_time))

        if (activeBreak) {
          setStatus("break")
          setActiveBreakId(activeBreak.id)
          setBreakStartTime(new Date(activeBreak.start_time))
        } else {
          setStatus("working")
        }
      }
    }

    checkActiveTimeEntry()
  }, [userId])

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "working" && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) * 1000
        setElapsedTime(elapsed)
      }, 1000)
    } else if (status === "break" && breakStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000) * 1000
        setBreakTime(elapsed)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [status, startTime, breakStartTime])

  const handleStartWorking = async () => {
    setIsLoading(true)

    try {
      const result = await startTimeEntry(userId)

      if (result.success) {
        setStatus("working")
        setActiveTimeEntryId(result.data.id)
        setStartTime(new Date(result.data.start_time))
        setElapsedTime(0)
        setBreakTime(0)
        setTotalBreakTime(0)
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting work:", error)
      toast({
        title: "Error",
        description: "Failed to start working. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartBreak = async () => {
    if (!activeTimeEntryId) return

    setIsLoading(true)

    try {
      const result = await startBreak(activeTimeEntryId)

      if (result.success) {
        setStatus("break")
        setActiveBreakId(result.data.id)
        setBreakStartTime(new Date(result.data.start_time))
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting break:", error)
      toast({
        title: "Error",
        description: "Failed to start break. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeWorking = async () => {
    if (!activeBreakId) return

    setIsLoading(true)

    try {
      const result = await endBreak(activeBreakId)

      if (result.success) {
        setStatus("working")
        setActiveBreakId(null)
        const breakDuration = breakStartTime ? new Date().getTime() - breakStartTime.getTime() : 0
        setTotalBreakTime(totalBreakTime + breakDuration)
        setBreakTime(0)
        setBreakStartTime(null)
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resuming work:", error)
      toast({
        title: "Error",
        description: "Failed to resume working. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndDay = async () => {
    if (!activeTimeEntryId) return

    setIsLoading(true)

    try {
      // If on break, end the break first
      if (status === "break" && activeBreakId) {
        await endBreak(activeBreakId)
      }

      const result = await endTimeEntry(activeTimeEntryId)

      if (result.success) {
        setStatus("idle")
        setActiveTimeEntryId(null)
        setActiveBreakId(null)
        setStartTime(null)
        setBreakStartTime(null)
        setElapsedTime(0)
        setBreakTime(0)
        setTotalBreakTime(0)

        toast({
          title: "Success",
          description: "Your workday has been successfully recorded.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error ending day:", error)
      toast({
        title: "Error",
        description: "Failed to end your workday. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    // Refresh active time entry data after manual entry
    const checkActiveTimeEntry = async () => {
      const result = await getActiveTimeEntry(userId)

      if (result.success && result.data) {
        const { timeEntry, activeBreak } = result.data

        setActiveTimeEntryId(timeEntry.id)
        setStartTime(new Date(timeEntry.start_time))

        if (activeBreak) {
          setStatus("break")
          setActiveBreakId(activeBreak.id)
          setBreakStartTime(new Date(activeBreak.start_time))
        } else {
          setStatus("working")
        }
      }
    }

    checkActiveTimeEntry()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Working Time</div>
          <div className="text-3xl font-bold">
            {formatDuration(elapsedTime - totalBreakTime - (status === "break" ? breakTime : 0))}
          </div>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">Break Time</div>
          <div className="text-3xl font-bold">
            {formatDuration(totalBreakTime + (status === "break" ? breakTime : 0))}
          </div>
        </Card>
      </div>

      <div className="flex justify-center space-x-4">
        {status === "idle" && (
          <>
            <Button onClick={handleStartWorking} className="flex-1" disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? "Starting..." : "Start Working"}
            </Button>
            <ManualTimeEntry userId={userId} onSuccess={refreshData} />
          </>
        )}

        {status === "working" && (
          <>
            <Button onClick={handleStartBreak} variant="outline" className="flex-1" disabled={isLoading}>
              <Coffee className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Take a Break"}
            </Button>
            <Button onClick={handleEndDay} variant="destructive" className="flex-1" disabled={isLoading}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "End Day"}
            </Button>
          </>
        )}

        {status === "break" && (
          <>
            <Button onClick={handleResumeWorking} className="flex-1" disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Resume Working"}
            </Button>
            <Button onClick={handleEndDay} variant="destructive" className="flex-1" disabled={isLoading}>
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "End Day"}
            </Button>
          </>
        )}
      </div>

      {status !== "idle" && (
        <div className="text-center text-sm text-muted-foreground">
          {status === "working" ? "Currently working" : "On break"} • Started at {startTime?.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
