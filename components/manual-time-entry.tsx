"use client"

import type React from "react"

import { createManualTimeEntry } from "@/app/actions/manual-entries"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { createBrazilianDate, formatDateForInput, getNowInBrazil } from "@/lib/timezone"
import { Calendar as CalendarIcon, Clock, Coffee, PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"

interface ManualTimeEntryProps {
  userId: number
  onSuccess?: () => void
}

export function ManualTimeEntry({ userId, onSuccess }: ManualTimeEntryProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with current date in Brazilian time zone
  const now = getNowInBrazil()
  const [date, setDate] = useState(formatDateForInput(now))
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [breaks, setBreaks] = useState<{ id: number; startTime: string; endTime: string }[]>([])
  const [nextBreakId, setNextBreakId] = useState(1)

  const addBreak = () => {
    setBreaks([...breaks, { id: nextBreakId, startTime: "12:00", endTime: "13:00" }])
    setNextBreakId(nextBreakId + 1)
  }

  const updateBreak = (id: number, field: "startTime" | "endTime", value: string) => {
    setBreaks(breaks.map((breakItem) => (breakItem.id === id ? { ...breakItem, [field]: value } : breakItem)))
  }

  const removeBreak = (id: number) => {
    setBreaks(breaks.filter((breakItem) => breakItem.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate inputs
      if (!date || !startTime) {
        toast({
          title: "Missing Information",
          description: "Please provide at least a date and start time.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create Date objects with Brazil timezone
      const startDateTime = createBrazilianDate(date, startTime)
      const endDateTime = endTime ? createBrazilianDate(date, endTime) : null

      // Validate start and end times
      if (endDateTime && startDateTime >= endDateTime) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Format breaks
      const formattedBreaks = breaks.map((breakItem) => {
        const breakStartTime = createBrazilianDate(date, breakItem.startTime)
        const breakEndTime = breakItem.endTime ? createBrazilianDate(date, breakItem.endTime) : null

        // Validate break times
        if (breakEndTime && breakStartTime >= breakEndTime) {
          throw new Error("Break end time must be after break start time.")
        }

        if (startDateTime >= breakStartTime || (endDateTime && breakEndTime && breakEndTime >= endDateTime)) {
          throw new Error("Breaks must be within the work period.")
        }

        return {
          startTime: breakStartTime,
          endTime: breakEndTime,
        }
      })

      console.log("Submitting time entry:", {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime?.toISOString(),
        breaks: formattedBreaks.map((b) => ({
          startTime: b.startTime.toISOString(),
          endTime: b.endTime?.toISOString(),
        })),
      })

      // Submit the entry
      const result = await createManualTimeEntry(userId, startDateTime, endDateTime, formattedBreaks)

      if (result.success) {
        toast({
          title: "Entry Created",
          description: "Your manual time entry has been successfully recorded.",
        })
        setOpen(false)
        if (onSuccess) onSuccess()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create time entry.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating manual time entry:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create time entry.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-dashed border-2 hover:border-solid hover:bg-muted/50 h-12">
          <Clock className="mr-2 h-4 w-4" />
          Add Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Manual Time Entry</DialogTitle>
          <DialogDescription>
            Forgot to track your time? Record your work session manually here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Work Session Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
              <Clock className="h-4 w-4" />
              <span>Work Session Details</span>
            </div>

            <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Breaks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                <Coffee className="h-4 w-4" />
                <span>Breaks</span>
              </div>
              <Button type="button" size="sm" variant="ghost" onClick={addBreak} className="h-8 text-xs hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300">
                <PlusCircle className="mr-1 h-3.5 w-3.5" />
                Add Break
              </Button>
            </div>

            {breaks.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground/50 text-sm">
                No breaks recorded for this session
              </div>
            ) : (
              <div className="space-y-3">
                {breaks.map((breakItem) => (
                  <div key={breakItem.id} className="relative group grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center p-3 rounded-lg border bg-card hover:shadow-sm transition-all">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`break-start-${breakItem.id}`} className="text-[10px] text-muted-foreground uppercase tracking-wider">Start</Label>
                      <Input
                        id={`break-start-${breakItem.id}`}
                        type="time"
                        value={breakItem.startTime}
                        onChange={(e) => updateBreak(breakItem.id, "startTime", e.target.value)}
                        required
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="text-muted-foreground/30 px-1 pt-4">➜</div>

                    <div className="grid gap-1.5">
                      <Label htmlFor={`break-end-${breakItem.id}`} className="text-[10px] text-muted-foreground uppercase tracking-wider">End</Label>
                      <Input
                        id={`break-end-${breakItem.id}`}
                        type="time"
                        value={breakItem.endTime}
                        onChange={(e) => updateBreak(breakItem.id, "endTime", e.target.value)}
                        required
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="pt-4 pl-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBreak(breakItem.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
