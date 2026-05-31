import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Edit3, Layers3, Search } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { getCourses, getModules, type CourseRecord, type ModuleRecord } from "@/lib/adminData";

export default function AdminModules() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [courseData, moduleData] = await Promise.all([getCourses(), getModules()]);
        setCourses(courseData);
        setModules(moduleData);
        setSelectedCourseId(courseData[0]?.id || null);
      } catch {
        toast.error("Failed to load modules");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredCourses = useMemo(() => {
    const search = query.toLowerCase();
    return courses.filter((course) =>
      [course.title, course.category, course.level, course.description]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [courses, query]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) || filteredCourses[0] || null,
    [courses, filteredCourses, selectedCourseId]
  );

  const selectedModules = useMemo(
    () => modules.filter((module) => module.courseId === selectedCourse?.id).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [modules, selectedCourse?.id]
  );

  useEffect(() => {
    if (!selectedCourseId && filteredCourses[0]?.id) {
      setSelectedCourseId(filteredCourses[0].id);
    }
  }, [filteredCourses, selectedCourseId]);

  return (
    <div className="space-y-6">
      <Card className="rounded-[1.5rem] border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Course modules</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a course first, then edit its modules from the list.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search courses"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-bold text-slate-900">Courses</h3>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading courses...</p>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const active = course.id === selectedCourse?.id;
                const moduleCount = modules.filter((module) => module.courseId === course.id).length;
                return (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id || null)}
                    className={`rounded-[1.25rem] border p-4 text-left transition ${active ? "border-primary/30 bg-primary/5 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-primary/20 hover:bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-900">{course.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{course.category} · {course.level}</p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">{moduleCount} modules</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>{course.isPublished ? "Published" : "Draft"}</span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No courses found.</p>
            )}
          </div>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {selectedCourse ? (
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Layers3 className="h-4 w-4 text-primary" /> Modules for course
                </div>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedCourse.title}</h3>
                <p className="mt-1 text-sm text-slate-500">Edit, reorder, or open the course module editor.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">{selectedModules.length} modules</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">{selectedCourse.category}</span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">{selectedCourse.level}</span>
                </div>
                <div className="mt-4">
                  <Link to={`/admin/courses/${selectedCourse.id}/modules`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                    <Edit3 className="h-4 w-4" /> Edit course modules
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {selectedModules.length > 0 ? (
                  selectedModules.map((module) => (
                    <div key={module.id} className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Module {module.order}</p>
                          <h4 className="mt-1 truncate text-base font-semibold text-slate-900">{module.title}</h4>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{module.description || "No description"}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-50 px-2.5 py-1">{module.type}</span>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1">{module.pdfUrl ? "Has resource" : "No resource"}</span>
                          </div>
                        </div>
                        <Link to={`/admin/courses/${selectedCourse.id}/modules`} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.1rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    No modules added to this course yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[30rem] items-center justify-center rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Select a course to view its modules.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
