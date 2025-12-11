import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Clock, Users, Star, Brain, Code, Heart, TrendingUp, Wallet, Palette, Dumbbell, Search, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Courses', icon: <BookOpen size={16} /> },
    { id: 'ai-tech', label: 'AI & Tech', icon: <Brain size={16} /> },
    { id: 'coding', label: 'Coding', icon: <Code size={16} /> },
    { id: 'mental-health', label: 'Mental Health', icon: <Heart size={16} /> },
    { id: 'relationships', label: 'Relationships', icon: <Users size={16} /> },
    { id: 'personal-dev', label: 'Personal Dev', icon: <TrendingUp size={16} /> },
    { id: 'finance', label: 'Finance', icon: <Wallet size={16} /> },
    { id: 'creative', label: 'Creative', icon: <Palette size={16} /> },
    { id: 'health-fitness', label: 'Fitness', icon: <Dumbbell size={16} /> },
  ];

  const courses = [
    {
      id: 1,
      title: 'ChatGPT & AI Mastery',
      category: 'ai-tech',
      description: 'Learn to leverage AI tools for productivity and creativity',
      duration: '6 weeks',
      students: 1250,
      rating: 4.9,
      price: 2500,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'Python for Beginners',
      category: 'coding',
      description: 'Start your coding journey with Python from scratch',
      duration: '10 weeks',
      students: 980,
      rating: 4.8,
      price: 3000,
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'Managing Anxiety & Stress',
      category: 'mental-health',
      description: 'Practical techniques for mental wellness and peace',
      duration: '4 weeks',
      students: 856,
      rating: 4.9,
      price: 1500,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'Building Healthy Relationships',
      category: 'relationships',
      description: 'Communication skills and emotional intelligence',
      duration: '6 weeks',
      students: 720,
      rating: 4.7,
      price: 2000,
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop'
    },
    {
      id: 5,
      title: 'Personal Finance Mastery',
      category: 'finance',
      description: 'Budgeting, saving, and investing for Kenyans',
      duration: '8 weeks',
      students: 1100,
      rating: 4.8,
      price: 2500,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'
    },
    {
      id: 6,
      title: 'Graphic Design Fundamentals',
      category: 'creative',
      description: 'Master Canva, Figma and visual design principles',
      duration: '8 weeks',
      students: 650,
      rating: 4.6,
      price: 2000,
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop'
    },
    {
      id: 7,
      title: 'Home Workout Programs',
      category: 'health-fitness',
      description: 'Get fit without a gym - complete workout plans',
      duration: '12 weeks',
      students: 890,
      rating: 4.8,
      price: 1800,
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop'
    },
    {
      id: 8,
      title: 'Productivity & Time Management',
      category: 'personal-dev',
      description: 'Optimize your day and achieve your goals faster',
      duration: '4 weeks',
      students: 1500,
      rating: 4.9,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=250&fit=crop'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-20 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
                <Sparkles size={16} className="text-yellow-400" />
                {courses.length}+ Quality Courses
              </span>
              <h1 className="font-montserrat text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                Explore Our Courses
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
                From AI to wellness, coding to creativity — find courses that transform your life
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto"
            >
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="sticky top-[64px] z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Results Count */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredCourses.length}</span> courses
            {selectedCategory !== 'all' && (
              <> in <span className="font-semibold text-primary">{categories.find(c => c.id === selectedCategory)?.label}</span></>
            )}
          </p>
        </section>

        {/* Courses Grid */}
        <section className="pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-slate-900">{course.rating}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <span className="inline-block bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-xs font-semibold capitalize">
                        {course.category.replace('-', ' ')}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 min-h-[48px]">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-lg text-primary">
                          KES {course.price.toLocaleString()}
                        </span>
                        <Link to={`/course/${course.id}`}>
                          <button className="bg-slate-900 dark:bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary dark:hover:bg-primary/90 transition-colors">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
            
            {filteredCourses.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">No courses found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Try adjusting your search or filter</p>
                <button 
                  onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                  className="mt-4 text-primary font-semibold text-sm hover:underline"
                >
                  Clear filters
                </button>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Courses;
