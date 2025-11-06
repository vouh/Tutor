import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&h=600&fit=crop',
      title: 'Transform Your Future with Quality Education',
      description: 'Expert tutoring for KCSE, KCPE, and beyond. Join thousands of successful Kenyan students.',
      cta: 'Start Learning Today'
    },
    {
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=600&fit=crop',
      title: 'Personalized Learning for Every Student',
      description: 'One-on-one tutoring tailored to your learning style and academic goals.',
      cta: 'Find Your Tutor'
    },
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop',
      title: 'Excel in Your KCSE & KCPE Exams',
      description: 'Proven strategies and expert guidance to achieve top grades in your exams.',
      cta: 'Explore Courses'
    },
    {
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=600&fit=crop',
      title: 'Learn from the Best Tutors in Kenya',
      description: 'Connect with qualified educators passionate about your success.',
      cta: 'Meet Our Tutors'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
      ))}
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="font-montserrat text-5xl md:text-6xl text-white font-bold mb-6 leading-tight animate-fade-in">
              {slides[currentSlide].title}
            </h1>
            <p className="font-open-sans text-xl md:text-2xl text-white/90 mb-8 animate-fade-in">
              {slides[currentSlide].description}
            </p>
            <button className="bg-primary text-primary-foreground font-montserrat text-lg px-8 py-4 rounded-xl hover:bg-accent transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl animate-fade-in">
              {slides[currentSlide].cta}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
