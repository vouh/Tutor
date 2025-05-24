
import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

const JoinStudentsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const students = [
    {
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face',
      name: 'Aisha Mwangi',
      achievement: 'KCSE Grade A- in Mathematics',
      quote: 'Tutor helped me excel in mathematics and secure my spot at the University of Nairobi!'
    },
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      name: 'David Kiprop',
      achievement: 'KCPE 420/500 marks',
      quote: 'The personalized learning approach made all subjects easier to understand.'
    },
    {
      image: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=300&h=300&fit=crop&crop=face',
      name: 'Grace Wanjiku',
      achievement: 'Top 1% in Chemistry',
      quote: 'My chemistry grades improved dramatically thanks to expert tutoring sessions.'
    },
    {
      image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=300&h=300&fit=crop&crop=face',
      name: 'Michael Ochieng',
      achievement: 'University Scholarship Winner',
      quote: 'Tutor not only improved my grades but also prepared me for university success.'
    }
  ];

  return (
    <section className="bg-tutor-gray py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="font-montserrat text-3xl text-tutor-primary font-semibold mb-8">
          Join Our Community of Successful Kenyan Students
        </h2>
        <p className="font-open-sans text-lg text-tutor-text mb-12 max-w-3xl mx-auto">
          Our students have excelled in KCSE, KCPE, and university entrance exams. Join our growing community and achieve academic excellence!
        </p>
        
        <div className="relative max-w-4xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {students.map((student, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center space-y-6 py-8">
                    <img
                      src={student.image}
                      alt={student.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                    />
                    <div className="text-center space-y-3">
                      <h3 className="font-montserrat text-xl font-semibold text-tutor-primary">
                        {student.name}
                      </h3>
                      <p className="font-open-sans text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                        {student.achievement}
                      </p>
                      <blockquote className="font-open-sans text-lg text-tutor-text italic max-w-2xl mx-auto">
                        "{student.quote}"
                      </blockquote>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-tutor-primary text-white hover:bg-opacity-90 border-none" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-tutor-primary text-white hover:bg-opacity-90 border-none" />
          </Carousel>
        </div>
        
        <div className="mt-8 flex justify-center space-x-2">
          {students.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JoinStudentsSection;
