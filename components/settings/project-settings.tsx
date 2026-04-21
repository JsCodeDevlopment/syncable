"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, Briefcase, User, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getProjects, createProject, updateProject, deleteProject, type Project } from "@/app/actions/projects"

type ProjectSettingsProps = {
  userId: number
}

export function ProjectSettings({ userId }: ProjectSettingsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    color: "#3b82f6",
    hourly_rate: "",
    currency: "BRL",
  })

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const result = await getProjects(userId)
      if (result.success && result.data) {
        setProjects(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [userId])

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        client_name: project.client_name || "",
        color: project.color,
        hourly_rate: project.hourly_rate?.toString() || "",
        currency: project.currency || "BRL",
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: "",
        client_name: "",
        color: "#3b82f6",
        hourly_rate: "",
        currency: "BRL",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return
    if (formData.hourly_rate && !formData.currency) {
      toast({
        title: "Currency required",
        description: "Please specify a currency for the hourly rate.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const data = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
        currency: formData.hourly_rate ? formData.currency : undefined,
      }

      let result
      if (editingProject) {
        result = await updateProject(editingProject.id, data)
      } else {
        result = await createProject(userId, data)
      }

      if (result.success) {
        toast({
          title: `Project ${editingProject ? "updated" : "created"}`,
          description: "Your project settings have been saved.",
        })
        setIsDialogOpen(false)
        loadProjects()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!projectToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteProject(projectToDelete)
      if (result.success) {
        toast({
          title: "Project deleted",
          description: "The project has been removed.",
        })
        setIsDeleteDialogOpen(false)
        setProjectToDelete(null)
        loadProjects()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete project",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Projects & Clients</CardTitle>
            <CardDescription>
              Manage your projects and clients to better organize your time.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && projects.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground opacity-20" />
              <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
              <p className="text-muted-foreground">Add your first project to start organizing your work.</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: project.color }}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(project)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteClick(project.id)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                    {project.client_name && (
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {project.client_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-4">
                    {project.hourly_rate && (
                      <div className="text-xs font-medium bg-secondary/50 inline-flex items-center gap-1 px-2 py-1 rounded">
                        <DollarSign className="h-3 w-3" />
                        {project.hourly_rate}/{project.currency || "hr"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
              <DialogDescription>
                Fill in the details for your project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-name">Client Name (Optional)</Label>
                <Input
                  id="client-name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="project-color">Label Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="project-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 p-1 h-10"
                    />
                    <span className="text-xs text-muted-foreground">{formData.color}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-rate">Hourly Rate (Optional)</Label>
                  <Input
                    id="project-rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project-currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    disabled={!formData.hourly_rate}
                  >
                    <SelectTrigger id="project-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project. 
              Existing time entries will remain but will no longer be linked to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
