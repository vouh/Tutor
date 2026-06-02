import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { Brain, Code, Heart, TrendingUp, Wallet, Palette, ChevronRight, Play, Shield, Smartphone, Clock, Users, Star, Loader2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getActiveCourses, type Course } from "../lib/firestore";

const Index = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getActiveCourses();
        // Limit to 3 featured courses as requested
        setFeaturedCourses(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const features = [
    {
      icon: <Smartphone size={24} />,
      title: "Learn Anywhere",
      description: "Access courses on any device, anytime"
    },
    {
      icon: <Shield size={24} />,
      title: "Secure M-Pesa",
      description: "Fast and safe payments via M-Pesa"
    },
    {
      icon: <Play size={24} />,
      title: "Instant Access",
      description: "Start learning immediately after purchase"
    },
    {
      icon: <Clock size={24} />,
      title: "Lifetime Access",
      description: "Learn at your own pace, forever"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(180deg,#fff8f8_0%,#ffffff_18%,#fff4f4_100%)]">
      <SEO 
        title="Home" 
        description="TutorKE - Kenya's leading e-learning platform for AI, coding, personal development, and more."
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Features Section */}
        <section className="relative overflow-hidden border-y border-rose-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.04),_transparent_24%),linear-gradient(180deg,_#ffffff_0%,_#fff7f7_100%)] py-18 sm:py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1600px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr,1.1fr] lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <span className="mb-4 inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Why Learn With Us
              </span>
              <h2 className="font-montserrat text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                A learning experience that feels open, fast, and modern.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                Premium courses designed for the modern Kenyan learner, with clear pathways, secure payments, and instant access from any device.
              </p>

              <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-3">
                {[
                  { value: '5K+', label: 'Learners' },
                  { value: '24/7', label: 'Access' },
                  { value: 'M-Pesa', label: 'Payments' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-rose-500/10 text-primary ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-sm leading-6 text-slate-500">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 sm:py-20 bg-white/60 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
            >
              <div>
                <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                  Featured Courses
                </h2>
                <p className="text-muted-foreground">Start learning something new today</p>
              </div>
              <Link to="/courses">
                <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  View All Courses
                  <ChevronRight size={18} />
                </button>
              </Link>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <p className="text-muted-foreground text-sm">Finding best courses...</p>
                </div>
              ) : featuredCourses.length > 0 ? (
                featuredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-xl overflow-hidden border hover:shadow-xl transition-all group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=250&q=80'}
                        alt={course.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-primary">
                        {course.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-3 line-clamp-1">{course.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span>{course.rating || '4.9'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} />
                          <span>{course.moduleCount ? `${course.moduleCount} modules` : course.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">KES {course.price.toLocaleString()}</span>
                        <Link to={`/course/${course.slug || course.id}`}>
                          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                            Learn More
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No courses featured yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
                Ready to Transform Your Life?
              </h2>
              <p className="text-white/70 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Join thousands of Kenyans learning new skills and building better futures
              </p>
              <Link to="/courses">
                <button className="bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:bg-white/90 transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-xl">
                  <span>Start Learning Today</span>
                  <ChevronRight size={20} />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
