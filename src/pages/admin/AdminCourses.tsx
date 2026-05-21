import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, CircleOff, Edit3, Eye, Loader2, Plus, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteCourse, getCourses, resizeImageToDataUrl, saveCourse, toggleCoursePublished, type CourseLevel, type CourseRecord } from "@/lib/adminData";

const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

type CourseFormState = {
  id?: string;
  title: string;
  description: string;
  summary: string;
  instructions: string;
  category: string;
  level: CourseLevel;
  moduleCount: string;
  price: string;
  isFree: boolean;
  isPublished: boolean;
  thumbnailUrl: string;
};

const emptyForm: CourseFormState = {
  title: "",
  description: "",
  summary: "",
  instructions: "",
  category: "",
  level: "Beginner",
  moduleCount: "1",
  price: "0",
  isFree: false,
  isPublished: false,
  thumbnailUrl: "",
};

function toForm(course?: CourseRecord): CourseFormState {
  return course
    ? {
        id: course.id,
        title: course.title,
        description: course.description,
        summary: course.summary || "",
        instructions: course.instructions || "",
        category: course.category,
        level: course.level,
        moduleCount: String(course.moduleCount || 1),
        price: String(course.price),
        isFree: course.isFree,
        isPublished: course.isPublished,
        thumbnailUrl: course.thumbnailUrl,
      }
    : emptyForm;
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CourseRecord | null>(null);
  const [publishBusyId, setPublishBusyId] = useState<string | null>(null);

  const pageSize = 10;

  const loadCourses = async () => {
    setLoading(true);
    try {
      setCourses(await getCourses());
    } catch {
      toast.error("Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const search = query.toLowerCase();
    return courses.filter((course) =>
      [course.title, course.description, course.category, course.level].join(" ").toLowerCase().includes(search)
    );
  }, [courses, query]);

  const summary = useMemo(() => {
    const published = courses.filter((course) => course.isPublished).length;
    const modules = courses.reduce((sum, course) => sum + Number(course.moduleCount || 0), 0);
    return [
      { label: "Total courses", value: courses.length, icon: BookOpen },
      { label: "Published", value: published, icon: CheckCircle2 },
      { label: "Drafts", value: courses.length - published, icon: CircleOff },
      { label: "Modules", value: modules, icon: Eye },
    ];
  }, [courses]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const startCreate = () => {
    setForm(emptyForm);
    setThumbnailFile(null);
    setThumbnailPreview("");
    setDialogOpen(true);
  };

  const startEdit = (course: CourseRecord) => {
    setForm(toForm(course));
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnailUrl || "");
    setDialogOpen(true);
  };

  const handleThumbnailChange = (file?: File | null) => {
    setThumbnailFile(file || null);
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    } else if (form.thumbnailUrl) {
      setThumbnailPreview(form.thumbnailUrl);
    } else {
      setThumbnailPreview("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!form.title.trim()) {
        toast.error("Course title is required");
        return;
      }

      if (!form.moduleCount || Number(form.moduleCount) < 1) {
        toast.error("Module count must be at least 1");
        return;
      }

      if (!thumbnailFile && !thumbnailPreview && !form.thumbnailUrl) {
        toast.error("Course thumbnail is required");
        return;
      }

      if (!form.isFree && Number(form.price || 0) <= 0) {
        toast.error("Enter a valid price or switch the course to free");
        return;
      }

      const courseId = form.id || crypto.randomUUID();
      let thumbnailUrl = form.thumbnailUrl;

      if (thumbnailFile) {
        thumbnailUrl = await resizeImageToDataUrl(thumbnailFile);
      }

      if (!thumbnailUrl) {
        toast.error("Course thumbnail processing failed");
        return;
      }

      if (thumbnailUrl.length > 950000) {
        toast.error("Thumbnail is too large after compression. Use a smaller image.");
        return;
      }

      const coursePrice = form.isFree ? 0 : Number(form.price || 0);

      const savedId = await saveCourse({
        id: courseId,
        title: form.title,
        description: form.description,
        summary: form.summary,
        instructions: form.instructions,
        category: form.category,
        level: form.level,
        moduleCount: Number(form.moduleCount),
        price: coursePrice,
        isFree: form.isFree,
        isPublished: form.isPublished,
        thumbnailUrl,
        publishedAt: form.isPublished ? Timestamp.now() : null,
      });

      toast.success(form.id ? "Course updated" : "Course created");
      setDialogOpen(false);
      setForm(emptyForm);
      setThumbnailFile(null);
      setThumbnailPreview("");
      await loadCourses();
      navigate(`/admin/courses/${savedId}/modules`);
    } catch (error) {
      const firebaseError = error as { code?: unknown; message?: unknown; customData?: unknown; stack?: unknown };
      const code = typeof firebaseError?.code === "string" ? firebaseError.code : "unknown";
      const message = typeof firebaseError?.message === "string" ? firebaseError.message : error instanceof Error ? error.message : "Unknown error";
      const details = typeof firebaseError?.customData === "object" ? firebaseError.customData : undefined;

      console.error("[AdminCourses] saveCourse failed", {
        code,
        message,
        details,
        error,
        form,
        hasThumbnailFile: Boolean(thumbnailFile),
      });

      toast.error(`Failed to save course: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteCourse(deleteTarget.id);
      toast.success("Course deleted");
      setDeleteTarget(null);
      await loadCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const handleTogglePublish = async (course: CourseRecord) => {
    if (!course.id) return;
    setPublishBusyId(course.id);
    try {
      await toggleCoursePublished(course.id, !course.isPublished);
      toast.success(course.isPublished ? "Course unpublished" : "Course published");
      await loadCourses();
    } catch {
      toast.error("Unable to update publish status");
    } finally {
      setPublishBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="rounded-lg border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{item.value.toLocaleString()}</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Course management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, publish, and organize course modules.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search courses" className="w-full rounded-md border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>Loading courses...</td></tr>
              ) : paginatedCourses.length === 0 ? (
                <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>No courses found.</td></tr>
              ) : paginatedCourses.map((course) => (
                <tr key={course.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                        <img src={course.thumbnailUrl || "https://placehold.co/120x90"} alt={course.title} className="h-14 w-20 rounded-md object-cover" />
                      <div>
                          <p className="font-semibold text-foreground">{course.title}</p>
                        <p className="max-w-md truncate text-sm text-slate-500">{course.category} · {course.description}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{Number(course.moduleCount || 0)} modules</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">{course.level}</td>
                  <td className="px-5 py-4 text-sm text-foreground">{course.isFree ? "Free" : `KES ${Number(course.price || 0).toLocaleString()}`}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${course.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => startEdit(course)} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => void handleTogglePublish(course)} disabled={publishBusyId === course.id} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60">
                        {publishBusyId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : course.isPublished ? <CircleOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => setDeleteTarget(course)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                      <Link to={`/admin/courses/${course.id}/modules`} className="inline-flex items-center gap-1 rounded-md border border-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10">
                        Modules
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-md border border-border px-3 py-2 disabled:opacity-50">Previous</button>
            <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-md border border-border px-3 py-2 disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
          <div className="border-b border-border px-5 py-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-semibold">{form.id ? "Edit course" : "Create course"}</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in course details, then save to continue managing modules.
            </DialogDescription>
          </DialogHeader>
          </div>

          <div className="grid gap-3 px-5 py-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
            <div className="md:col-span-2 space-y-2.5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thumbnail</label>
              <div className="grid gap-3 md:grid-cols-[150px,1fr]">
                <div className="overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                  <img
                    src={thumbnailPreview || form.thumbnailUrl || "https://placehold.co/640x360"}
                    alt={form.title || "Course thumbnail preview"}
                    className="h-32 w-full object-cover"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary hover:text-primary">
                    <Upload className="h-4 w-4" />
                    Upload thumbnail image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleThumbnailChange(event.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">Required. Use a clean landscape image for the course card.</p>
                  {thumbnailFile ? <p className="text-xs font-medium text-foreground">Selected: {thumbnailFile.name}</p> : null}
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Level</label>
              <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as CourseLevel })} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                {levels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Module count</label>
              <input value={form.moduleCount} onChange={(event) => setForm({ ...form, moduleCount: event.target.value })} type="number" min="1" className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price (KES)</label>
              {form.isFree ? (
                <div className="rounded-xl border border-dashed border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground">This course is marked free, so price is disabled.</div>
              ) : (
                <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" min="0" className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Course summary</label>
              <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} rows={3} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Short summary of what the course will cover" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Instructions</label>
              <textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} rows={3} className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Optional course instructions or notes for students" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(event) => setForm({ ...form, isFree: event.target.checked, price: event.target.checked ? "0" : form.price })}
              />
              Free course
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Published
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
            <button onClick={() => setDialogOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving" : "Save course"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete course?</DialogTitle>
            <DialogDescription>
              This action permanently removes the course and related records.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-slate-600">This removes the course, its modules, and related payment records.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={() => void handleDelete()} className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">Delete</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
