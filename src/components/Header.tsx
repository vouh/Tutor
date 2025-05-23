
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white h-20 px-8 border-b border-gray-200 flex items-center justify-between shadow-sm">
      <div className="font-montserrat text-3xl font-bold tracking-wide" style={{ color: '#6d074d' }}>
        Tutor
      </div>
      <nav className="flex space-x-8">
        <a href="#" className="font-open-sans text-lg hover:scale-105 transition-all duration-300" style={{ color: '#6d074d' }}>
          Home
        </a>
        <a href="#" className="font-open-sans text-lg hover:scale-105 transition-all duration-300" style={{ color: '#6d074d' }}>
          About
        </a>
        <a href="#" className="font-open-sans text-lg hover:scale-105 transition-all duration-300" style={{ color: '#6d074d' }}>
          Courses
        </a>
        <a href="#" className="font-open-sans text-lg hover:scale-105 transition-all duration-300" style={{ color: '#6d074d' }}>
          Pricing
        </a>
        <a href="#" className="font-open-sans text-lg hover:scale-105 transition-all duration-300" style={{ color: '#6d074d' }}>
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;
