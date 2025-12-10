import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Code, Heart, Users, TrendingUp, Wallet, Palette, Dumbbell, Sparkles } from 'lucide-react';
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
    { icon: <Brain size={24} />, label: 'AI & Tech', color: 'from-blue-500 to-cyan-500' },
    { icon: <Code size={24} />, label: 'Coding', color: 'from-green-500 to-emerald-500' },
    { icon: <Heart size={24} />, label: 'Mental Health', color: 'from-pink-500 to-rose-500' },
    { icon: <Users size={24} />, label: 'Relationships', color: 'from-purple-500 to-violet-500' },
    { icon: <TrendingUp size={24} />, label: 'Personal Dev', color: 'from-orange-500 to-amber-500' },
    { icon: <Wallet size={24} />, label: 'Finance', color: 'from-emerald-500 to-teal-500' },
    { icon: <Palette size={24} />, label: 'Creative', color: 'from-fuchsia-500 to-pink-500' },
    { icon: <Dumbbell size={24} />, label: 'Health & Fitness', color: 'from-red-500 to-orange-500' },
  ];

  const floatingElements = [
    { size: 60, top: '10%', left: '5%', delay: 0 },
    { size: 40, top: '20%', right: '10%', delay: 0.5 },
    { size: 80, bottom: '15%', left: '8%', delay: 1 },
    { size: 50, bottom: '25%', right: '5%', delay: 1.5 },
    { size: 35, top: '40%', left: '2%', delay: 2 },
    { size: 45, top: '60%', right: '3%', delay: 2.5 },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-primary/80 to-accent/70" />
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((el, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/5 backdrop-blur-sm"
            style={{
              width: el.size,
              height: el.size,
              top: el.top,
              left: el.left,
              right: el.right,
              bottom: el.bottom,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: el.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="text-yellow-400" size={16} />
          <span className="text-white/90 text-sm font-medium">Kenya's #1 E-Learning Platform</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-montserrat text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
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
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-open-sans text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10"
        >
          Premium courses in AI, coding, personal development, and more. 
          Pay with M-Pesa and start learning instantly.
        </motion.p>

        {/* 3D Animated Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-2xl mx-auto mb-12"
        >
          {/* Glow Effect */}
          <div 
            className={`absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl blur-lg transition-all duration-500 ${
              isFocused ? 'opacity-100 scale-105' : 'opacity-50'
            }`}
          />
          
          {/* Search Form */}
          <form 
            onSubmit={handleSearch}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{
                rotateX: isFocused ? 2 : 0,
                scale: isFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center">
                <div className="pl-6 text-primary">
                  <Search size={24} />
                </div>
                <input
                  type="text"
                  placeholder="Search for courses, subjects, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 py-5 px-4 text-lg bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-800"
                />
                <button
                  type="submit"
                  className="m-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </motion.div>
          </form>

          {/* Search Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 flex flex-wrap justify-center gap-2"
          >
            <span className="text-white/60 text-sm">Popular:</span>
            {['ChatGPT', 'Python', 'Mental Health', 'Investing', 'Relationships'].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/courses?search=${term}`)}
                className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all duration-300"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Category Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.label}
              onClick={() => navigate(`/courses?category=${cat.label}`)}
              className={`group relative p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300`}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${cat.color} text-white mb-2`}>
                {cat.icon}
              </div>
              <p className="text-white font-medium">{cat.label}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          {[
            { value: '5K+', label: 'Learners' },
            { value: '100+', label: 'Courses' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="currentColor"
            className="text-background"
            d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
