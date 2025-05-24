
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white h-24 px-8 border-b border-gray-200 flex items-center justify-between shadow-lg relative">
      {/* Brand Section */}
      <div className="relative group">
        <div className="font-montserrat text-4xl font-bold tracking-wide transition-all duration-300 group-hover:scale-110" style={{ color: '#6d074d' }}>
          Tutor
        </div>
        <div className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 group-hover:w-full"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex space-x-2">
        {['Home', 'About', 'Courses', 'Pricing', 'Contact'].map((item, index) => (
          <div key={item} className="relative group">
            <a 
              href="#" 
              className="font-open-sans text-lg px-6 py-3 rounded-lg relative overflow-hidden transition-all duration-300 transform hover:scale-105"
              style={{ color: '#6d074d' }}
            >
              {/* Background hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
              
              {/* Text */}
              <span className="relative z-10 transition-all duration-300 group-hover:font-semibold">
                {item}
              </span>
              
              {/* Bottom border animation */}
              <div className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-400 group-hover:w-3/4 group-hover:left-1/8 transform -translate-x-1/2"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-purple-400 to-pink-400 blur-sm"></div>
            </a>
            
            {/* Floating indicator */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-1"></div>
          </div>
        ))}
      </nav>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"></div>
    </header>
  );
};

export default Header;
