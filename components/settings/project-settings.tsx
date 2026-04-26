"use client";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
  type Project,
} from "@/app/actions/projects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Briefcase, DollarSign, Edit2, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

type ProjectSettingsProps = {};

export function ProjectSettings({}: ProjectSettingsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    client_name: "",
    color: "#3b82f6",
    hourly_rate: "",
    currency: "BRL",
  });

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        client_name: project.client_name || "",
        color: project.color,
        hourly_rate: project.hourly_rate?.toString() || "",
        currency: project.currency || "BRL",
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        client_name: "",
        color: "#3b82f6",
        hourly_rate: "",
        currency: "BRL",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsLoading(true);
    try {
      const data = {
        ...formData,
        hourly_rate: formData.hourly_rate
          ? parseFloat(formData.hourly_rate)
          : undefined,
        currency: formData.hourly_rate ? formData.currency : undefined,
      };

      let result;
      if (editingProject) {
        result = await updateProject(editingProject.id, data);
      } else {
        result = await createProject(data);
      }

      if (result.success) {
        toast({
          title: editingProject ? "Project Refactored" : "Mission Initiated",
          description:
            "Your workspace hierarchy has been updated successfully.",
        });
        setIsDialogOpen(false);
        loadProjects();
      } else {
        toast({
          title: "Sync Error",
          description: result.error || "Failed to save project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteProject(projectToDelete);
      if (result.success) {
        toast({
          title: "Project Purged",
          description:
            "The record has been permanently removed from the matrix.",
        });
        setIsDeleteDialogOpen(false);
        setProjectToDelete(null);
        loadProjects();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete project",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in duration-500">
      <Card className="border-none shadow-sm bg-card/40 backdrop-blur-md bg-gradient-to-br from-primary/5 via-transparent to-transparent relative overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between pb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <Briefcase className="h-5 w-5 text-primary/80" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Projects
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-60">
                Manage your workspaces and clients
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="rounded-lg font-semibold shadow-sm hover:translate-y-[-1px] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-xs font-medium text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl bg-muted/5">
              <div className="mb-4">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/20" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
              <p className="text-xs text-muted-foreground mb-6 max-w-[200px] mx-auto">
                Create your first project to start tracking your time.
              </p>
              <Button
                variant="outline"
                className="rounded-lg h-10 px-6 font-medium"
                onClick={() => handleOpenDialog()}
              >
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group/card relative rounded-xl border border-border/40 bg-card/40 p-5 hover:border-primary/20 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1 rounded-l-xl opacity-40 group-hover/card:opacity-100 transition-opacity"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold group-hover/card:text-primary transition-colors">
                        {project.name}
                      </h4>
                      {project.client_name ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <User className="h-3 w-3" />
                          {project.client_name}
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-muted-foreground/40">
                          Internal project
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-all">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md hover:bg-primary/5 hover:text-primary"
                        onClick={() => handleOpenDialog(project)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md text-destructive/60 hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => handleDeleteClick(project.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {project.hourly_rate ? (
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10 text-primary/80">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-[11px] font-bold tabular-nums">
                          {project.hourly_rate} / {project.currency || "HR"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] font-medium text-muted-foreground/50 italic">
                        Not billable
                      </div>
                    )}

                    <div
                      className="h-4 w-4 rounded-full border border-border/50"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md border border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 pb-6">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center border",
                  editingProject ? "bg-primary/5 border-primary/10 text-primary" : "bg-orange-500/5 border-orange-500/10 text-orange-500"
                )}>
                  {editingProject ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {editingProject ? "Edit Project" : "New Project"}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    Configure your workspace details
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="project-name" className="text-xs font-semibold ml-1">Project Name</Label>
                  <Input
                    id="project-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Website Overhaul"
                    className="h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl font-medium"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="client-name" className="text-xs font-semibold ml-1">Client (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                    <Input
                      id="client-name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      placeholder="Client or Company Name"
                      className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-rate" className="text-xs font-semibold ml-1">Hourly Rate</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
                      <Input
                        id="project-rate"
                        type="number"
                        step="0.01"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        placeholder="0.00"
                        className="pl-10 h-11 bg-background/50 border-border/60 focus:border-primary/50 rounded-xl font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="project-currency" className="text-xs font-semibold ml-1">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger id="project-currency" className="h-11 rounded-xl bg-background/50 border-border/60">
                        <SelectValue placeholder="BRL" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/60 backdrop-blur-xl">
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2">
                  <Label className="text-xs font-semibold ml-1 mb-2 block">Project Color</Label>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                    <div className="h-8 w-8 rounded-lg shadow-sm" style={{ backgroundColor: formData.color }} />
                    <Input
                      id="project-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-8 p-0 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border-t border-border/60 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-11 rounded-xl font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-[1.5] h-11 rounded-xl font-semibold shadow-sm"
              >
                {isLoading ? "Saving..." : editingProject ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-sm border border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl rounded-2xl">
          <AlertDialogHeader>
            <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
              <Trash2 className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium">
              This will permanently delete the project record. Time logs will remain but will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl h-10 font-medium bg-muted/40 border-none flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="rounded-xl h-10 font-semibold bg-destructive hover:bg-destructive/90 flex-1"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
