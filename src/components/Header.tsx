import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, BookOpen, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const location = useLocation();

  // Check if we're on pages that need solid header background
  const needsSolidBg = ['/courses', '/contact', '/dashboard', '/admin'].some(
    path => location.pathname.startsWith(path)
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const openAuth = (tab: 'login' | 'signup') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Determine text colors based on scroll and page
  const showSolidBg = scrolled || needsSolidBg;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showSolidBg 
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg py-2' 
            : 'bg-gradient-to-b from-black/50 to-transparent py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={18} />
              </div>
              <span className={`font-montserrat font-bold text-lg transition-colors ${
                showSolidBg ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}>
                Tutor<span className="text-primary">KE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : showSolidBg 
                        ? 'text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/5' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Login Button */}
              <button 
                onClick={() => openAuth('login')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  showSolidBg 
                    ? 'text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/5' 
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <User size={16} />
                Login
              </button>

              {/* Sign Up Button */}
              <button 
                onClick={() => openAuth('signup')}
                className="bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                showSolidBg ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-900 border-t shadow-xl"
            >
              <nav className="px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-2 border-t mt-2">
                  <button 
                    onClick={() => openAuth('login')}
                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left flex items-center gap-2"
                  >
                    <User size={18} />
                    Login
                  </button>
                  <button 
                    onClick={() => openAuth('signup')}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white px-4 py-3.5 rounded-xl text-sm font-semibold"
                  >
                    Get Started Free
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultTab={authTab}
      />
    </>
  );
};

export default Header;
