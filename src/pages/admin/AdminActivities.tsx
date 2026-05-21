import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { asDate, deleteActivity, getActivities, saveActivity, type ActivityRecord } from "@/lib/adminData";

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  meetUrl: "",
};

export default function AdminActivities() {
  const { user } = useAdminAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadActivities = async () => {
    setActivities(await getActivities());
  };

  useEffect(() => {
    loadActivities()
      .catch(() => toast.error("Failed to load activities"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSaving(true);
    try {
      await saveActivity({
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        meetUrl: form.meetUrl.trim(),
        createdByEmail: user?.email || "",
      });
      setForm(emptyForm);
      toast.success("Activity saved");
      await loadActivities();
    } catch {
      toast.error("Unable to save activity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (activityId?: string) => {
    if (!activityId || !window.confirm("Delete this activity?")) return;

    try {
      await deleteActivity(activityId);
      setActivities((current) => current.filter((activity) => activity.id !== activityId));
      toast.success("Activity deleted");
    } catch {
      toast.error("Unable to delete activity");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
      <Card className="rounded-lg border-border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-foreground">Activities</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add optional live sessions, meet links, or activity videos without changing course module content.</p>
        </div>

        <div className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Title</span>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Weekly live review" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Description</span>
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="What learners should expect" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Video URL</span>
            <input value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://..." />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Meet URL</span>
            <input value={form.meetUrl} onChange={(event) => setForm({ ...form, meetUrl: event.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://meet.google.com/..." />
          </label>

          <button onClick={() => void handleSave()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : "Add activity"}
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-lg border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xl font-bold text-foreground">Saved activities</h2>
        </div>
        <div className="divide-y divide-border">
          {loading ? <p className="px-5 py-6 text-sm text-muted-foreground">Loading activities...</p> : null}
          {!loading && activities.length === 0 ? <p className="px-5 py-6 text-sm text-muted-foreground">No activities yet.</p> : null}
          {activities.map((activity) => (
            <div key={activity.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{activity.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.description}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{asDate(activity.createdAt)?.toLocaleString() || "Just now"}</span>
                    {activity.videoUrl ? <a href={activity.videoUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary">Video</a> : null}
                    {activity.meetUrl ? <a href={activity.meetUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary">Meet</a> : null}
                  </div>
                </div>
                <button onClick={() => void handleDelete(activity.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
