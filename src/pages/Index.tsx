import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { BookOpen, Users, Award, TrendingUp, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const features = [
    {
      icon: <BookOpen className="text-primary mx-auto mb-4" size={48} />,
      title: "Expert Tutors",
      description: "Learn from qualified educators"
    },
    {
      icon: <Users className="text-primary mx-auto mb-4" size={48} />,
      title: "10,000+ Students",
      description: "Join our thriving community"
    },
    {
      icon: <Award className="text-primary mx-auto mb-4" size={48} />,
      title: "95% Success Rate",
      description: "Proven results in KCSE & KCPE"
    },
    {
      icon: <TrendingUp className="text-primary mx-auto mb-4" size={48} />,
      title: "Personalized Learning",
      description: "Tailored to your needs"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Home" 
        description="Tutor Kenya - The leading e-learning platform for KCSE, KCPE, and professional courses in Kenya."
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-montserrat text-4xl font-bold text-center mb-12"
            >
              Why Choose Tutor Kenya
            </motion.h2>
            <div className="grid md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-8 rounded-xl text-center hover:shadow-lg transition-shadow"
                >
                  {feature.icon}
                  <h3 className="font-montserrat text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="font-open-sans text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="font-montserrat text-4xl font-bold mb-6">Ready to Excel in Your Studies?</h2>
              <p className="font-open-sans text-xl mb-8">Join thousands of Kenyan students achieving academic excellence</p>
              <Link to="/auth">
                <button className="bg-white text-primary px-8 py-4 rounded-xl font-montserrat font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-xl">
                  <span>Get Started Today</span>
                  <ChevronRight size={20} />
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
