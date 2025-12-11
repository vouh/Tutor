import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { Brain, Code, Heart, TrendingUp, Wallet, Palette, ChevronRight, Play, Shield, Smartphone, Clock, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const featuredCourses = [
    {
      id: 1,
      title: 'ChatGPT & AI Mastery',
      category: 'AI & Tech',
      price: 2500,
      rating: 4.9,
      students: 1250,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'Python for Beginners',
      category: 'Coding',
      price: 3000,
      rating: 4.8,
      students: 980,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'Personal Finance Mastery',
      category: 'Finance',
      price: 2500,
      rating: 4.8,
      students: 1100,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'
    },
  ];

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
    <div className="min-h-screen flex flex-col bg-background">
      <SEO 
        title="Home" 
        description="TutorKE - Kenya's leading e-learning platform for AI, coding, personal development, and more."
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Why Learn With Us
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Premium courses designed for the modern Kenyan learner
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border rounded-xl p-6 text-center hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 sm:py-20 bg-muted">
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
              {featuredCourses.map((course, index) => (
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
                      src={course.image}
                      alt={course.title}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-primary">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-3">{course.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{course.students.toLocaleString()} students</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-primary">KES {course.price.toLocaleString()}</span>
                      <Link to={`/course/${course.id}`}>
                        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                          Enroll Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
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
