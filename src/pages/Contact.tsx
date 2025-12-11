import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeContact, setActiveContact] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const contactMethods = [
    { 
      id: 'whatsapp',
      icon: <MessageCircle size={24} />, 
      title: 'WhatsApp', 
      subtitle: 'Instant Support',
      value: '+254 700 123 456', 
      action: 'https://wa.me/254700123456',
      color: 'from-green-500 to-emerald-600',
      bgLight: 'bg-green-50'
    },
    { 
      id: 'phone',
      icon: <Phone size={24} />, 
      title: 'Call Us', 
      subtitle: 'Mon-Sat 8AM-6PM',
      value: '+254 700 123 456', 
      action: 'tel:+254700123456',
      color: 'from-blue-500 to-cyan-600',
      bgLight: 'bg-blue-50'
    },
    { 
      id: 'email',
      icon: <Mail size={24} />, 
      title: 'Email', 
      subtitle: '24hr Response',
      value: 'info@tutorke.co.ke', 
      action: 'mailto:info@tutorke.co.ke',
      color: 'from-purple-500 to-violet-600',
      bgLight: 'bg-purple-50'
    },
    { 
      id: 'location',
      icon: <MapPin size={24} />, 
      title: 'Visit Us', 
      subtitle: 'Nairobi, Kenya',
      value: 'View on Maps', 
      action: 'https://maps.google.com',
      color: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50'
    },
  ];

  const faqs = [
    { q: 'How do I pay for courses?', a: 'We accept M-Pesa. Click "Buy Now" and enter your phone number.' },
    { q: 'Can I access on mobile?', a: 'Yes! Our platform works seamlessly on all devices.' },
    { q: 'What\'s your refund policy?', a: '7-day money-back guarantee on all courses.' },
    { q: 'How do I get course access?', a: 'Instant access after payment confirmation via M-Pesa.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SEO title="Contact Us" description="Get in touch with TutorKE for any questions about our courses." />
      <Header />
      
      <main className="flex-1">
        {/* Hero - Mobile First */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-20 pb-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Sparkles size={16} className="text-yellow-400" />
                We're here to help
              </span>
              <h1 className="font-montserrat text-3xl sm:text-4xl md:text-5xl font-bold">
                Get In Touch
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto">
                Have questions? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods - Mobile Cards */}
        <section className="-mt-20 relative z-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={method.id}
                  href={method.action}
                  target={method.id === 'location' ? '_blank' : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 text-center group cursor-pointer"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-3 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {method.icon}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{method.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{method.subtitle}</p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Column - WhatsApp CTA + FAQs */}
              <div className="lg:col-span-2 space-y-6">
                {/* WhatsApp Primary CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <MessageCircle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Quick Chat</h3>
                        <p className="text-white/80 text-sm">Get instant help</p>
                      </div>
                    </div>
                    <p className="text-white/90 text-sm mb-5">
                      Chat with our team on WhatsApp for faster responses during business hours.
                    </p>
                    <a
                      href="https://wa.me/254700123456?text=Hello%20TutorKE"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white text-green-600 px-5 py-3 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors w-full justify-center sm:w-auto"
                    >
                      <MessageCircle size={18} />
                      Start WhatsApp Chat
                    </a>
                  </div>
                </motion.div>

                {/* FAQs */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700"
                >
                  <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Quick Answers</h3>
                  <div className="space-y-3">
                    {faqs.map((faq, index) => (
                      <div 
                        key={index}
                        className="border-b border-slate-100 dark:border-slate-700 pb-3 last:border-0 last:pb-0"
                      >
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">{faq.q}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Contact Form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-100 dark:border-slate-700"
              >
                <div className="mb-6">
                  <h2 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-2">Send a Message</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">We'll get back to you within 24 hours</p>
                </div>
                
                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-500" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">Message Sent!</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">We'll respond within 24 hours.</p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit} 
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Kamau"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="0712 345 678"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
                        <select
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        >
                          <option value="">Select topic</option>
                          <option value="courses">Course Inquiry</option>
                          <option value="payment">Payment Issue</option>
                          <option value="technical">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="How can we help you?"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none placeholder:text-slate-400"
                        ></textarea>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        Send Message
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Business Hours</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mon - Sat: 8:00 AM - 6:00 PM EAT</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Response time: Within 24 hours
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
