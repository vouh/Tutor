import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import tutorLogo from '@/assets/tutor-logo.svg';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Tutors', path: '/tutors' },
    { name: 'Resources', path: '/resources' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src={tutorLogo} 
              alt="Tutor Kenya Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative px-4 py-2 font-open-sans text-sm font-medium text-foreground hover:text-primary transition-colors duration-300 group"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 bg-muted rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 origin-center"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-300"></div>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-montserrat font-semibold hover:bg-accent transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg font-open-sans text-foreground hover:bg-muted hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-montserrat font-semibold hover:bg-accent transition-colors">
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
