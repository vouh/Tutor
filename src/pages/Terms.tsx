import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, FileText, AlertCircle, CheckCircle, Scale, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Terms = () => {
  const sections = [
    {
      icon: <FileText size={24} />,
      title: 'Acceptance of Terms',
      content: `By accessing and using TutorKE's platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

These terms apply to all users of the platform, including students, instructors, and visitors.`
    },
    {
      icon: <Shield size={24} />,
      title: 'User Accounts',
      content: `To access certain features, you must create an account. You agree to:

• Provide accurate and complete information during registration
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized access
• Be responsible for all activities under your account

We reserve the right to suspend or terminate accounts that violate these terms.`
    },
    {
      icon: <Scale size={24} />,
      title: 'Course Access & Payments',
      content: `When you purchase a course on TutorKE:

• You receive a personal, non-transferable license to access the course content
• Payment is processed securely through M-Pesa and other approved methods
• Prices are displayed in Kenyan Shillings (KES)
• Course access is granted immediately upon successful payment confirmation

We offer a 7-day money-back guarantee on all courses if you're not satisfied.`
    },
    {
      icon: <AlertCircle size={24} />,
      title: 'Prohibited Conduct',
      content: `You agree NOT to:

• Share, resell, or distribute course content
• Use automated systems to access our platform
• Harass, abuse, or harm other users or instructors
• Upload malicious content or attempt to breach security
• Violate any applicable laws or regulations
• Create multiple accounts to abuse promotions

Violation of these rules may result in immediate account termination.`
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Intellectual Property',
      content: `All content on TutorKE, including courses, videos, text, graphics, and logos, is protected by intellectual property laws.

• Course content remains the property of respective instructors and TutorKE
• You may not reproduce, modify, or distribute any content without permission
• User-generated content (reviews, comments) grants us a license to display it
• Our trademarks and branding may not be used without written consent`
    },
    {
      icon: <Clock size={24} />,
      title: 'Modifications & Termination',
      content: `We reserve the right to:

• Modify these terms at any time with notice to users
• Discontinue or modify any part of our services
• Remove content that violates our policies
• Terminate accounts for violations

Continued use after changes constitutes acceptance of new terms.`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SEO title="Terms of Service" description="TutorKE Terms of Service - Read our terms and conditions for using our e-learning platform." />
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText size={32} />
              </div>
              <h1 className="font-montserrat text-3xl sm:text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
                Please read these terms carefully before using TutorKE
              </p>
              <p className="text-white/50 text-xs mt-4">Last updated: December 2025</p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Quick Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10"
            >
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-primary" />
                Quick Summary
              </h2>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• You must be 13+ years old to use TutorKE</li>
                <li>• Course purchases are for personal use only</li>
                <li>• We offer a 7-day money-back guarantee</li>
                <li>• Respect other users and instructors</li>
                <li>• Don't share or resell course content</li>
              </ul>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-primary">
                      {section.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">
                        {section.title}
                      </h3>
                      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Have questions about our terms?{' '}
                <a href="/contact" className="text-primary font-semibold hover:underline">
                  Contact us
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
