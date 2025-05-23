
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white h-20 px-5 border-b border-gray-300 flex items-center justify-between">
      <div className="font-open-sans text-2xl text-tutor-primary font-semibold">
        Tutor
      </div>
      <nav className="flex space-x-5">
        <a href="#" className="font-open-sans text-lg text-tutor-text no-underline hover:text-tutor-primary transition-colors">
          Home
        </a>
        <a href="#" className="font-open-sans text-lg text-tutor-text no-underline hover:text-tutor-primary transition-colors">
          About
        </a>
        <a href="#" className="font-open-sans text-lg text-tutor-text no-underline hover:text-tutor-primary transition-colors">
          Contact
        </a>
      </nav>
    </header>
  );
};

export default Header;
