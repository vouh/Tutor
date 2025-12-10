import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Clock, Users, Star, Brain, Code, Heart, TrendingUp, Wallet, Palette, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All', icon: <BookOpen size={18} /> },
    { id: 'ai-tech', label: 'AI & Tech', icon: <Brain size={18} /> },
    { id: 'coding', label: 'Coding', icon: <Code size={18} /> },
    { id: 'mental-health', label: 'Mental Health', icon: <Heart size={18} /> },
    { id: 'relationships', label: 'Relationships', icon: <Users size={18} /> },
    { id: 'personal-dev', label: 'Personal Dev', icon: <TrendingUp size={18} /> },
    { id: 'finance', label: 'Finance', icon: <Wallet size={18} /> },
    { id: 'creative', label: 'Creative', icon: <Palette size={18} /> },
    { id: 'health-fitness', label: 'Health & Fitness', icon: <Dumbbell size={18} /> },
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

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-montserrat text-5xl font-bold mb-6"
            >
              Explore Our Courses
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-open-sans text-xl max-w-3xl"
            >
              From AI to wellness, coding to creativity — find courses that transform your life
            </motion.p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-muted sticky top-0 z-40 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card hover:bg-accent/10 text-foreground border'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold capitalize">
                        {course.category.replace('-', ' ')}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-montserrat text-lg font-bold line-clamp-2">{course.title}</h3>
                    <p className="font-open-sans text-muted-foreground text-sm line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{course.students}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-lg text-primary">KES {course.price.toLocaleString()}</span>
                      <Link to={`/course/${course.id}`}>
                        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent transition-colors">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No courses found in this category yet.</p>
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
