
import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, BookOpen, Users, Award, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#6d074d' }} className="text-white">
      {/* Main Footer Content */}
      <div className="px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="font-montserrat text-3xl font-bold tracking-wide">
              Tutor
            </div>
            <p className="font-open-sans text-gray-300 text-sm leading-relaxed">
              Empowering minds across Kenya. Experience world-class education with personalized learning and expert guidance tailored for the Kenyan student.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">Home</a></li>
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">About Us</a></li>
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">Our Courses</a></li>
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">Find a Tutor</a></li>
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">Become a Tutor</a></li>
              <li><a href="#" className="font-open-sans text-gray-300 hover:text-white transition-colors duration-300 text-sm">Success Stories</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold text-white">Our Services</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <BookOpen size={16} className="text-gray-400" />
                <span className="font-open-sans text-gray-300 text-sm">1-on-1 Tutoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users size={16} className="text-gray-400" />
                <span className="font-open-sans text-gray-300 text-sm">Group Sessions</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award size={16} className="text-gray-400" />
                <span className="font-open-sans text-gray-300 text-sm">KCSE/KCPE Preparation</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock size={16} className="text-gray-400" />
                <span className="font-open-sans text-gray-300 text-sm">24/7 Support</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-montserrat text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="font-open-sans text-gray-300 text-sm">info@tutor.co.ke</p>
                  <p className="font-open-sans text-gray-300 text-sm">support@tutor.co.ke</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-gray-400 mt-1" />
                <div>
                  <p className="font-open-sans text-gray-300 text-sm">+254 700 123 456</p>
                  <p className="font-open-sans text-gray-300 text-sm">+254 711 987 654</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <p className="font-open-sans text-gray-300 text-sm">
                  Westlands Road<br />
                  Nairobi, Kenya
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-purple-400 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="font-open-sans text-sm text-gray-400">
            © 2025 Tutor Kenya. All rights reserved. | Privacy Policy | Terms of Service | Cookie Policy
          </div>
          <div className="flex items-center space-x-6">
            <span className="font-open-sans text-sm text-gray-400">Trusted by 10,000+ Kenyan students</span>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
