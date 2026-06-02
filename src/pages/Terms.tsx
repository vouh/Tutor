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
      content: `By registering on this platform, you agree to these Terms of Service. If you do not agree, please do not use the platform.`
    },
    {
      icon: <Shield size={24} />,
      title: 'Eligibility',
      content: `This platform is open to learners who are at least 13 years old. Learners aged 13 to 17 may use the platform with parent or guardian awareness and support. By registering you confirm the information you provide is accurate and truthful.`
    },
    {
      icon: <Scale size={24} />,
      title: 'Course Enrollment & Access',
      content: `Once enrolled and payment is confirmed, you get full access to your course materials, live sessions, assignments, and tests for the duration of the course. Access is personal and non-transferable — you may not share your account with anyone else.`
    },
    {
      icon: <AlertCircle size={24} />,
      title: 'Payments',
      content: `All payments are made in Kenyan Shillings (KES). Your enrollment is confirmed only after payment is received and verified.`
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Refund Policy',
      content: `You are eligible for a full refund if:

• The course has not yet started, and you request within 5 business days of payment, or
• The instructor fails to deliver the course as outlined at the time of enrollment.

Refund requests must be submitted via email or phone. Refunds are processed within 5 business days of approval. No refunds will be issued once the course has begun and sessions have been delivered as promised.`
    },
    {
      icon: <Clock size={24} />,
      title: 'Student Conduct',
      content: `You agree to engage respectfully in all sessions, group chats, and interactions on the platform. Any form of harassment, cheating, or sharing of course materials without permission may result in immediate removal without a refund.`
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Assignments & Certification',
      content: `Completion of assignments, tests, and the final project is required to receive a certificate of completion. We reserve the right to withhold certificates where work is found to be plagiarized or incomplete.`
    },
    {
      icon: <Shield size={24} />,
      title: 'Intellectual Property',
      content: `All course content, videos, materials, and resources are owned by the platform. You may not reproduce, resell, or distribute any content without written permission.`
    },
    {
      icon: <Clock size={24} />,
      title: 'Changes to Courses',
      content: `We reserve the right to make reasonable adjustments to course schedules, instructors, or content. You will be notified in advance of any significant changes.`
    },
    {
      icon: <AlertCircle size={24} />,
      title: 'Limitation of Liability',
      content: `We are not responsible for outcomes after course completion including employment, income, or business results. We provide education and tools — results depend on your effort.`
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
              <p className="text-white/50 text-xs mt-4">Last updated: June 2026</p>
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
                <li>• You must be at least 13 years old to use TutorKE</li>
                <li>• Learners under 18 should have a parent or guardian aware of the enrollment</li>
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
              <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <p>For questions regarding these terms, reach us via email or phone.</p>
                <p>
                  <a href="mailto:tutorsupportteam@gmail.com" className="text-primary font-semibold hover:underline">
                    tutorsupportteam@gmail.com
                  </a>{' '}
                  ·{' '}
                  <a href="tel:0741739262" className="text-primary font-semibold hover:underline">
                    0741739262
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
