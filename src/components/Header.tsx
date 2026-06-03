import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import SiteSearch from './SiteSearch';
import { useAuth } from '@/contexts/AuthContext';
import tutorLogo from '../assets/tutor_logo.png';
import tutorLogoLight from '../assets/tutor_logo_light.png';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as { openAuthModal?: boolean; authTab?: 'login' | 'signup'; redirectTo?: string } | null;

  // Check if we're on pages that need solid header background
  const needsSolidBg = ['/course', '/courses', '/contact', '/dashboard', '/admin', '/search', '/terms', '/privacy'].some(
    path => location.pathname.startsWith(path)
  );

  useEffect(() => {
    if (routeState?.openAuthModal && !user) {
      setAuthTab(routeState.authTab || 'login');
      setAuthModalOpen(true);
    }
  }, [routeState, user]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

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
  const isHomePage = location.pathname === '/';
  const isDarkHeroHeader = isHomePage && !showSolidBg;
  const activeLogo = isDarkHeroHeader ? tutorLogoLight : tutorLogo;

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
              <img
                src={activeLogo}
                alt="TutorKE logo"
                className={`w-16 h-16 rounded-xl object-cover transition-all duration-300 ${
                  showSolidBg ? 'opacity-100' : 'opacity-90 drop-shadow-lg'
                }`}
              />
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

            {!isHomePage && (
              <div className="hidden lg:block w-80 xl:w-96">
                <SiteSearch
                  placeholder="Search courses and pages..."
                  className="w-full"
                  darkMode={false}
                />
              </div>
            )}

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      showSolidBg
                        ? 'text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/5'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User size={16} />
                    {profile?.displayName || 'Dashboard'}
                  </button>
                  <button
                    onClick={() => void logout()}
                    className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                      showSolidBg
                        ? 'border-slate-200 bg-white/90 text-slate-700 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200'
                        : 'border-white/35 bg-white/10 text-white/95 shadow-lg shadow-black/10 backdrop-blur-sm hover:border-white/60 hover:bg-white/18 hover:text-white'
                    }`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuth('login')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      showSolidBg 
                        ? 'text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/5' 
                        : 'border border-white/25 bg-white/12 text-white shadow-lg shadow-black/10 backdrop-blur-sm hover:border-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <User size={16} />
                    Login
                  </button>

                  <button 
                    onClick={() => openAuth('signup')}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                      showSolidBg
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                        : 'border border-white/20 bg-white/95 text-slate-900 shadow-lg shadow-black/10 hover:bg-white hover:shadow-xl'
                    }`}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                showSolidBg ? 'text-slate-900 dark:text-white' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar (left slide-in) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-[55] bg-slate-950/35 backdrop-blur-[1px] md:hidden"
              />

              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-[60] flex h-[100dvh] w-[min(22rem,88vw)] max-w-full flex-col overflow-hidden border-r border-slate-200 bg-white p-4 text-slate-900 shadow-2xl md:hidden"
              >
                <div className="mb-5 flex items-center justify-between">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-rose-500/10 ring-1 ring-primary/10">
                      <img src={activeLogo} alt="TutorKE logo" className="h-9 w-9 rounded-lg object-cover" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">TutorKE</p>
                      <p className="text-xs text-slate-500">Learn with focus</p>
                    </div>
                  </Link>
                  <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="mb-5">
                    <SiteSearch
                      placeholder="Search courses and pages..."
                      className="w-full"
                      darkMode={false}
                    />
                  </div>

                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                          isActive(item.path)
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/10'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}

                    {user ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          Dashboard
                        </Link>
                        <button
                          type="button"
                          onClick={() => { void logout(); setMobileMenuOpen(false); }}
                          className="w-full rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                          Logout
                        </button>
                      </>
                    ) : null}

                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-4">
                      {!user ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => openAuth('login')}
                            className="flex w-full items-center gap-2 rounded-2xl px-4 py-3.5 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <User size={18} />
                            Login
                          </button>
                          <button 
                            type="button"
                            onClick={() => openAuth('signup')}
                            className="w-full rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20"
                          >
                            Get Started Free
                          </button>
                        </>
                      ) : null}
                    </div>
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultTab={authTab}
        onSuccess={() => {
          if (routeState?.redirectTo) {
            navigate(routeState.redirectTo, { replace: true });
          }
        }}
      />
    </>
  );
};

export default Header;
