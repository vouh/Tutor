import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Code, Heart, Users, TrendingUp, Wallet, Palette, Dumbbell, Sparkles, ArrowRight, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { icon: <Brain size={20} />, label: 'AI & Tech', color: 'from-blue-500 to-cyan-500' },
    { icon: <Code size={20} />, label: 'Coding', color: 'from-green-500 to-emerald-500' },
    { icon: <Heart size={20} />, label: 'Mental Health', color: 'from-pink-500 to-rose-500' },
    { icon: <Users size={20} />, label: 'Relationships', color: 'from-purple-500 to-violet-500' },
    { icon: <TrendingUp size={20} />, label: 'Personal Dev', color: 'from-orange-500 to-amber-500' },
    { icon: <Wallet size={20} />, label: 'Finance', color: 'from-emerald-500 to-teal-500' },
    { icon: <Palette size={20} />, label: 'Creative', color: 'from-fuchsia-500 to-pink-500' },
    { icon: <Dumbbell size={20} />, label: 'Fitness', color: 'from-red-500 to-orange-500' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-primary/60" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-primary/30 rounded-full blur-3xl"
          style={{ top: '10%', left: '10%' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-accent/20 rounded-full blur-3xl"
          style={{ bottom: '20%', right: '10%' }}
          animate={{ x: [0, -40, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6"
        >
          <Sparkles className="text-yellow-400" size={14} />
          <span className="text-white/90 text-xs sm:text-sm font-medium">Kenya's #1 E-Learning Platform</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-montserrat text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
        >
          Learn Anything.
          <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Grow Everywhere.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-open-sans text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8"
        >
          Premium courses in AI, coding, personal development, and more. 
          Pay with M-Pesa and start learning instantly.
        </motion.p>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative max-w-xl mx-auto mb-8"
        >
          {/* Outer Glow */}
          <div 
            className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur transition-all duration-500 ${
              isFocused ? 'opacity-100' : 'opacity-40'
            }`}
          />
          
          {/* Search Container */}
          <form onSubmit={handleSearch} className="relative">
            <motion.div
              animate={{ scale: isFocused ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center">
                <div className="pl-4 sm:pl-5">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 py-4 px-3 sm:px-4 text-sm sm:text-base bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-800 dark:text-white"
                />
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-primary transition-colors hidden sm:block"
                >
                  <Mic size={18} />
                </button>
                <button
                  type="submit"
                  className="m-1.5 sm:m-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </form>

          {/* Search Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            <span className="text-white/50 text-xs sm:text-sm">Trending:</span>
            {['ChatGPT', 'Python', 'Investing', 'Self-Care'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/courses?search=${term}`)}
                className="text-xs sm:text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/15 px-3 py-1 rounded-full border border-white/10 transition-all duration-300"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto mb-12"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.label}
              onClick={() => navigate(`/courses?category=${cat.label}`)}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
            >
              <div className={`p-1.5 rounded-lg bg-gradient-to-r ${cat.color} text-white`}>
                {cat.icon}
              </div>
              <span className="text-white/80 text-xs sm:text-sm font-medium">{cat.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto"
        >
          {[
            { value: '5K+', label: 'Learners' },
            { value: '100+', label: 'Courses' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-white/50 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
