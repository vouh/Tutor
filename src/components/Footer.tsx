import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="font-montserrat text-3xl font-bold tracking-wide text-primary">
              Tutor Kenya
            </div>
            <p className="font-open-sans text-muted-foreground text-sm leading-relaxed">
              Empowering Kenyan students to achieve academic excellence through personalized learning and expert guidance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="font-open-sans text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">Home</Link></li>
              <li><Link to="/about" className="font-open-sans text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">About Us</Link></li>
              <li><Link to="/courses" className="font-open-sans text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">Courses</Link></li>
              <li><Link to="/resources" className="font-open-sans text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">Resources</Link></li>
              <li><Link to="/pricing" className="font-open-sans text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">Pricing</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold">Our Services</h3>
            <ul className="space-y-3">
              <li className="font-open-sans text-muted-foreground text-sm">KCSE Preparation</li>
              <li className="font-open-sans text-muted-foreground text-sm">KCPE Preparation</li>
              <li className="font-open-sans text-muted-foreground text-sm">1-on-1 Tutoring</li>
              <li className="font-open-sans text-muted-foreground text-sm">Group Sessions</li>
              <li className="font-open-sans text-muted-foreground text-sm">Online Learning</li>
              <li className="font-open-sans text-muted-foreground text-sm">Study Resources</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail size={16} className="text-primary mt-1" />
                <div>
                  <p className="font-open-sans text-muted-foreground text-sm">info@tutorkenya.co.ke</p>
                  <p className="font-open-sans text-muted-foreground text-sm">support@tutorkenya.co.ke</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-primary mt-1" />
                <div>
                  <p className="font-open-sans text-muted-foreground text-sm">+254 700 123 456</p>
                  <p className="font-open-sans text-muted-foreground text-sm">+254 711 987 654</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary mt-1" />
                <p className="font-open-sans text-muted-foreground text-sm">
                  Westlands Road<br />
                  Nairobi, Kenya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-border px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="font-open-sans text-sm text-muted-foreground">
            © 2025 Tutor Kenya. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <Link to="#" className="font-open-sans text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="font-open-sans text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <span className="font-open-sans text-sm text-muted-foreground">Trusted by 10,000+ students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
