import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface Route {
  id: string;
  modes: string[];
  fare: number;
  duration_minutes: number;
  distance_km: number;
  transfer_count: number;
  fare_breakdown?: any;
}

interface FareComparisonProps {
  routes: Route[];
  source?: { name?: string; lat: number; lng: number };
  destination?: { name?: string; lat: number; lng: number };
}

// Human-readable mode labels & colors
const MODE_META: Record<string, { label: string; color: string; emoji: string }> = {
  'walk': { label: 'Walking', color: '#22C55E', emoji: '🚶' },
  'bus': { label: 'PMPML Bus', color: '#0EA5E9', emoji: '🚌' },
  'metro': { label: 'Metro', color: '#A855F7', emoji: '🚇' },
  'rapido_bike': { label: 'Rapido Bike', color: '#EAB308', emoji: '🛵' },
  'auto': { label: 'Auto/Rickshaw', color: '#F97316', emoji: '🛺' },
  'ola_mini': { label: 'Ola Mini', color: '#6366F1', emoji: '🚗' },
  'uber_go': { label: 'Uber Go', color: '#64748B', emoji: '🚙' },
};

function getRouteLabel(modes: string[]): string {
  const unique = [...new Set(modes)].filter(m => m !== 'walk');
  if (unique.length === 0) return 'Walking';
  return unique.map(m => MODE_META[m]?.label || m).join(' + ');
}

function getRouteColor(modes: string[]): string {
  const primary = modes.find(m => m !== 'walk') || modes[0];
  return MODE_META[primary]?.color || '#0EA5E9';
}

function getRouteEmoji(modes: string[]): string {
  const primary = modes.find(m => m !== 'walk') || modes[0];
  return MODE_META[primary]?.emoji || '🚌';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold text-white mb-1">{label}</p>
        <p className="text-primary-400 font-bold">₹{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export const FareComparison: React.FC<FareComparisonProps> = ({ routes, source, destination }) => {

  if (!routes || routes.length === 0) return null;

  const sorted = [...routes].sort((a, b) => a.fare - b.fare);
  const cheapest = sorted[0];
  const mostExpensive = sorted[sorted.length - 1];
  const savings = mostExpensive.fare - cheapest.fare;

  const chartData = sorted.map((r) => ({
    name: getRouteLabel(r.modes),
    emoji: getRouteEmoji(r.modes),
    fare: Math.round(r.fare * 100) / 100,
    duration: r.duration_minutes,
    distance: r.distance_km,
    color: getRouteColor(r.modes),
    modes: r.modes,
    breakdown: r.fare_breakdown,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm"
    >
      {/* ── Section Header ── */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-xl">
            💰
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fare Comparison</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {source?.name} → {destination?.name}
            </p>
          </div>
        </div>

        {/* Savings banner */}
        {savings > 5 && (
          <div className="mt-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">
                Save up to ₹{savings.toFixed(0)} by choosing {getRouteEmoji(cheapest.modes)} {getRouteLabel(cheapest.modes)}!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                vs {getRouteLabel(mostExpensive.modes)} at ₹{mostExpensive.fare.toFixed(0)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">

        {/* ── 1. Quick Stats ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            At a Glance
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* Cheapest */}
            <div className="rounded-xl p-4 border-l-4 bg-green-50 border-green-500 dark:bg-green-900/20">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">💚 Cheapest</p>
              <p className="text-xl font-bold text-green-600">₹{cheapest.fare.toFixed(0)}</p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{getRouteLabel(cheapest.modes)}</p>
            </div>
            {/* Fastest */}
            {(() => {
              const fastest = [...routes].sort((a, b) => a.duration_minutes - b.duration_minutes)[0];
              return (
                <div className="rounded-xl p-4 border-l-4 bg-blue-50 border-blue-500 dark:bg-blue-900/20">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">⚡ Fastest</p>
                  <p className="text-xl font-bold text-blue-600">{fastest.duration_minutes} min</p>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{getRouteLabel(fastest.modes)}</p>
                </div>
              );
            })()}
            {/* Most Expensive */}
            <div className="rounded-xl p-4 border-l-4 bg-red-50 border-red-400 dark:bg-red-900/20">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">💸 Most Expensive</p>
              <p className="text-xl font-bold text-red-500">₹{mostExpensive.fare.toFixed(0)}</p>
              <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{getRouteLabel(mostExpensive.modes)}</p>
            </div>
          </div>
        </div>

        {/* ── 2. Fare Chart ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Fare by Transport Mode
          </h3>
          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={40} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar dataKey="fare" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 3. Detailed Route Cards ── */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Detailed Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map((route, idx) => {
              const label = getRouteLabel(route.modes);
              const emoji = getRouteEmoji(route.modes);
              const color = getRouteColor(route.modes);
              const isCheapest = route.id === cheapest.id;
              const maxFare = mostExpensive.fare;
              const pct = Math.round((route.fare / maxFare) * 100);

              return (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 relative overflow-hidden shadow-sm"
                >
                  {isCheapest && (
                    <span className="absolute top-3 right-3 text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                      Best Value
                    </span>
                  )}
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {route.distance_km.toFixed(1)} km · {route.duration_minutes} min
                      </p>
                    </div>
                    <p className="ml-auto text-2xl font-bold" style={{ color }}>
                      ₹{route.fare.toFixed(0)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>

                  {/* Fare breakdown */}
                  {route.fare_breakdown && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                      <p className="font-medium">{route.fare_breakdown.label}</p>
                      <div className="flex gap-3 flex-wrap">
                        <span>Base ₹{route.fare_breakdown.base_fare}</span>
                        {route.fare_breakdown.distance_component != null && (
                          <span>+ Dist ₹{route.fare_breakdown.distance_component?.toFixed(0)}</span>
                        )}
                        {route.fare_breakdown.time_component != null && (
                          <span>+ Time ₹{route.fare_breakdown.time_component?.toFixed(0)}</span>
                        )}
                        {route.fare_breakdown.surge_multiplier && route.fare_breakdown.surge_multiplier > 1 && (
                          <span className="text-orange-500">× {route.fare_breakdown.surge_multiplier} surge</span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Eco tip ── */}
        <div className="rounded-xl p-4 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/30">
          <span className="text-2xl mt-0.5">🌱</span>
          <div>
            <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-300">
              Eco-Friendly Tip
            </p>
            <p className="text-xs mt-0.5 text-emerald-700 dark:text-emerald-400">
              Taking the bus or metro instead of a cab reduces your carbon footprint by up to 80% per trip.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
