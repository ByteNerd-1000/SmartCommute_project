import React, { useState } from 'react';
import { useHistoryStore } from '../store/history';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ChevronDown } from 'lucide-react';

export const RouteComparisonPage: React.FC = () => {
  const { savedRoutes } = useHistoryStore();
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const toggleRoute = (id: string) => {
    if (selectedRoutes.includes(id)) {
      setSelectedRoutes(selectedRoutes.filter((r) => r !== id));
    } else if (selectedRoutes.length < 5) {
      setSelectedRoutes([...selectedRoutes, id]);
    }
  };

  const routesToCompare = savedRoutes.filter((r) =>
    selectedRoutes.includes(r.id)
  );

  const comparisonData = routesToCompare.map((route) => ({
    name: `${route.source.split(' ')[0]} → ${route.destination.split(' ')[0]}`,
    fare: route.fare,
    duration: route.duration,
    distance: route.distance,
    frequency: route.frequency || 1,
  }));

  const efficiencyData = routesToCompare.map((route) => ({
    name: `${route.source.split(' ')[0]}`,
    efficiency: (route.frequency || 1) / (route.fare / 10),
    costEfficiency: route.frequency || 1,
    timeEfficiency: route.frequency || 1,
  }));

  const chartColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
  ];

  return (
    <div className="page-shell min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8">
        <div className="page-surface-strong mb-8 overflow-hidden">
          <div className="p-6 md:p-8">
            <span className="section-kicker mb-3">Route compare lab</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 dark:text-white">Compare route options like a planning dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-3xl">
              Stack up to five saved routes and inspect fare, time, distance, and usage frequency side by side.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Select Routes</h2>
            <div className="space-y-2">
              {savedRoutes.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  No saved routes available. Search for routes first!
                </p>
              ) : (
                savedRoutes.map((route, idx) => (
                  <label
                    key={route.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border shadow-sm ${
                      selectedRoutes.includes(route.id)
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-500/50'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoutes.includes(route.id)}
                      onChange={() => toggleRoute(route.id)}
                      disabled={
                        !selectedRoutes.includes(route.id) &&
                        selectedRoutes.length >= 5
                      }
                      className="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {route.source}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        → {route.destination}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[
                            selectedRoutes.indexOf(route.id) %
                              chartColors.length
                          ] || 'transparent',
                      }}
                    />
                  </label>
                ))
              )}
            </div>

            {selectedRoutes.length > 0 && (
              <button
                onClick={() => setSelectedRoutes([])}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2">
            {selectedRoutes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Select routes to compare. You can compare up to 5 routes at once.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Comparison Table */}
                <div className="page-surface p-4">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Summary Comparison</h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-slate-600 dark:text-slate-400">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold">
                        <tr>
                          <th className="px-4 py-3 text-left">Route</th>
                          <th className="px-4 py-3 text-right">Fare (₹)</th>
                          <th className="px-4 py-3 text-right">Duration</th>
                          <th className="px-4 py-3 text-right">Distance</th>
                          <th className="px-4 py-3 text-right">Uses</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {comparisonData.map((data, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      chartColors[idx % chartColors.length],
                                  }}
                                />
                                {data.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                              ₹{data.fare.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {data.duration} min
                            </td>
                            <td className="px-4 py-3 text-right">
                              {data.distance.toFixed(1)} km
                            </td>
                            <td className="px-4 py-3 text-right">
                              {data.frequency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fare vs Duration Chart */}
                <div className="page-surface p-4">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">
                    Fare vs Duration Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        stroke="currentColor"
                        className="text-slate-500 dark:text-slate-400"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="fare" fill="#3B82F6" name="Fare (₹)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="duration" fill="#10B981" name="Duration (min)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Best Value Analysis */}
                <div className="page-surface p-4">
                  <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Value Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Best Price */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Cheapest Route</p>
                      <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                        ₹
                        {Math.min(
                          ...comparisonData.map((d) => d.fare)
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {
                          comparisonData.find(
                            (d) =>
                              d.fare ===
                              Math.min(...comparisonData.map((c) => c.fare))
                          )?.name
                        }
                      </p>
                    </div>

                    {/* Best Time */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Fastest Route</p>
                      <p className="font-bold text-2xl text-green-600 dark:text-green-400">
                        {Math.min(
                          ...comparisonData.map((d) => d.duration)
                        )}{' '}
                        min
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {
                          comparisonData.find(
                            (d) =>
                              d.duration ===
                              Math.min(...comparisonData.map((c) => c.duration))
                          )?.name
                        }
                      </p>
                    </div>

                    {/* Best Value */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Best Value</p>
                      <p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                        {(
                          Math.min(
                            ...comparisonData.map(
                              (d) => d.fare / (d.duration / 10)
                            )
                          ) * 10
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Lowest cost per time unit
                      </p>
                    </div>

                    {/* Most Used */}
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Most Used</p>
                      <p className="font-bold text-2xl text-amber-600 dark:text-amber-400">
                        {Math.max(...comparisonData.map((d) => d.frequency))}{' '}
                        times
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        {
                          comparisonData.find(
                            (d) =>
                              d.frequency ===
                              Math.max(...comparisonData.map((c) => c.frequency))
                          )?.name
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
