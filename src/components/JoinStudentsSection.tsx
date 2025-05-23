
import React from 'react';

const JoinStudentsSection = () => {
  const studentImages = [
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop&crop=face'
  ];

  return (
    <section className="bg-tutor-gray h-[300px] flex flex-col justify-center items-center px-4">
      <h2 className="font-montserrat text-2xl text-tutor-primary font-semibold mb-6">
        Join Our Community of Students
      </h2>
      <p className="font-open-sans text-lg text-tutor-text text-center max-w-2xl mb-8">
        Our students have seen significant improvements in their grades and confidence. Join our community today and start achieving your goals!
      </p>
      <div className="flex space-x-4">
        {studentImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Student ${index + 1}`}
            className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300"
          />
        ))}
      </div>
    </section>
  );
};

export default JoinStudentsSection;
