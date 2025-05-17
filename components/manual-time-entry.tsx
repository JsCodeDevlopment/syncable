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
import { Clock, PlusCircle, Trash2 } from "lucide-react"
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
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Manual Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Manual Entry</DialogTitle>
          <DialogDescription>
            Enter the details of the time period you want to manually record.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time (24h format)</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ex: 09:00 for 9 AM, 13:00 for 1 PM, 00:00 for midnight
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time (24h format)</Label>
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            {breaks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Breaks</Label>
                  </div>
                  {breaks.map((breakItem) => (
                    <div key={breakItem.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <div className="grid gap-1">
                        <Label htmlFor={`break-start-${breakItem.id}`} className="text-xs">
                          Start (24h)
                        </Label>
                        <Input
                          id={`break-start-${breakItem.id}`}
                          type="time"
                          value={breakItem.startTime}
                          onChange={(e) => updateBreak(breakItem.id, "startTime", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor={`break-end-${breakItem.id}`} className="text-xs">
                          End (24h)
                        </Label>
                        <Input
                          id={`break-end-${breakItem.id}`}
                          type="time"
                          value={breakItem.endTime}
                          onChange={(e) => updateBreak(breakItem.id, "endTime", e.target.value)}
                          required
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBreak(breakItem.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <Button type="button" variant="outline" className="w-full" onClick={addBreak}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Break
            </Button>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
