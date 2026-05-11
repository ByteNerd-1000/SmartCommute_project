import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingDown, Zap, Leaf } from 'lucide-react';

interface Route {
  id: string;
  modes: string[];
  fare: number;
  duration_minutes: number;
  walking_distance_km: number;
  transfer_count: number;
  distance_km: number;
  stops: any[];
  via_stops?: string[];
}

interface Score {
  overall: number;
  cheapness: number;
  speed: number;
  comfort: number;
  eco_friendliness: number;
}

interface Recommendation {
  route: Route;
  score: Score;
  recommendation_type: string;
  reason: string;
}

interface RecommendationsDisplayProps {
    recommendations: {
      best_overall?: Recommendation;
      cheapest?: Recommendation;
      fastest?: Recommendation;
      eco_friendly?: Recommendation;
      comfort?: Recommendation;
    };
  onSelectRoute: (route: Route) => void;
}

const RecommendationCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  recommendation: Recommendation;
  accentClass: string;
  onSelect: (route: Route) => void;
}> = ({ title, icon, recommendation, accentClass, onSelect }) => {
  if (!recommendation) return null;

  const { route, reason } = recommendation;
  const busRoute = route.via_stops?.find((step) => step.startsWith('Bus route:'));
  const modeLabel: Record<string, string> = {
    rapido_bike: 'Rapido',
    auto: 'Auto',
    ola_mini: 'Ola',
    uber_go: 'Uber',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => onSelect(route)}
      className="group relative overflow-hidden bg-white/90 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:shadow-xl dark:hover:shadow-slate-900/50 transition-all hover:-translate-y-0.5 backdrop-blur-xl"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass} opacity-90`} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-2xl ${accentClass} ring-1 ring-white/20`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{reason}</p>
        </div>
      </div>

      {/* Route Details */}
      <div className="space-y-2 mb-4">
        {/* Fare */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Fare</span>
          <span className="font-bold text-lg text-primary-600 dark:text-primary-400">₹{route.fare.toFixed(2)}</span>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
          <span className="font-semibold text-slate-900 dark:text-white">{route.duration_minutes} min</span>
        </div>

        {/* Distance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Distance</span>
          <span className="font-semibold text-slate-900 dark:text-white">{route.distance_km.toFixed(1)} km</span>
        </div>

        {/* Modes */}
        <div className="flex flex-wrap gap-1 mt-2">
          {route.modes.map((mode, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                mode === 'walk' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                mode === 'bus' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                mode === 'metro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                mode === 'rapido_bike' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                mode === 'auto' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                mode === 'ola_mini' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' :
                mode === 'uber_go' ? 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300' :
                'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              }`}
            >
              {modeLabel[mode] || mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          ))}
        </div>
        {busRoute && (
          <p className="text-xs font-medium text-blue-600 dark:text-blue-300 mt-1">{busRoute}</p>
        )}
      </div>

      {/* Select Button */}
      <button
        className="w-full py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white transition-all text-sm"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(route);
        }}
      >
        Select Route
      </button>
    </motion.div>
  );
};

export const RecommendationsDisplay: React.FC<RecommendationsDisplayProps> = ({
  recommendations,
  onSelectRoute,
}) => {
  if (!recommendations || Object.values(recommendations).every(r => !r)) {
    return null;
  }

  return (
    <div className="page-surface-strong mt-8 p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-2xl">
            <Award className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Recommendations</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI-ranked route options for cost, speed, comfort, and emissions</p>
          </div>
        </div>
        <div className="section-kicker">Realtime route intelligence</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Overall */}
        {recommendations.best_overall && (
          <RecommendationCard
            title="🏆 Best Overall"
            icon={<Award className="w-5 h-5 text-amber-500" />}
            recommendation={recommendations.best_overall}
            accentClass="bg-amber-100 dark:bg-amber-500/20"
            onSelect={onSelectRoute}
          />
        )}

        {/* Cheapest */}
        {recommendations.cheapest && (
          <RecommendationCard
            title="💰 Cheapest"
            icon={<TrendingDown className="w-5 h-5 text-green-500" />}
            recommendation={recommendations.cheapest}
            accentClass="bg-green-100 dark:bg-green-500/20"
            onSelect={onSelectRoute}
          />
        )}

        {/* Fastest */}
        {recommendations.fastest && (
          <RecommendationCard
            title="⚡ Fastest"
            icon={<Zap className="w-5 h-5 text-blue-500" />}
            recommendation={recommendations.fastest}
            accentClass="bg-blue-100 dark:bg-blue-500/20"
            onSelect={onSelectRoute}
          />
        )}

        {/* Eco-Friendly */}
        {recommendations.eco_friendly && (
          <RecommendationCard
            title="🌱 Eco-Friendly"
            icon={<Leaf className="w-5 h-5 text-emerald-500" />}
            recommendation={recommendations.eco_friendly}
            accentClass="bg-emerald-100 dark:bg-emerald-500/20"
            onSelect={onSelectRoute}
          />
        )}

        {/* Most Comfortable / Least Walking */}
        {recommendations.comfort && (
          <RecommendationCard
            title="🛋️ Most Comfortable"
            icon={<Award className="w-5 h-5 text-purple-500" />}
            recommendation={recommendations.comfort}
            accentClass="bg-purple-100 dark:bg-purple-500/20"
            onSelect={onSelectRoute}
          />
        )}
      </div>
    </div>
  );
};
