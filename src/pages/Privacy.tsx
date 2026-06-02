import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Database, Bell, Trash2, Globe, Mail, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Privacy = () => {
  const sections = [
    {
      icon: <Database size={24} />,
      title: 'Introduction',
      content: `We are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.`
    },
    {
      icon: <Database size={24} />,
      title: 'Data We Collect',
      content: `When you register or apply for a course, we collect:

• Full name
• Email address
• Phone number
• Age
• Location
• Whether you own a laptop or not

We collect only what is necessary to deliver the course and communicate with you effectively.`
    },
    {
      icon: <Eye size={24} />,
      title: 'How We Use Your Data',
      content: `Your information is used to:

• Process your enrollment and confirm payment
• Send you course materials, session links, and updates
• Add you to your cohort's communication group
• Assess equipment needs and tailor the learning experience
• Contact you regarding your application or course progress`
    },
    {
      icon: <Lock size={24} />,
      title: 'Data Sharing',
      content: `We do not sell, rent, or share your personal data with third parties for marketing purposes. Data may only be shared where required by law or to process your payment through a verified payment provider.`
    },
    {
      icon: <Globe size={24} />,
      title: 'Payments & Financial Data',
      content: `Payment is processed through trusted providers. We do not store your card or mobile money details on our servers. Transaction records are kept for accounting and refund purposes only.`
    },
    {
      icon: <Bell size={24} />,
      title: 'Data Storage & Security',
      content: `Your data is stored securely and access is restricted to authorized personnel only. We take reasonable measures to protect your information from unauthorized access, loss, or misuse.`
    },
    {
      icon: <Trash2 size={24} />,
      title: 'Data Retention',
      content: `We retain your data for as long as you are an active student or applicant. If you request deletion of your data, we will action this within 14 days unless we are legally required to retain it.`
    },
    {
      icon: <Shield size={24} />,
      title: 'Your Rights',
      content: `You have the right to:

• Access the personal data we hold about you
• Request correction of inaccurate data
• Request deletion of your data
• Withdraw consent for communications at any time

To exercise any of these rights, contact us via email or phone.`
    },
    {
      icon: <Bell size={24} />,
      title: 'Cookies',
      content: `Our platform may use cookies to improve your browsing experience and track session activity. You can disable cookies in your browser settings, though this may affect platform functionality.`
    },
    {
      icon: <Globe size={24} />,
      title: 'Children & Minors',
      content: `Our platform is intended for users aged 13 and above. Learners under 18 should have a parent or guardian aware of the enrollment.`
    },
    {
      icon: <Clock size={24} />,
      title: 'Changes to This Policy',
      content: `We may update this policy from time to time. Changes will be posted on this page with a revised date. Continued use of the platform after changes means you accept the updated policy.`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SEO title="Privacy Policy" description="TutorKE Privacy Policy - Learn how we collect, use, and protect your personal information." />
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-24 pb-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h1 className="font-montserrat text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-white/50 text-xs mt-4">Last updated: June 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6"
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Cookies</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We use essential cookies to keep you logged in and remember your preferences. 
                Analytics cookies help us understand how you use our platform. You can manage 
                cookie preferences in your browser settings.
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Questions About Privacy?</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                If you have any questions about this Privacy Policy or how we handle your data, 
                please don't hesitate to reach out.
              </p>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="mailto:tutorsupportteam@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Mail size={16} />
                  tutorsupportteam@gmail.com
                </a>
                <a 
                  href="tel:0741739262"
                  className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  0741739262
                </a>
                <a 
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Contact Form
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
