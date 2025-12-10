
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { BookOpen, Users, Award, TrendingUp, ChevronRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-montserrat text-4xl font-bold text-center mb-12">Why Choose Tutor Kenya</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <BookOpen className="text-primary mx-auto mb-4" size={48} />
                <h3 className="font-montserrat text-xl font-bold mb-2">Expert Tutors</h3>
                <p className="font-open-sans text-muted-foreground">Learn from qualified educators</p>
              </div>
              <div className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <Users className="text-primary mx-auto mb-4" size={48} />
                <h3 className="font-montserrat text-xl font-bold mb-2">10,000+ Students</h3>
                <p className="font-open-sans text-muted-foreground">Join our thriving community</p>
              </div>
              <div className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <Award className="text-primary mx-auto mb-4" size={48} />
                <h3 className="font-montserrat text-xl font-bold mb-2">95% Success Rate</h3>
                <p className="font-open-sans text-muted-foreground">Proven results in KCSE & KCPE</p>
              </div>
              <div className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <TrendingUp className="text-primary mx-auto mb-4" size={48} />
                <h3 className="font-montserrat text-xl font-bold mb-2">Personalized Learning</h3>
                <p className="font-open-sans text-muted-foreground">Tailored to your needs</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-montserrat text-4xl font-bold mb-6">Ready to Excel in Your Studies?</h2>
            <p className="font-open-sans text-xl mb-8">Join thousands of Kenyan students achieving academic excellence</p>
            <Link to="/auth">
              <button className="bg-white text-primary px-8 py-4 rounded-xl font-montserrat font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center space-x-2">
                <span>Get Started Today</span>
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
