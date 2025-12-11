import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const categories = [
    'AI & Tech',
    'Coding',
    'Mental Health',
    'Personal Dev',
    'Finance',
    'Creative',
  ];

  return (
    <footer className="bg-slate-900 text-white">
      {/* CTA Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-montserrat text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to start learning?
              </h3>
              <p className="text-white/80">Join thousands of learners and transform your life today.</p>
            </div>
            <Link to="/courses">
              <button className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 whitespace-nowrap">
                Browse Courses
                <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="font-montserrat font-bold text-xl text-white">
                Tutor<span className="text-primary">KE</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Kenya's leading e-learning platform for personal and professional growth.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Facebook size={18} />, href: '#' },
                { icon: <Twitter size={18} />, href: '#' },
                { icon: <Instagram size={18} />, href: '#' },
                { icon: <Linkedin size={18} />, href: '#' },
                { icon: <Youtube size={18} />, href: '#' },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="w-9 h-9 bg-slate-800 hover:bg-primary rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: '/' },
                { name: 'Courses', path: '/courses' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-slate-400 hover:text-primary text-sm transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link 
                    to={`/courses?category=${cat}`} 
                    className="text-slate-400 hover:text-primary text-sm transition-colors duration-300"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <a href="mailto:info@tutorke.co.ke" className="flex items-center gap-3 text-slate-400 hover:text-primary text-sm transition-colors">
                <Mail size={16} className="text-primary" />
                info@tutorke.co.ke
              </a>
              <a href="tel:+254700123456" className="flex items-center gap-3 text-slate-400 hover:text-primary text-sm transition-colors">
                <Phone size={16} className="text-primary" />
                +254 700 123 456
              </a>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin size={16} className="text-primary mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 TutorKE. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-slate-500 hover:text-primary text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-slate-500 hover:text-primary text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
