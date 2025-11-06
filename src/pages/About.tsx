import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Award, Target, Users, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-montserrat text-5xl font-bold mb-6">About Tutor Kenya</h1>
            <p className="font-open-sans text-xl max-w-3xl">
              Transforming education in Kenya through personalized learning and expert guidance
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Target className="text-primary" size={32} />
                  <h2 className="font-montserrat text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="font-open-sans text-lg text-muted-foreground leading-relaxed">
                  To empower every Kenyan student with access to quality education through personalized tutoring, 
                  innovative learning methods, and dedicated support that helps them achieve their academic goals 
                  and unlock their full potential.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Award className="text-primary" size={32} />
                  <h2 className="font-montserrat text-3xl font-bold">Our Vision</h2>
                </div>
                <p className="font-open-sans text-lg text-muted-foreground leading-relaxed">
                  To become Kenya's leading educational platform, recognized for transforming lives through 
                  excellence in tutoring and creating a generation of confident, knowledgeable, and 
                  successful learners ready to shape the future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="font-montserrat text-5xl font-bold text-primary mb-2">10,000+</div>
                <div className="font-open-sans text-muted-foreground">Students</div>
              </div>
              <div className="text-center">
                <div className="font-montserrat text-5xl font-bold text-primary mb-2">500+</div>
                <div className="font-open-sans text-muted-foreground">Expert Tutors</div>
              </div>
              <div className="text-center">
                <div className="font-montserrat text-5xl font-bold text-primary mb-2">95%</div>
                <div className="font-open-sans text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="font-montserrat text-5xl font-bold text-primary mb-2">47</div>
                <div className="font-open-sans text-muted-foreground">Counties</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-montserrat text-4xl font-bold text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <Users className="text-primary mb-4" size={40} />
                <h3 className="font-montserrat text-2xl font-bold mb-4">Student-Centered</h3>
                <p className="font-open-sans text-muted-foreground">
                  Every decision we make prioritizes the success and well-being of our students.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <BookOpen className="text-primary mb-4" size={40} />
                <h3 className="font-montserrat text-2xl font-bold mb-4">Excellence</h3>
                <p className="font-open-sans text-muted-foreground">
                  We maintain the highest standards in education and continuously strive for improvement.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <Award className="text-primary mb-4" size={40} />
                <h3 className="font-montserrat text-2xl font-bold mb-4">Integrity</h3>
                <p className="font-open-sans text-muted-foreground">
                  We operate with honesty, transparency, and accountability in all our interactions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
