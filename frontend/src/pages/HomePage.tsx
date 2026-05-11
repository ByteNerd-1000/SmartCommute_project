import React from 'react';
import { HeroSection, FeaturesSection, StatsSection } from '../components/LandingPageSections';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-blue-50 to-cyan-100 dark:bg-gradient-to-b dark:from-slate-800 dark:to-blue-950 transition-colors duration-300 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
            <defs>
              <pattern id="cta-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 50 20 Q 70 40 50 60" stroke="#0ea5e9" strokeWidth="1" fill="none" opacity="0.4" />
                <circle cx="100" cy="50" r="3" fill="#06b6d4" opacity="0.4" />
                <path d="M 30 100 L 70 100" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="1000" height="1000" fill="url(#cta-pattern)" />
          </svg>
        </div>

        {/* Animated elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 right-20 w-32 h-32 bg-blue-400 dark:bg-blue-600 rounded-full blur-2xl opacity-20 dark:opacity-10"
            animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-20 w-32 h-32 bg-cyan-400 dark:bg-cyan-600 rounded-full blur-2xl opacity-20 dark:opacity-10"
            animate={{ scale: [1, 1.1, 1], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Zap className="w-12 h-12 text-blue-600 dark:text-cyan-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to optimize your commute?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Get started with CityRoute Smart Ai and save time and money on every trip
            </p>
            <a
              href="/search"
              className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-cyan-500/50 transition-all"
            >
              Start Planning Now
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
