import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-montserrat text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="font-open-sans text-xl max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-montserrat text-3xl font-bold mb-6">Contact Information</h2>
                  <p className="font-open-sans text-muted-foreground mb-8">
                    Reach out to us through any of the following channels. Our team is here to help you succeed.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4 bg-card p-6 rounded-xl shadow-md">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-montserrat font-semibold mb-1">Email</h3>
                      <p className="font-open-sans text-muted-foreground">info@tutorkenya.co.ke</p>
                      <p className="font-open-sans text-muted-foreground">support@tutorkenya.co.ke</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 bg-card p-6 rounded-xl shadow-md">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-montserrat font-semibold mb-1">Phone</h3>
                      <p className="font-open-sans text-muted-foreground">+254 700 123 456</p>
                      <p className="font-open-sans text-muted-foreground">+254 711 987 654</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 bg-card p-6 rounded-xl shadow-md">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-montserrat font-semibold mb-1">Location</h3>
                      <p className="font-open-sans text-muted-foreground">
                        Westlands Road<br />
                        Nairobi, Kenya
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 bg-card p-6 rounded-xl shadow-md">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-montserrat font-semibold mb-1">Working Hours</h3>
                      <p className="font-open-sans text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p className="font-open-sans text-muted-foreground">Saturday: 9:00 AM - 4:00 PM</p>
                      <p className="font-open-sans text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-card p-8 rounded-xl shadow-lg">
                <h2 className="font-montserrat text-3xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div>
                    <label className="block font-open-sans font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block font-open-sans font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block font-open-sans font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="block font-open-sans font-semibold mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block font-open-sans font-semibold mb-2">Message</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-montserrat font-semibold hover:bg-accent transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
