
import React from 'react';

const JoinStudentsSection = () => {
  // Updated images to represent Kenyan students
  const studentImages = [
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face'
  ];

  return (
    <section className="bg-tutor-gray h-[300px] flex flex-col justify-center items-center px-4">
      <h2 className="font-montserrat text-2xl text-tutor-primary font-semibold mb-6">
        Join Our Community of Kenyan Students
      </h2>
      <p className="font-open-sans text-lg text-tutor-text text-center max-w-2xl mb-8">
        Our students have excelled in KCSE, KCPE, and university entrance exams. Join our growing community and achieve academic excellence!
      </p>
      <div className="flex space-x-4">
        {studentImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Kenyan Student ${index + 1}`}
            className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300"
          />
        ))}
      </div>
    </section>
  );
};

export default JoinStudentsSection;
