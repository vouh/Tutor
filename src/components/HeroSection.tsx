
import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const heroImages = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=500&fit=crop'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-[500px] overflow-hidden">
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Hero image ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}
      
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
        <h1 className="font-montserrat text-5xl text-white font-bold mb-6 max-w-4xl leading-tight">
          Unlock Your Child's Potential
        </h1>
        <p className="font-open-sans text-2xl text-white mb-8 max-w-3xl">
          Get personalized learning experiences for your child and see the difference
        </p>
        <button className="bg-tutor-primary text-white font-montserrat text-lg px-5 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
