import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Zap, Leaf, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-stone-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 transition-colors duration-300">
      {/* Light theme: soft road-network background */}
      <div className="absolute inset-0 opacity-55 dark:opacity-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 960">
          <defs>
            <linearGradient id="road-light" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.26" />
            </linearGradient>
            <linearGradient id="route-glow-light" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M80 760 C 220 620, 340 620, 460 520 S 760 350, 920 420 S 1180 620, 1360 480" stroke="url(#road-light)" strokeWidth="16" />
            <path d="M160 190 C 280 240, 360 260, 510 220 S 760 160, 930 260 S 1170 420, 1320 250" stroke="url(#road-light)" strokeWidth="12" opacity="0.8" />
            <path d="M270 860 C 380 760, 470 710, 570 640 S 790 500, 990 530 S 1220 660, 1380 620" stroke="url(#road-light)" strokeWidth="10" opacity="0.7" />
            <path d="M120 430 C 240 470, 350 510, 470 470 S 690 360, 820 390 S 1080 560, 1260 450" stroke="url(#route-glow-light)" strokeWidth="8" strokeDasharray="20 18" />
            <path d="M80 770 L 170 690 L 240 730 L 330 620 L 430 660 L 520 560 L 620 600 L 710 520 L 820 560 L 930 460 L 1040 500 L 1160 390 L 1270 420" stroke="#64748b" strokeWidth="3" strokeDasharray="8 14" opacity="0.35" />
            <circle cx="170" cy="690" r="7" fill="#0ea5e9" opacity="0.55" />
            <circle cx="330" cy="620" r="7" fill="#38bdf8" opacity="0.45" />
            <circle cx="520" cy="560" r="7" fill="#22d3ee" opacity="0.45" />
            <circle cx="710" cy="520" r="7" fill="#0ea5e9" opacity="0.5" />
            <circle cx="930" cy="460" r="7" fill="#38bdf8" opacity="0.45" />
            <circle cx="1160" cy="390" r="7" fill="#22d3ee" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Dark theme: glowing road-network background */}
      <div className="hidden dark:block absolute inset-0 opacity-55">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 960">
          <defs>
            <linearGradient id="road-dark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="route-glow-dark" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M80 760 C 220 620, 340 620, 460 520 S 760 350, 920 420 S 1180 620, 1360 480" stroke="url(#road-dark)" strokeWidth="18" />
            <path d="M160 190 C 280 240, 360 260, 510 220 S 760 160, 930 260 S 1170 420, 1320 250" stroke="url(#road-dark)" strokeWidth="12" opacity="0.85" />
            <path d="M270 860 C 380 760, 470 710, 570 640 S 790 500, 990 530 S 1220 660, 1380 620" stroke="url(#road-dark)" strokeWidth="10" opacity="0.7" />
            <path d="M120 430 C 240 470, 350 510, 470 470 S 690 360, 820 390 S 1080 560, 1260 450" stroke="url(#route-glow-dark)" strokeWidth="10" strokeDasharray="18 16" />
            <path d="M80 770 L 170 690 L 240 730 L 330 620 L 430 660 L 520 560 L 620 600 L 710 520 L 820 560 L 930 460 L 1040 500 L 1160 390 L 1270 420" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 14" opacity="0.2" />
            <circle cx="170" cy="690" r="8" fill="#38bdf8" opacity="0.75" />
            <circle cx="330" cy="620" r="8" fill="#22d3ee" opacity="0.65" />
            <circle cx="520" cy="560" r="8" fill="#60a5fa" opacity="0.7" />
            <circle cx="710" cy="520" r="8" fill="#38bdf8" opacity="0.75" />
            <circle cx="930" cy="460" r="8" fill="#22d3ee" opacity="0.65" />
            <circle cx="1160" cy="390" r="8" fill="#60a5fa" opacity="0.75" />
          </g>
        </svg>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-blue-300 dark:bg-blue-600 rounded-full blur-3xl opacity-20 dark:opacity-5"
          animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 dark:bg-cyan-600 rounded-full blur-3xl opacity-20 dark:opacity-5"
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
            className="inline-block mb-6 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-900/10 dark:border-white/20 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">🚀 Next-Gen Commuting</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            CityRoute Smart Ai,
            <br />
            <span className="bg-gradient-to-r from-primary-500 to-cyan-500 dark:from-primary-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Smarter Choices
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto"
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
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer"
            >
              Start Journey
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-white/70 dark:bg-white/10 backdrop-blur-md text-slate-900 dark:text-white font-semibold rounded-lg border border-slate-900/10 dark:border-white/20 hover:bg-white/90 dark:hover:bg-white/20 transition-all cursor-pointer">
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
                className="p-4 rounded-lg bg-white/70 dark:bg-white/5 backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:border-cyan-400/50 dark:hover:border-cyan-400/50 transition-all shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none"
                whileHover={{ y: -5 }}
              >
                <feature.icon className="w-6 h-6 text-primary-500 dark:text-primary-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{feature.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{feature.value}</p>
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
    <section className="relative py-20 px-4 bg-gradient-to-b from-stone-50 via-blue-50 to-cyan-50 dark:bg-gradient-to-b dark:from-slate-800 dark:to-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Light theme background pattern */}
      <div className="absolute inset-0 opacity-45 dark:opacity-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="features-light" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
              <path d="M 20 90 C 50 60, 100 60, 160 90" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.2" />
              <path d="M 30 30 L 80 80 L 120 40 L 150 90" stroke="#0ea5e9" strokeWidth="0.8" fill="none" opacity="0.18" strokeDasharray="5 7" />
              <circle cx="80" cy="80" r="2" fill="#0ea5e9" opacity="0.2" />
              <circle cx="120" cy="40" r="2" fill="#06b6d4" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#features-light)" />
        </svg>
      </div>

      {/* Dark theme transportation grid */}
      <div className="hidden dark:block absolute inset-0 opacity-5">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 1000">
          <defs>
            <pattern id="features-dark" x="0" y="0" width="240" height="240" patternUnits="userSpaceOnUse">
              <g stroke="#3b82f6" strokeWidth="0.5" opacity="0.35" fill="none">
                <rect x="24" y="24" width="56" height="34" rx="3" />
                <circle cx="36" cy="61" r="3" />
                <circle cx="66" cy="61" r="3" />
                <path d="M 18 92 C 60 70, 110 70, 180 92" />
                <path d="M 30 150 L 85 105 L 140 150 L 194 100" stroke="#22d3ee" strokeDasharray="6 10" opacity="0.3" />
              </g>
            </pattern>
          </defs>
          <rect width="1000" height="1000" fill="url(#features-dark)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Everything you need for smarter commuting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="p-6 rounded-xl bg-white/90 dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-blue-500/10 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <feature.icon className="w-10 h-10 text-blue-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
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
    <section className="relative py-20 px-4 bg-gradient-to-r from-stone-100 via-blue-50 to-cyan-50 dark:bg-gradient-to-r dark:from-blue-950 dark:via-slate-900 dark:to-blue-950 transition-colors duration-300 overflow-hidden">
      {/* Animated transportation elements for stats */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-[5%] w-48 h-48 bg-blue-300 dark:bg-blue-700 rounded-full blur-3xl opacity-10 dark:opacity-5"
          animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-[5%] w-48 h-48 bg-cyan-300 dark:bg-cyan-700 rounded-full blur-3xl opacity-10 dark:opacity-5"
          animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
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
                className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.6 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
