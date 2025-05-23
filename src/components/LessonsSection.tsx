
import React from 'react';

const LessonsSection = () => {
  const lessons = [
    {
      id: 1,
      title: 'Math Fundamentals',
      description: 'Master basic arithmetic and problem-solving skills with our interactive math lessons.',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Reading Comprehension',
      description: 'Improve reading skills and understanding through engaging stories and exercises.',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Science Exploration',
      description: 'Discover the wonders of science through hands-on experiments and explanations.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: 'Creative Writing',
      description: 'Express yourself through creative writing exercises and storytelling techniques.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop'
    }
  ];

  return (
    <section className="bg-white min-h-[400px] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-montserrat text-2xl text-tutor-primary font-semibold text-center mb-6">
          Quick Lessons
        </h2>
        <p className="font-open-sans text-lg text-tutor-text text-center max-w-3xl mx-auto mb-12">
          Get a taste of our tutoring services with our quick lessons. Our experienced tutors will guide you through interactive and engaging lessons.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img
                src={lesson.image}
                alt={lesson.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-montserrat text-lg text-tutor-primary font-semibold mb-3">
                  {lesson.title}
                </h3>
                <p className="font-open-sans text-sm text-tutor-text leading-relaxed">
                  {lesson.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LessonsSection;
