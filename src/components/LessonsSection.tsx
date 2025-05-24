
import React from 'react';

const LessonsSection = () => {
  const lessons = [
    {
      id: 1,
      title: 'Mathematics Mastery',
      description: 'Excel in KCSE Mathematics with comprehensive problem-solving techniques and exam strategies.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'English & Literature',
      description: 'Master English language and literature with focus on KCSE exam requirements and essay writing.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Sciences (Physics, Chemistry, Biology)',
      description: 'Comprehensive science education covering all three sciences with practical applications.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: 'Humanities & Social Studies',
      description: 'History, Geography, and CRE courses designed for KCSE excellence and university preparation.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop'
    }
  ];

  return (
    <section className="bg-white min-h-[400px] py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-montserrat text-2xl text-tutor-primary font-semibold text-center mb-6">
          Subject-Focused Learning
        </h2>
        <p className="font-open-sans text-lg text-tutor-text text-center max-w-3xl mx-auto mb-12">
          Specialized tutoring for KCSE subjects with experienced Kenyan educators who understand the curriculum and exam requirements.
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
