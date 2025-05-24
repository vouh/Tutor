
import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Updated images to better represent Kenyan educational environment
  const heroImages = [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=500&fit=crop'
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
            alt={`Educational environment ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      ))}
      
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
        <h1 className="font-montserrat text-5xl text-white font-bold mb-6 max-w-4xl leading-tight">
          Unlock Your Academic Potential in Kenya
        </h1>
        <p className="font-open-sans text-2xl text-white mb-8 max-w-3xl">
          Excellence in KCSE, KCPE, and beyond with personalized learning experiences
        </p>
        <button className="bg-tutor-primary text-white font-montserrat text-lg px-5 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
          Start Learning Today
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
