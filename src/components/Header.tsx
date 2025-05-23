
import React from 'react';

const Header = () => {
  return (
    <header className="bg-black h-20 px-8 border-b border-gray-800 flex items-center justify-between shadow-lg">
      <div className="font-montserrat text-3xl text-white font-bold tracking-wide">
        TUTOR
      </div>
      <nav className="flex space-x-8">
        <a href="#" className="font-open-sans text-lg text-gray-300 no-underline hover:text-white transition-all duration-300 hover:scale-105">
          Home
        </a>
        <a href="#" className="font-open-sans text-lg text-gray-300 no-underline hover:text-white transition-all duration-300 hover:scale-105">
          About
        </a>
        <a href="#" className="font-open-sans text-lg text-gray-300 no-underline hover:text-white transition-all duration-300 hover:scale-105">
          Courses
        </a>
        <a href="#" className="font-open-sans text-lg text-gray-300 no-underline hover:text-white transition-all duration-300 hover:scale-105">
          Pricing
        </a>
        <a href="#" className="font-open-sans text-lg text-gray-300 no-underline hover:text-white transition-all duration-300 hover:scale-105">
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;
