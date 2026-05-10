import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Zap, Leaf, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-10"
          animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10"
          animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-block mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-semibold text-primary-300">🚀 Next-Gen Commuting</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Smart Commute,
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              Smarter Choices
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Intelligent multi-modal transportation optimization powered by AI. Find the cheapest, fastest, or most eco-friendly route instantly.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button 
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary-500/50 transition-all cursor-pointer"
            >
              Start Journey
            </button>
            <button className="px-8 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all">
              Learn More
            </button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              { icon: DollarSign, label: 'Best Fare', value: 'Save 30%' },
              { icon: Clock, label: 'Fastest Route', value: '20 min' },
              { icon: Leaf, label: 'Eco-Friendly', value: 'Carbon -40%' },
              { icon: Zap, label: 'AI Powered', value: '99% Accurate' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="p-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary-400/50 transition-all"
                whileHover={{ y: -5 }}
              >
                <feature.icon className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-1">{feature.label}</p>
                <p className="text-sm font-semibold text-white">{feature.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Navigation,
      title: 'Multimodal Routes',
      description: 'Combine buses, metro, walking, and ride-sharing intelligently'
    },
    {
      icon: DollarSign,
      title: 'Fare Prediction',
      description: 'AI-powered fare estimates across all transportation modes'
    },
    {
      icon: Clock,
      title: 'Real-Time ETA',
      description: 'Accurate travel time predictions with traffic awareness'
    },
    {
      icon: Zap,
      title: 'Smart Recommendations',
      description: 'Get personalized route suggestions based on your priorities'
    },
    {
      icon: Leaf,
      title: 'Eco Scoring',
      description: 'Track your environmental impact and make green choices'
    },
    {
      icon: MapPin,
      title: 'Map Visualization',
      description: 'Interactive maps with all transit options highlighted'
    },
  ];

  return (
    <section className="py-20 px-4 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-slate-400">
            Everything you need for smarter commuting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-primary-500/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <feature.icon className="w-10 h-10 text-primary-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const StatsSection: React.FC = () => {
  const stats = [
    { value: '500K+', label: 'Commutes Optimized' },
    { value: '45%', label: 'Average Savings' },
    { value: '2.5M+', label: 'Transit Routes' },
    { value: '99%', label: 'Accuracy Rate' },
  ];

  return (
    <section className="py-20 px-4 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-4xl md:text-5xl font-bold text-primary-400 mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
