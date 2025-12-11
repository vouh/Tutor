import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, Lock, Eye, Database, Bell, Trash2, Globe, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Privacy = () => {
  const sections = [
    {
      icon: <Database size={24} />,
      title: 'Information We Collect',
      content: `We collect information to provide better services to our users:

**Personal Information:**
• Name and email address during registration
• Phone number for M-Pesa payments
• Profile information you choose to provide

**Usage Data:**
• Course progress and completion status
• Pages visited and features used
• Device information and browser type
• IP address and location (country level)`
    },
    {
      icon: <Eye size={24} />,
      title: 'How We Use Your Information',
      content: `Your information helps us:

• Provide and improve our educational services
• Process payments securely via M-Pesa
• Send course updates and important notifications
• Personalize your learning experience
• Analyze platform usage to improve features
• Prevent fraud and ensure platform security
• Comply with legal obligations`
    },
    {
      icon: <Lock size={24} />,
      title: 'Data Security',
      content: `We take the security of your data seriously:

• All data is encrypted in transit using SSL/TLS
• Payment information is processed securely through M-Pesa
• We never store your M-Pesa PIN or sensitive payment details
• Regular security audits and updates
• Access to personal data is restricted to authorized personnel
• We use Firebase and Supabase with enterprise-grade security`
    },
    {
      icon: <Globe size={24} />,
      title: 'Data Sharing',
      content: `We do NOT sell your personal information. We may share data with:

• **Payment processors** (Safaricom M-Pesa) to complete transactions
• **Course instructors** for enrolled students only
• **Analytics providers** in anonymized form
• **Legal authorities** when required by law

Third parties are bound by confidentiality agreements.`
    },
    {
      icon: <Bell size={24} />,
      title: 'Communications',
      content: `We may contact you regarding:

• Course purchases and payment confirmations
• Important updates to courses you're enrolled in
• Platform announcements and new features
• Marketing communications (with your consent)

You can opt out of marketing emails at any time through your account settings or by clicking "unsubscribe" in any email.`
    },
    {
      icon: <Trash2 size={24} />,
      title: 'Your Rights',
      content: `You have the right to:

• **Access** your personal data we hold
• **Correct** inaccurate information
• **Delete** your account and associated data
• **Export** your data in a portable format
• **Opt out** of marketing communications
• **Withdraw consent** for data processing

To exercise these rights, contact us at privacy@tutorke.co.ke`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <SEO title="Privacy Policy" description="TutorKE Privacy Policy - Learn how we collect, use, and protect your personal information." />
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
                <Shield size={32} />
              </div>
              <h1 className="font-montserrat text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto">
                Your privacy matters to us. Here's how we handle your data.
              </p>
              <p className="text-white/50 text-xs mt-4">Last updated: December 2025</p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 mb-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-600">
                  <Lock size={24} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-white">Your Data is Protected</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    We use industry-standard encryption and never sell your personal information.
                  </p>
                </div>
              </div>
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
                      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line prose-strong:text-slate-900 dark:prose-strong:text-white">
                        {section.content.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="text-slate-800 dark:text-slate-200">{part}</strong> : part
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cookie Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6"
            >
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">🍪 Cookies</h3>
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
                  href="mailto:privacy@tutorke.co.ke"
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors"
                >
                  <Mail size={16} />
                  privacy@tutorke.co.ke
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
