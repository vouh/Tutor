import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Contact Us" description="Get in touch with TutorKE for any questions about our courses." />
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-primary/50 text-white py-16 sm:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-montserrat text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Contact Cards */}
        <section className="py-6 -mt-8 relative z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: <Phone size={20} />, title: 'Call Us', value: '+254 700 123 456', color: 'bg-green-500' },
                { icon: <Mail size={20} />, title: 'Email', value: 'info@tutorke.co.ke', color: 'bg-blue-500' },
                { icon: <MapPin size={20} />, title: 'Location', value: 'Nairobi, Kenya', color: 'bg-purple-500' },
                { icon: <Clock size={20} />, title: 'Hours', value: 'Mon-Sat: 8AM-6PM', color: 'bg-orange-500' },
              ].map((item, index) => (
                <motion.div 
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card p-4 sm:p-5 rounded-xl shadow-lg text-center border"
                >
                  <div className={`${item.color} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 text-white`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* WhatsApp & Info */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* WhatsApp Card */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <MessageCircle size={28} />
                    </div>
                    <div>
                      <h3 className="font-montserrat text-2xl font-bold">Chat on WhatsApp</h3>
                      <p className="opacity-90 text-sm">Get instant support</p>
                    </div>
                  </div>
                  <p className="mb-6 opacity-90">
                    Prefer chatting? Reach us on WhatsApp for quick responses during working hours.
                  </p>
                  <a
                    href="https://wa.me/254700123456?text=Hello%20Tutor%20Kenya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle size={20} />
                    <span>Start Chat</span>
                  </a>
                </div>

                {/* FAQ */}
                <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
                  <h3 className="font-montserrat text-xl font-bold mb-6">Quick Answers</h3>
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <h4 className="font-semibold mb-1">How do I pay for courses?</h4>
                      <p className="text-muted-foreground text-sm">We accept M-Pesa. Click "Buy Now" and enter your phone number.</p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <h4 className="font-semibold mb-1">Can I access on mobile?</h4>
                      <p className="text-muted-foreground text-sm">Yes! Our platform works on all devices.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Refund policy?</h4>
                      <p className="text-muted-foreground text-sm">7-day money-back guarantee on all courses.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card p-8 rounded-2xl shadow-lg border border-border"
              >
                <h2 className="font-montserrat text-2xl font-bold mb-6">Send Us a Message</h2>
                
                {formSubmitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-green-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-green-600 mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="John Kamau"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                          type="tel"
                          required
                          className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="0712 345 678"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      >
                        <option value="">Select a subject</option>
                        <option value="courses">Course Inquiry</option>
                        <option value="payment">Payment Issue</option>
                        <option value="technical">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send size={20} />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
