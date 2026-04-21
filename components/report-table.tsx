"use client"

import { useState, Fragment } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Search, FileText } from "lucide-react"
import { formatDuration } from "@/lib/format-duration"
import { RichTextViewer } from "@/components/rich-text-editor"

interface ReportTableProps {
  data: {
    id: number
    date: string
    startTime: string
    endTime: string | null
    duration: number
    breaks: number
    netWork: number
    observations?: string | null
    project_name?: string | null
    project_color?: string | null
  }[]
}

export function ReportTable({ data }: ReportTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Filter entries based on search query
  const filteredEntries = data.filter((entry) => entry.date.toLowerCase().includes(searchQuery.toLowerCase()))

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by date..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Breaks</TableHead>
              <TableHead>Net Work</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEntries.length > 0 ? (
              paginatedEntries.map((entry) => {
                let observationContent;
                try {
                  observationContent = entry.observations ? JSON.parse(entry.observations) : null;
                } catch (e) {
                  observationContent = entry.observations ? [{ type: 'paragraph', children: [{ text: entry.observations }] }] : null;
                }

                const isExpanded = expandedRows[entry.id]

                return (
                  <Fragment key={entry.id}>
                    <TableRow 
                      key={entry.id} 
                      className={cn(
                        "transition-colors",
                        isExpanded ? "bg-muted/20" : "hover:bg-muted/10",
                        observationContent && "cursor-pointer"
                      )}
                      onClick={() => observationContent && toggleRow(entry.id)}
                    >
                      <TableCell className="font-medium">{entry.date}</TableCell>
                      <TableCell>
                        {entry.project_name ? (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.project_color || "#ccc" }} />
                            <span className="text-xs">{entry.project_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No project</span>
                        )}
                      </TableCell>
                      <TableCell>{entry.startTime}</TableCell>
                      <TableCell>{entry.endTime || "In progress"}</TableCell>
                      <TableCell>{formatDuration(entry.duration)}</TableCell>
                      <TableCell>{formatDuration(entry.breaks)}</TableCell>
                      <TableCell className="font-bold text-primary">{formatDuration(entry.netWork)}</TableCell>
                      <TableCell>
                        {observationContent && (
                          <Button 
                            variant={isExpanded ? "secondary" : "default"}
                            size="sm" 
                            className={cn(
                              "h-8 text-xs px-3 shadow-md transition-all active:scale-95 font-medium",
                              !isExpanded && "bg-primary hover:bg-primary/90 hover:shadow-lg shadow-primary/20",
                              isExpanded && "bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20"
                            )}
                          >
                            {isExpanded ? "Close" : "Description"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && observationContent && (
                      <TableRow className="bg-muted/20 border-t-0">
                        <TableCell colSpan={8} className="p-0">
                          <div className="px-6 py-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="rounded-xl border bg-background p-4 shadow-sm ring-1 ring-border/50">
                              <div className="flex items-center gap-2 mb-3 border-b pb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detailed Observations</span>
                              </div>
                              <RichTextViewer content={observationContent} className="text-sm leading-relaxed" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
