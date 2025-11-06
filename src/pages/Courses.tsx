import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Clock, Users, Star } from 'lucide-react';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'KCSE', 'KCPE', 'University', 'Professional'];

  const courses = [
    {
      id: 1,
      title: 'KCSE Mathematics Mastery',
      category: 'KCSE',
      description: 'Complete preparation for KCSE Mathematics with proven strategies',
      duration: '12 weeks',
      students: 1250,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'KCPE English Excellence',
      category: 'KCPE',
      description: 'Master English composition, comprehension, and grammar',
      duration: '10 weeks',
      students: 980,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'KCSE Chemistry Complete',
      category: 'KCSE',
      description: 'From basics to advanced chemistry concepts for KCSE',
      duration: '14 weeks',
      students: 856,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'KCPE Mathematics Foundation',
      category: 'KCPE',
      description: 'Build strong mathematical foundations for KCPE success',
      duration: '8 weeks',
      students: 1100,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=250&fit=crop'
    },
    {
      id: 5,
      title: 'University Calculus',
      category: 'University',
      description: 'Advanced calculus for university students',
      duration: '16 weeks',
      students: 450,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop'
    },
    {
      id: 6,
      title: 'Professional Accounting',
      category: 'Professional',
      description: 'CPA and professional accounting certification prep',
      duration: '20 weeks',
      students: 320,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop'
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
            <h1 className="font-montserrat text-5xl font-bold mb-6">Our Courses</h1>
            <p className="font-open-sans text-xl max-w-3xl">
              Comprehensive courses designed for Kenyan students at every level
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-lg font-montserrat font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card hover:bg-accent/10 text-foreground'
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {course.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-montserrat text-xl font-bold">{course.title}</h3>
                    <p className="font-open-sans text-muted-foreground">{course.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{course.students} students</span>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-montserrat font-semibold hover:bg-accent transition-colors">
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
