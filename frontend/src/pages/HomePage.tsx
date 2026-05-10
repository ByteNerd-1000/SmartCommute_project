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
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Zap className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to optimize your commute?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Get started with SmartCommute and save time and money on every trip
            </p>
            <a
              href="/search"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all"
            >
              Start Planning Now
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
