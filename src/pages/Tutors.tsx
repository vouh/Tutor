import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Star, Award, BookOpen } from 'lucide-react';

const Tutors = () => {
  const tutors = [
    {
      id: 1,
      name: 'Dr. James Kimani',
      subject: 'Mathematics & Physics',
      rating: 4.9,
      students: 450,
      experience: '12 years',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      qualifications: 'PhD in Mathematics'
    },
    {
      id: 2,
      name: 'Ms. Grace Wanjiku',
      subject: 'English & Literature',
      rating: 4.8,
      students: 380,
      experience: '10 years',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face',
      qualifications: 'MA in English Literature'
    },
    {
      id: 3,
      name: 'Mr. David Omondi',
      subject: 'Chemistry & Biology',
      rating: 4.9,
      students: 420,
      experience: '15 years',
      image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=300&h=300&fit=crop&crop=face',
      qualifications: 'MSc in Chemistry'
    },
    {
      id: 4,
      name: 'Ms. Sarah Akinyi',
      subject: 'History & CRE',
      rating: 4.7,
      students: 310,
      experience: '8 years',
      image: 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=300&h=300&fit=crop&crop=face',
      qualifications: 'BA in History'
    },
    {
      id: 5,
      name: 'Mr. Peter Mwangi',
      subject: 'Business Studies',
      rating: 4.8,
      students: 290,
      experience: '9 years',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
      qualifications: 'MBA, CPA'
    },
    {
      id: 6,
      name: 'Ms. Lucy Njeri',
      subject: 'Kiswahili',
      rating: 4.9,
      students: 340,
      experience: '11 years',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      qualifications: 'MA in Kiswahili'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-montserrat text-5xl font-bold mb-6">Meet Our Expert Tutors</h1>
            <p className="font-open-sans text-xl max-w-3xl">
              Learn from qualified, experienced educators passionate about your success
            </p>
          </div>
        </section>

        {/* Tutors Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative">
                    <img
                      src={tutor.image}
                      alt={tutor.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center space-x-1">
                      <Star size={16} className="fill-current" />
                      <span className="font-semibold">{tutor.rating}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="font-montserrat text-2xl font-bold">{tutor.name}</h3>
                    <p className="font-open-sans text-primary font-semibold">{tutor.subject}</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Award size={16} />
                        <span>{tutor.qualifications}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen size={16} />
                        <span>{tutor.experience} experience</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{tutor.students}+</span>
                        <span>students taught</span>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-montserrat font-semibold hover:bg-accent transition-colors">
                      Book Session
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

export default Tutors;
