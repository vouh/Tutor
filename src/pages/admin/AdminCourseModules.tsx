import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteModule, getCourse, getModules, reorderModules, saveModule, uploadModulePdf, type CourseRecord, type ModuleRecord, type ModuleType } from "@/lib/adminData";

type ModuleFormState = {
  id?: string;
  title: string;
  description: string;
  assignment: string;
  type: ModuleType;
  order: number;
  content: string;
  pdfUrl: string;
};

const emptyForm: ModuleFormState = {
  title: "",
  description: "",
  assignment: "",
  type: "text",
  order: 1,
  content: "",
  pdfUrl: "",
};

function toForm(module?: ModuleRecord, fallbackOrder = 1): ModuleFormState {
  return module
    ? {
        id: module.id,
        title: module.title,
        description: module.description || "",
        assignment: module.assignment || "",
        type: module.type,
        order: module.order,
        content: module.content || "",
        pdfUrl: module.pdfUrl || "",
      }
    : { ...emptyForm, order: fallbackOrder };
}

export default function AdminCourseModules() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || "";
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ModuleFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<ModuleRecord | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const loadData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseData, moduleData] = await Promise.all([getCourse(courseId), getModules(courseId)]);
      setCourse(courseData);
      setModules(moduleData);
    } catch {
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [courseId]);

  const fallbackOrder = useMemo(
    () => (modules.length > 0 ? Math.max(...modules.map((module) => Number(module.order || 0))) + 1 : 1),
    [modules]
  );

  const startCreate = () => {
    setForm(toForm(undefined, fallbackOrder));
    setPdfFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const startEdit = (module: ModuleRecord) => {
    setForm(toForm(module));
    setPdfFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      if (!form.title.trim()) {
        toast.error("Module title is required");
        return;
      }

      let pdfUrl = form.pdfUrl.trim();
      const moduleId = form.id || crypto.randomUUID();

      if (form.type === "pdf" && pdfFile) {
        pdfUrl = await uploadModulePdf(courseId, moduleId, pdfFile, setUploadProgress);
      }

      if (form.type === "pdf" && !pdfUrl) {
        toast.error("Upload a PDF file");
        return;
      }

      if (form.type === "video" && !pdfUrl) {
        toast.error("Video URL is required");
        return;
      }

      await saveModule({
        id: moduleId,
        title: form.title.trim(),
        description: form.description.trim(),
        assignment: form.assignment.trim(),
        type: form.type,
        courseId,
        order: Number(form.order || fallbackOrder),
        isFree: false,
        content: form.content.trim(),
        pdfUrl: form.type === "text" ? "" : pdfUrl,
      });

      toast.success(form.id ? "Module updated" : "Module created");
      setDialogOpen(false);
      setPdfFile(null);
      setUploadProgress(0);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[AdminCourseModules] saveModule failed", error);
      toast.error(`Failed to save module: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteModule(deleteTarget.id);
      toast.success("Module deleted");
      setDeleteTarget(null);
      await loadData();
    } catch {
      toast.error("Unable to delete module");
    }
  };

  const handleReorder = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...modules];
    const fromIndex = next.findIndex((module) => module.id === dragId);
    const toIndex = next.findIndex((module) => module.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    const ordered = next.map((module, index) => ({ ...module, order: index + 1 }));
    setModules(ordered);
    try {
      await reorderModules(courseId, ordered.map((module) => module.id || ""));
      toast.success("Module order updated");
    } catch {
      toast.error("Failed to reorder modules");
      await loadData();
    }
  };

  if (loading) {
    return <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <button onClick={() => navigate("/admin/courses")} className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Courses
          </button>
          <h2 className="truncate text-xl font-bold text-foreground">{course?.title || "Course"} modules</h2>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add module
        </button>
      </div>

      <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Resource</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules.map((module) => (
                <tr
                  key={module.id}
                  draggable
                  onDragStart={() => setDragId(module.id || null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleReorder(module.id || "")}
                  className="hover:bg-muted/40"
                >
                  <td className="w-24 px-3 py-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><GripVertical className="h-4 w-4" /> {module.order}</span>
                  </td>
                  <td className="max-w-[420px] px-3 py-2">
                    <p className="truncate text-sm font-medium text-foreground">{module.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{module.description || "-"}</p>
                  </td>
                  <td className="px-3 py-2 text-sm capitalize text-foreground">{module.type}</td>
                  <td className="px-3 py-2 text-sm text-muted-foreground">{module.pdfUrl ? "Attached" : module.content ? "Text" : "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => startEdit(module)} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">Edit</button>
                      <button onClick={() => setDeleteTarget(module)} className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="mr-1 inline h-3.5 w-3.5" />Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {modules.length === 0 ? <tr><td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">No modules yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit module" : "Create module"}</DialogTitle>
            <DialogDescription>Save lesson details and content.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Description</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Type</span>
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ModuleType })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-foreground">Order</span>
              <input type="number" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
            {form.type === "text" ? (
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-foreground">HTML content</span>
                <div className="w-full rounded-lg border border-border bg-background p-0 text-sm">
                  <ReactQuill value={form.content} onChange={(value) => setForm({ ...form, content: value })} theme="snow" />
                </div>
              </label>
            ) : form.type === "pdf" ? (
              <div className="space-y-3 md:col-span-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-foreground">PDF file</span>
                  <input type="file" accept="application/pdf" onChange={(event) => setPdfFile(event.target.files?.[0] || null)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-foreground">Notes</span>
                  <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
              </div>
            ) : (
              <div className="space-y-3 md:col-span-2">
                <label className="space-y-1">
                  <span className="text-sm font-medium text-foreground">Video URL</span>
                  <input value={form.pdfUrl} onChange={(event) => setForm({ ...form, pdfUrl: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://..." />
                </label>
                <label className="space-y-1">
                  <span className="text-sm font-medium text-foreground">Notes</span>
                  <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
              </div>
            )}
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-foreground">Assignment</span>
              <textarea value={form.assignment} onChange={(event) => setForm({ ...form, assignment: event.target.value })} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          {pdfFile ? (
            <div className="space-y-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p>Upload {uploadProgress}%</p>
              <div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button onClick={() => setDialogOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-70">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save module
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete module?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">Cancel</button>
            <button onClick={() => void handleDelete()} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
