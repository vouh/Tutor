import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Loader2, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getActiveCourses, type Course } from '../lib/firestore';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getActiveCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1">
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
                  >
                    <div className="relative">
                      <img 
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'} 
                        alt={course.title} 
                        className="h-48 w-full object-cover" 
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary">
                        {course.category}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">{course.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                          {course.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Price</p>
                            <p className="text-2xl font-bold text-primary">KES {course.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{course.duration}</p>
                            <p>{course.students} students</p>
                          </div>
                        </div>

                          <div className="grid grid-cols-2 gap-3">
                            <Link
                              to={`/course/${course.slug || course.id}`}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              Learn More
                            </Link>
                            <Link
                              to={`/course/${course.slug || course.id}#apply`}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15"
                            >
                              Enroll Now <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No courses available</h3>
                <p className="text-slate-500">Check back later for new content.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Courses;
