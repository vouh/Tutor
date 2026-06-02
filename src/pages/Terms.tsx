import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { AlertCircle, BadgeCheck, FileText, Scale, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Terms = () => {
  const sections = [
    {
      icon: <FileText size={24} />,
      title: 'Acceptance of Terms',
      content: 'By registering on this platform, you agree to these Terms of Service. If you do not agree, please do not use the platform.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Eligibility',
      content: 'This platform is open to learners who are at least 13 years old. Learners aged 13 to 17 may use the platform with parent or guardian awareness and support. By registering you confirm the information you provide is accurate and truthful.'
    },
    {
      icon: <Scale size={24} />,
      title: 'Course Enrollment & Access',
      content: 'Once enrolled and payment is confirmed, you get full access to your course materials, live sessions, assignments, and tests for the duration of the course. Access is personal and non-transferable — you may not share your account with anyone else.'
    },
    {
      icon: <AlertCircle size={24} />,
      title: 'Payments',
      content: 'All payments are made in Kenyan Shillings (KES). Your enrollment is confirmed only after payment is received and verified.'
    },
    {
      icon: <BadgeCheck size={24} />,
      title: 'Refund Policy',
      content: 'You are eligible for a full refund if the course has not yet started and you request within 5 business days of payment, or if the instructor fails to deliver the course as outlined at the time of enrollment. Refund requests must be submitted via email or phone. Refunds are processed within 5 business days of approval. No refunds will be issued once the course has begun and sessions have been delivered as promised.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Student Conduct',
      content: 'You agree to engage respectfully in all sessions, group chats, and interactions on the platform. Any form of harassment, cheating, or sharing of course materials without permission may result in immediate removal without a refund.'
    },
    {
      icon: <BadgeCheck size={24} />,
      title: 'Assignments & Certification',
      content: 'Completion of assignments, tests, and the final project is required to receive a certificate of completion. We reserve the right to withhold certificates where work is found to be plagiarized or incomplete.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Intellectual Property',
      content: 'All course content, videos, materials, and resources are owned by the platform. You may not reproduce, resell, or distribute any content without written permission.'
    },
    {
      icon: <Sparkles size={24} />,
      title: 'Changes to Courses',
      content: 'We reserve the right to make reasonable adjustments to course schedules, instructors, or content. You will be notified in advance of any significant changes.'
    },
    {
      icon: <AlertCircle size={24} />,
      title: 'Limitation of Liability',
      content: 'We are not responsible for outcomes after course completion including employment, income, or business results. We provide education and tools — results depend on your effort.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SEO title="Terms of Service" description="TutorKE Terms of Service" />
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-24 pb-14">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <FileText size={32} />
              </div>
              <h1 className="font-montserrat text-3xl font-bold sm:text-4xl">Terms of Service</h1>
              <p className="mt-3 text-xs text-white/50">Last updated: June 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{section.icon}</div>
                    <div>
                      <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">{section.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <p>For questions regarding these terms, contact us at tutorsupportteam@gmail.com or 0741739262.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;