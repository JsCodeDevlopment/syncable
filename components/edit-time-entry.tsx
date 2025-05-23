"use client"

import type React from "react"

import { addBreakToTimeEntry, deleteBreak, updateBreak, updateTimeEntry } from "@/app/actions/manual-entries"
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
import { createBrazilianDate, formatDateForInput, formatTimeForInput } from "@/lib/timezone"
import { Edit, PlusCircle, Trash2 } from "lucide-react"
import { useState } from "react"

interface EditTimeEntryProps {
  userId: number
  timeEntryId: number
  initialStartTime: Date
  initialEndTime: Date | null
  breaks: {
    id: number
    startTime: Date
    endTime: Date | null
  }[]
  onSuccess?: () => void
}

export function EditTimeEntry({
  userId,
  timeEntryId,
  initialStartTime,
  initialEndTime,
  breaks,
  onSuccess,
}: EditTimeEntryProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Format date and times for form inputs using Brazilian time zone
  const [date, setDate] = useState(formatDateForInput(initialStartTime))
  const [startTime, setStartTime] = useState(formatTimeForInput(initialStartTime))
  const [endTime, setEndTime] = useState(initialEndTime ? formatTimeForInput(initialEndTime) : "")

  const [breakItems, setBreakItems] = useState(
    breaks.map((breakItem) => ({
      id: breakItem.id,
      startTime: formatTimeForInput(breakItem.startTime),
      endTime: breakItem.endTime ? formatTimeForInput(breakItem.endTime) : "",
      isNew: false,
      isDeleted: false,
    })),
  )

  const [nextBreakId, setNextBreakId] = useState(-1) // Using negative IDs for new breaks

  const addBreak = () => {
    setBreakItems([
      ...breakItems,
      { id: nextBreakId, startTime: "12:00", endTime: "13:00", isNew: true, isDeleted: false },
    ])
    setNextBreakId(nextBreakId - 1)
  }

  const updateBreakItem = (id: number, field: "startTime" | "endTime", value: string) => {
    setBreakItems(breakItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const markBreakForDeletion = (id: number) => {
    setBreakItems(breakItems.map((item) => (item.id === id ? { ...item, isDeleted: true } : item)))
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

      console.log("Updating time entry:", {
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime?.toISOString(),
      })

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

      // Update the time entry
      const updateResult = await updateTimeEntry(timeEntryId, startDateTime, endDateTime, userId)

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update time entry")
      }

      // Process breaks
      for (const breakItem of breakItems) {
        // Skip deleted breaks that are new (not yet in the database)
        if (breakItem.isDeleted && breakItem.isNew) continue

        const breakStartTime = createBrazilianDate(date, breakItem.startTime)
        const breakEndTime = breakItem.endTime ? createBrazilianDate(date, breakItem.endTime) : null

        console.log("Processing break:", {
          id: breakItem.id,
          isNew: breakItem.isNew,
          isDeleted: breakItem.isDeleted,
          startTime: breakStartTime.toISOString(),
          endTime: breakEndTime?.toISOString(),
        })

        // Validate break times
        if (breakEndTime && breakStartTime >= breakEndTime) {
          throw new Error("Break end time must be after break start time.")
        }

        if (startDateTime >= breakStartTime || (endDateTime && breakEndTime && breakEndTime >= endDateTime)) {
          throw new Error("Breaks must be within the work period.")
        }

        if (breakItem.isDeleted) {
          // Delete existing break
          await deleteBreak(breakItem.id, userId)
        } else if (breakItem.isNew) {
          // Add new break
          await addBreakToTimeEntry(timeEntryId, breakStartTime, breakEndTime, userId)
        } else {
          // Update existing break
          await updateBreak(breakItem.id, breakStartTime, breakEndTime, userId)
        }
      }

      toast({
        title: "Entry Updated",
        description: "Your time entry has been successfully updated.",
      })

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error updating time entry:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update time entry.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogDescription>Update the details of this time entry.</DialogDescription>
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
                <p className="text-xs text-muted-foreground">Ex: 09:00 for 9 AM, 13:00 for 1 PM</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time (24h format)</Label>
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            {breakItems.filter((b) => !b.isDeleted).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Breaks</Label>
                  </div>
                  {breakItems
                    .filter((b) => !b.isDeleted)
                    .map((breakItem) => (
                      <div key={breakItem.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                        <div className="grid gap-1">
                          <Label htmlFor={`break-start-${breakItem.id}`} className="text-xs">
                            Start (24h)
                          </Label>
                          <Input
                            id={`break-start-${breakItem.id}`}
                            type="time"
                            value={breakItem.startTime}
                            onChange={(e) => updateBreakItem(breakItem.id, "startTime", e.target.value)}
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
                            onChange={(e) => updateBreakItem(breakItem.id, "endTime", e.target.value)}
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => markBreakForDeletion(breakItem.id)}
                        >
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
