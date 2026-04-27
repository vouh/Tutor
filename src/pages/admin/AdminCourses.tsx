import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CircleOff, Edit3, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteCourse, getCourses, saveCourse, toggleCoursePublished, type CourseLevel, type CourseRecord } from "@/lib/adminData";

const levels: CourseLevel[] = ["Beginner", "Intermediate", "Advanced"];

type CourseFormState = {
  id?: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  price: string;
  isFree: boolean;
  isPublished: boolean;
  thumbnailUrl: string;
};

const emptyForm: CourseFormState = {
  title: "",
  description: "",
  category: "",
  level: "Beginner",
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
        category: course.category,
        level: course.level,
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

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const startCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const startEdit = (course: CourseRecord) => {
    setForm(toForm(course));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!form.title.trim()) {
        toast.error("Course title is required");
        return;
      }

      const savedId = await saveCourse({
        id: form.id,
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
        price: Number(form.price || 0),
        isFree: form.isFree,
        isPublished: form.isPublished,
        thumbnailUrl: form.thumbnailUrl,
        publishedAt: form.isPublished ? Timestamp.now() : null,
      });

      toast.success(form.id ? "Course updated" : "Course created");
      setDialogOpen(false);
      setForm(emptyForm);
      await loadCourses();
      navigate(`/admin/courses/${savedId}/modules`);
    } catch {
      toast.error("Failed to save course. Check Firestore permissions and republished rules.");
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Course management</h2>
          <p className="mt-1 text-sm text-slate-500">Create, edit, publish, and delete courses.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search courses" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
          </div>
          <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15">
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-[1.5rem] border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Level</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>Loading courses...</td></tr>
              ) : paginatedCourses.length === 0 ? (
                <tr><td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>No courses found.</td></tr>
              ) : paginatedCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnailUrl || "https://placehold.co/120x90"} alt={course.title} className="h-14 w-20 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold text-slate-900">{course.title}</p>
                        <p className="max-w-md truncate text-sm text-slate-500">{course.category} · {course.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{course.level}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">KES {Number(course.price || 0).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${course.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => startEdit(course)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button onClick={() => void handleTogglePublish(course)} disabled={publishBusyId === course.id} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60">
                        {publishBusyId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : course.isPublished ? <CircleOff className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => setDeleteTarget(course)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                      <Link to={`/admin/courses/${course.id}/modules`} className="inline-flex items-center gap-1 rounded-xl border border-primary/20 px-3 py-2 text-sm font-medium text-primary">
                        Modules
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50">Previous</button>
            <button disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit course" : "Create course"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
              <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Level</label>
              <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value as CourseLevel })} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                {levels.map((level) => <option key={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Price (KES)</label>
              <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} type="number" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.isFree} onChange={(event) => setForm({ ...form, isFree: event.target.checked })} /> Free course
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Published
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setDialogOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
            <button onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-70">
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
