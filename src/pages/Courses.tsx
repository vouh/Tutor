import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentModal from '../components/PaymentModal';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Courses = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const testCourse = {
    id: 'test-001',
    title: 'Test Purchase Course',
    description:
      'Demo content used to validate STK Push payments. You will receive access immediately after the payment goes through.',
    duration: '1 week',
    students: 42,
    rating: 4.9,
    price: 2500,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary/40 text-white pt-24 pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mx-auto">
                <Sparkles size={16} className="text-yellow-300" />
                Live Test Payment
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-montserrat">
                Purchase the Test Course
              </h1>
              <p className="text-white/80 text-base sm:text-lg">
                This one course is dedicated to STK Push testing. Complete the payment of <strong>KES 2,500</strong> first to unlock the demo content.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative -mt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="grid lg:grid-cols-[1fr,0.9fr]">
                <div className="relative">
                  <img src={testCourse.image} alt={testCourse.title} className="h-64 w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm uppercase tracking-[0.2em] text-white/70">Demo Course</p>
                    <h2 className="text-2xl font-bold">{testCourse.title}</h2>
                  </div>
                </div>
                <div className="p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm">Price</p>
                      <p className="text-3xl font-bold text-primary">KES {testCourse.price.toLocaleString()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                      STK Push Only
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                    You must complete this payment to receive the simulated course access. This course is used to test the payment workflow before we roll out the full catalog.
                  </p>
                  <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <li>• Duration: {testCourse.duration}</li>
                    <li>• Students tested: {testCourse.students}</li>
                    <li>• Rating: {testCourse.rating}</li>
                    <li>• Access is granted immediately after successful payment</li>
                  </ul>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-2xl font-semibold hover:shadow-[0_15px_45px_rgba(244,63,94,0.25)] transition-all"
                  >
                    Buy & Receive STK Push
                  </button>
                  {accessGranted && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Payment confirmed! Refresh the page to see access status or head to your dashboard to continue testing.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        courseId={testCourse.id}
        courseName={testCourse.title}
        price={testCourse.price}
        onSuccess={() => {
          setAccessGranted(true);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default Courses;
