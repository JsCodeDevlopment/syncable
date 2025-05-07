"use client"

import { deleteTimeEntry } from "@/app/actions/manual-entries"
import { getRecentTimeEntries } from "@/app/actions/time-entries"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { calculateDuration, formatDateForDisplay, formatDuration, formatTimeForDisplay } from "@/lib/utils"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { EditTimeEntry } from "./edit-time-entry"

type Break = {
  id: number
  time_entry_id: number
  start_time: string
  end_time: string | null
}

type Entry = {
  id: number
  start_time: string
  end_time: string | null
  status: string
  total_break_time: number
  breaks?: Break[]
}

export function RecentEntries({ userId }: { userId: number }) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key for forcing re-renders

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const result = await getRecentTimeEntries(userId)
      if (result.success) {
        setEntries(result.data)
      } else {
        console.error("Error fetching entries:", result.error)
        toast({
          title: "Error",
          description: "Failed to load recent entries. Please try refreshing the page.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching recent entries:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading entries.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Listen for the custom event from TimeTracker
  useEffect(() => {
    const handleTimeEntryUpdate = () => {
      console.log("Time entry updated event received, refreshing entries")
      fetchEntries()
    }

    // Add event listener
    window.addEventListener("timeEntryUpdated", handleTimeEntryUpdate)

    // Clean up
    return () => {
      window.removeEventListener("timeEntryUpdated", handleTimeEntryUpdate)
    }
  }, [userId])

  // Initial fetch and polling
  useEffect(() => {
    fetchEntries()

    // Set up polling every 30 seconds
    const intervalId = setInterval(() => {
      fetchEntries()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [userId, refreshKey])

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTimeEntry(entryToDelete, userId)
      if (result.success) {
        toast({
          title: "Entry deleted",
          description: "The time entry has been deleted successfully.",
        })
        fetchEntries() // Refresh the entries after deletion
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setEntryToDelete(null)
    }
  }

  // Add a refresh method that can be called from parent components
  const refreshEntries = () => {
    setRefreshKey((prev) => prev + 1) // Increment refresh key to force re-render
    fetchEntries()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return formatDateForDisplay(date)
    }
  }

  const formatTime = (dateString: string) => {
    return formatTimeForDisplay(new Date(dateString))
  }

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry) => {
            const startTime = new Date(entry.start_time)
            const endTime = entry.end_time ? new Date(entry.end_time) : null
            const duration = endTime ? calculateDuration(startTime, endTime) : 0
            const breakDuration = entry.total_break_time || 0
            const netDuration = duration - breakDuration

            // Format breaks for the edit component
            const formattedBreaks =
              entry.breaks?.map((breakItem) => ({
                id: breakItem.id,
                startTime: new Date(breakItem.start_time),
                endTime: breakItem.end_time ? new Date(breakItem.end_time) : null,
              })) || []

            return (
              <div key={entry.id} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="font-medium">{formatDate(entry.start_time)}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : "In progress"}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-medium">{formatDuration(netDuration)}</div>
                  <div className="text-sm text-muted-foreground">Breaks: {formatDuration(breakDuration)}</div>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="mr-2">
                    {entry.status}
                  </Badge>
                  <EditTimeEntry
                    userId={userId}
                    timeEntryId={entry.id}
                    initialStartTime={startTime}
                    initialEndTime={endTime}
                    breaks={formattedBreaks}
                    onSuccess={refreshEntries}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setEntryToDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this time entry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteEntry}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No time entries yet. Start tracking your time to see entries here.
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
