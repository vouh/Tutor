import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
const ReactQuill = lazy(() => import("react-quill"));
import { ArrowLeft, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
        content: module.content,
        pdfUrl: module.pdfUrl,
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
  const [quillReady, setQuillReady] = useState(false);

  useEffect(() => {
    // Only enable the client-only rich editor after mount to avoid
    // ReactStrictMode/findDOMNode warnings from react-quill.
    setQuillReady(true);
  }, []);

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

  const fallbackOrder = useMemo(() => (modules.length > 0 ? Math.max(...modules.map((module) => module.order)) + 1 : 1), [modules]);

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

      if (!form.description.trim()) {
        toast.error("Module description is required");
        return;
      }

      if (!form.assignment.trim()) {
        toast.error("Assignment or test text is required");
        return;
      }

      if (!form.content.trim()) {
        toast.error("Lesson content is required");
        return;
      }

      let pdfUrl = form.pdfUrl;
      const moduleId = form.id || crypto.randomUUID();

      if (form.type === "pdf" && pdfFile) {
        pdfUrl = await uploadModulePdf(courseId, moduleId, pdfFile, setUploadProgress);
      }

      if (form.type === "pdf" && !pdfUrl) {
        toast.error("Upload a PDF file for PDF modules");
        return;
      }

      if (form.type === "text") {
        pdfUrl = "";
      }

      await saveModule({
        id: moduleId,
        title: form.title,
        description: form.description,
        assignment: form.assignment,
        type: form.type,
        courseId,
        order: form.order,
        isFree: false,
        content: form.content,
        pdfUrl,
      });

      toast.success(form.id ? "Module updated" : "Module created");
      setDialogOpen(false);
      setPdfFile(null);
      setUploadProgress(0);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      const firebaseError = error as { code?: unknown; message?: unknown; customData?: unknown };
      const code = typeof firebaseError?.code === "string" ? firebaseError.code : "unknown";
      const message = typeof firebaseError?.message === "string" ? firebaseError.message : error instanceof Error ? error.message : "Unknown error";

      console.error("[AdminCourseModules] saveModule failed", {
        code,
        message,
        error,
        form,
        courseId,
        hasPdfFile: Boolean(pdfFile),
      });

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
    const orderedIds = next.map((module, index) => ({ ...module, order: index + 1 }));
    setModules(orderedIds);
    try {
      await reorderModules(courseId, orderedIds.map((module) => module.id || ""));
      toast.success("Module order updated");
    } catch {
      toast.error("Failed to reorder modules");
      await loadData();
    }
  };

  if (loading) {
    return <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading module manager...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <button onClick={() => navigate("/admin/courses")} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" /> Back to courses
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{course?.title || "Course"} modules</h2>
          <p className="mt-1 text-sm text-slate-500">Drag modules to reorder them. Text modules use rich content, PDF modules use Storage uploads.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> Add module
        </button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card
            key={module.id}
            draggable
            onDragStart={() => setDragId(module.id || null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void handleReorder(module.id || "")}
            className="rounded-[1.5rem] border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-slate-100 p-2 text-slate-500"><GripVertical className="h-4 w-4" /></span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{module.title}</h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{module.type}</span>
                  </div>
                  <p className="text-sm text-slate-500">Order {module.order}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => startEdit(module)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Edit</button>
                <button onClick={() => setDeleteTarget(module)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600"><Trash2 className="mr-1 inline h-4 w-4" /> Delete</button>
              </div>
            </div>
          </Card>
        ))}
        {modules.length === 0 ? <Card className="rounded-[1.5rem] border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">No modules yet. Add the first lesson.</Card> : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit module" : "Create module"}</DialogTitle>
            <DialogDescription>
              Type A is text content. Type B is a PDF upload with optional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Assignment / test text</label>
              <textarea value={form.assignment} onChange={(event) => setForm({ ...form, assignment: event.target.value })} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Add the assignment, task, or test instructions for this topic" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ModuleType, pdfUrl: event.target.value === "pdf" ? form.pdfUrl : "" })} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Order</label>
              <input type="number" value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
          </div>

          {form.type === "text" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rich text content</label>
              {quillReady ? (
                <Suspense fallback={<div className="h-40 rounded bg-slate-50">Loading editor…</div>}>
                  <ReactQuill theme="snow" value={form.content} onChange={(value) => setForm({ ...form, content: value })} className="rounded-2xl bg-white" />
                </Suspense>
              ) : (
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="h-40 w-full rounded-2xl border px-4 py-3" />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">PDF file</label>
                <input type="file" accept="application/pdf" onChange={(event) => setPdfFile(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-200 px-4 py-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Lesson notes</label>
                <input value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Optional notes for the PDF lesson" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
            </div>
          )}

          {pdfFile ? <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><p>PDF upload progress</p><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} /></div></div> : null}

          <div className="flex justify-end gap-3">
            <button onClick={() => setDialogOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving" : "Save module"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete module?</DialogTitle>
            <DialogDescription>
              This will permanently remove the selected module.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-slate-600">This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={() => void handleDelete()} className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
