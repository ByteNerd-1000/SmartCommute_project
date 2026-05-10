import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingDown, Zap, Leaf } from 'lucide-react';
import { useThemeStore } from '../store/theme';

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
  color: string;
  onSelect: (route: Route) => void;
}> = ({ title, icon, recommendation, color, onSelect }) => {
  const { isDarkMode } = useThemeStore();
  
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
      className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow ${color}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${color} p-2 rounded-lg`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{reason}</p>
        </div>
      </div>

      {/* Route Details */}
      <div className="space-y-2 mb-3">
        {/* Fare */}
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fare:</span>
          <span className="font-bold text-lg">₹{route.fare.toFixed(2)}</span>
        </div>

        {/* Duration */}
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration:</span>
          <span className="font-semibold">{route.duration_minutes} min</span>
        </div>

        {/* Distance */}
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Distance:</span>
          <span className="font-semibold">{route.distance_km.toFixed(1)} km</span>
        </div>

        {/* Modes */}
        <div className="flex gap-1 mt-2">
          {route.modes.map((mode, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 text-xs rounded ${
                mode === 'walk' ? 'bg-orange-500/20 text-orange-400' :
                mode === 'bus' ? 'bg-blue-500/20 text-blue-400' :
                mode === 'metro' ? 'bg-purple-500/20 text-purple-400' :
                mode === 'rapido_bike' ? 'bg-yellow-500/20 text-yellow-400' :
                mode === 'auto' ? 'bg-amber-500/20 text-amber-400' :
                mode === 'ola_mini' ? 'bg-indigo-500/20 text-indigo-400' :
                mode === 'uber_go' ? 'bg-slate-500/20 text-slate-300' :
                'bg-green-500/20 text-green-400'
              }`}
            >
              {modeLabel[mode] || mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          ))}
        </div>
        {busRoute && (
          <p className="text-sm font-medium text-blue-300 mt-2">{busRoute}</p>
        )}
      </div>

      {/* Select Button */}
      <button
        className={`w-full py-2 rounded font-semibold transition-colors ${
          isDarkMode
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        }`}
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
  const { isDarkMode } = useThemeStore();

  if (!recommendations || Object.values(recommendations).every(r => !r)) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Smart Recommendations</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Overall */}
        {recommendations.best_overall && (
          <RecommendationCard
            title="🏆 Best Overall"
            icon={<Award className="w-5 h-5 text-yellow-400" />}
            recommendation={recommendations.best_overall}
            color="bg-yellow-500/10 border-yellow-500/30"
            onSelect={onSelectRoute}
          />
        )}

        {/* Cheapest */}
        {recommendations.cheapest && (
          <RecommendationCard
            title="💰 Cheapest"
            icon={<TrendingDown className="w-5 h-5 text-green-400" />}
            recommendation={recommendations.cheapest}
            color="bg-green-500/10 border-green-500/30"
            onSelect={onSelectRoute}
          />
        )}

        {/* Fastest */}
        {recommendations.fastest && (
          <RecommendationCard
            title="⚡ Fastest"
            icon={<Zap className="w-5 h-5 text-blue-400" />}
            recommendation={recommendations.fastest}
            color="bg-blue-500/10 border-blue-500/30"
            onSelect={onSelectRoute}
          />
        )}

        {/* Eco-Friendly */}
        {recommendations.eco_friendly && (
          <RecommendationCard
            title="🌱 Eco-Friendly"
            icon={<Leaf className="w-5 h-5 text-emerald-400" />}
            recommendation={recommendations.eco_friendly}
            color="bg-emerald-500/10 border-emerald-500/30"
            onSelect={onSelectRoute}
          />
        )}

        {/* Most Comfortable / Least Walking */}
        {recommendations.comfort && (
          <RecommendationCard
            title="🛋️ Most Comfortable"
            icon={<Award className="w-5 h-5 text-purple-400" />}
            recommendation={recommendations.comfort}
            color="bg-purple-500/10 border-purple-500/30"
            onSelect={onSelectRoute}
          />
        )}
      </div>
    </div>
  );
};
