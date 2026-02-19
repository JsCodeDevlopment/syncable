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
import { calculateDuration, formatDuration } from "@/lib/db"
import { formatDateBR, formatTimeBR, getNowInBrazil, isSameDayBR } from "@/lib/timezone"
import { Clock, Trash2 } from "lucide-react"
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
          description: "Failed to load recent entries. Please refresh the page.",
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
          title: "Entry Deleted",
          description: "The time entry has been successfully deleted.",
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
    const today = getNowInBrazil()

    // Create yesterday in Brazilian time
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (isSameDayBR(date, today)) {
      return "Today"
    } else if (isSameDayBR(date, yesterday)) {
      return "Yesterday"
    } else {
      return formatDateBR(date)
    }
  }

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
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
              <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3 relative group">
                <div className="flex items-start gap-3">
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-background ${entry.status === "active" ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-muted-foreground/30"}`} />
                  <div className="space-y-1">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {formatDate(entry.start_time)}
                      {entry.status === "active" && (
                        <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-green-500 hover:bg-green-600 border-none shadow-sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center min-w-[60px] px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 text-center font-mono text-[11px] font-medium text-foreground/80">
                        {formatTimeBR(startTime)}
                      </span>
                      <span className="text-muted-foreground/40 text-[10px] uppercase font-bold tracking-wider">to</span>
                      <span className="inline-flex items-center justify-center min-w-[60px] px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/50 text-center font-mono text-[11px] font-medium text-foreground/80">
                        {endTime ? formatTimeBR(endTime) : "..."}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-1 sm:mt-0 pl-5 sm:pl-0">
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-0.5 text-right min-w-[90px]">
                    <div className="text-sm font-bold tabular-nums tracking-tight">
                      {formatDuration(netDuration)}
                    </div>
                    {breakDuration > 0 && (
                      <div className="text-[11px] text-muted-foreground tabular-nums flex items-center justify-end gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400/50"></span>
                        {formatDuration(breakDuration)} break
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setEntryToDelete(entry.id)}>
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
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 text-muted-foreground/60">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Clock className="h-8 w-8 opacity-50" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">No entries yet</h3>
              <p className="text-sm max-w-[220px] mx-auto">
                Start tracking your time to see your activity history here.
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
