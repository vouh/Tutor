
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-tutor-primary text-white h-20 flex items-center justify-between px-8">
      <div className="font-open-sans text-sm">
        © 2023 Tutor. All rights reserved.
      </div>
      
      <div className="flex items-center space-x-8">
        <div className="flex space-x-4">
          <a href="#" className="font-open-sans text-sm hover:text-gray-300 transition-colors">
            Facebook
          </a>
          <a href="#" className="font-open-sans text-sm hover:text-gray-300 transition-colors">
            Twitter
          </a>
          <a href="#" className="font-open-sans text-sm hover:text-gray-300 transition-colors">
            Instagram
          </a>
        </div>
        
        <div className="border-l border-white border-opacity-30 pl-8">
          <div className="font-open-sans text-sm">
            <span>Email: info@tutor.com</span>
            <span className="ml-4">Phone: 123-456-7890</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
