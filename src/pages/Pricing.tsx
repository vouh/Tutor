import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Basic',
      price: '2,500',
      period: 'per month',
      description: 'Perfect for individual learners',
      features: [
        '4 tutoring sessions per month',
        'Access to study materials',
        'Email support',
        'Progress tracking',
        'Group study sessions'
      ],
      popular: false
    },
    {
      name: 'Standard',
      price: '4,500',
      period: 'per month',
      description: 'Most popular choice',
      features: [
        '8 tutoring sessions per month',
        'All study materials',
        'Priority email & chat support',
        'Detailed progress reports',
        'Group & 1-on-1 sessions',
        'Past papers & exam prep'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: '7,500',
      period: 'per month',
      description: 'For serious students',
      features: [
        'Unlimited tutoring sessions',
        'Premium study materials',
        '24/7 support',
        'Weekly progress reports',
        'Personalized learning plan',
        'Exam strategy sessions',
        'Career guidance'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-montserrat text-5xl font-bold mb-6">Choose Your Plan</h1>
            <p className="font-open-sans text-xl max-w-3xl mx-auto">
              Affordable pricing for quality education. All plans include access to our expert tutors.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-card rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                    plan.popular ? 'ring-4 ring-primary scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                      Most Popular
                    </div>
                  )}
                  <h3 className="font-montserrat text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="font-open-sans text-muted-foreground text-sm mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="font-montserrat text-5xl font-bold">KSh {plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="text-primary flex-shrink-0 mt-1" size={20} />
                        <span className="font-open-sans text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-montserrat font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-accent'
                        : 'bg-muted text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    Get Started
                  </button>
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

export default Pricing;
