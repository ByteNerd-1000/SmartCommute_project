import React, { useState } from 'react';
import { useThemeStore } from '../store/theme';
import { useHistoryStore } from '../store/history';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ChevronDown } from 'lucide-react';

export const RouteComparisonPage: React.FC = () => {
  const { isDarkMode } = useThemeStore();
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
    <div
      className={`${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } min-h-screen transition-colors duration-300`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-50 border-gray-200'
        } border-b`}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Route Comparison</h1>
          <p
            className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Compare up to 5 routes side-by-side to find the best option
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Selection */}
          <div>
            <h2 className="text-xl font-bold mb-4">Select Routes</h2>
            <div className="space-y-2">
              {savedRoutes.length === 0 ? (
                <p
                  className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  No saved routes available. Search for routes first!
                </p>
              ) : (
                savedRoutes.map((route, idx) => (
                  <label
                    key={route.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRoutes.includes(route.id)
                        ? isDarkMode
                          ? 'bg-blue-900/30 border border-blue-500'
                          : 'bg-blue-50 border border-blue-300'
                        : isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-750'
                        : 'bg-gray-50 hover:bg-gray-100'
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
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {route.source}
                      </p>
                      <p
                        className={`text-xs opacity-70 truncate`}
                      >
                        → {route.destination}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          chartColors[
                            selectedRoutes.indexOf(route.id) %
                              chartColors.length
                          ],
                      }}
                    />
                  </label>
                ))
              )}
            </div>

            {selectedRoutes.length > 0 && (
              <button
                onClick={() => setSelectedRoutes([])}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2">
            {selectedRoutes.length === 0 ? (
              <div
                className={`${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-gray-50 border-gray-200'
                } border rounded-lg p-8 text-center`}
              >
                <p
                  className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Select routes to compare. You can compare up to 5 routes at once.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Comparison Table */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Summary Comparison</h3>
                  <div className="overflow-x-auto">
                    <table
                      className={`w-full text-sm ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      } rounded-lg overflow-hidden`}
                    >
                      <thead>
                        <tr
                          className={`${
                            isDarkMode
                              ? 'bg-gray-700'
                              : 'bg-gray-200'
                          } font-semibold`}
                        >
                          <th className="px-4 py-2 text-left">Route</th>
                          <th className="px-4 py-2 text-right">Fare (₹)</th>
                          <th className="px-4 py-2 text-right">Duration</th>
                          <th className="px-4 py-2 text-right">Distance</th>
                          <th className="px-4 py-2 text-right">Uses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((data, idx) => (
                          <tr
                            key={idx}
                            className={`border-t ${
                              isDarkMode
                                ? 'border-gray-700 hover:bg-gray-700'
                                : 'border-gray-200 hover:bg-gray-100'
                            } transition-colors`}
                          >
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      chartColors[idx % chartColors.length],
                                  }}
                                />
                                {data.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
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
                <div>
                  <h3 className="text-lg font-bold mb-4">
                    Fare vs Duration Analysis
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid
                        stroke={isDarkMode ? '#374151' : '#e5e7eb'}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: isDarkMode ? '#d1d5db' : '#6b7280',
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        tick={{
                          fill: isDarkMode ? '#d1d5db' : '#6b7280',
                          fontSize: 12,
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode
                            ? '#1f2937'
                            : '#ffffff',
                          border: `1px solid ${
                            isDarkMode ? '#374151' : '#e5e7eb'
                          }`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f3f4f6' : '#111827',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          color: isDarkMode ? '#f3f4f6' : '#111827',
                        }}
                      />
                      <Bar dataKey="fare" fill="#3B82F6" name="Fare (₹)" />
                      <Bar dataKey="duration" fill="#EF4444" name="Duration (min)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Best Value Analysis */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Value Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Best Price */}
                    <div
                      className={`${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      } border rounded-lg p-4`}
                    >
                      <p className="text-sm opacity-70 mb-2">Cheapest Route</p>
                      <p className="font-bold text-lg">
                        ₹
                        {Math.min(
                          ...comparisonData.map((d) => d.fare)
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
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
                    <div
                      className={`${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      } border rounded-lg p-4`}
                    >
                      <p className="text-sm opacity-70 mb-2">Fastest Route</p>
                      <p className="font-bold text-lg">
                        {Math.min(
                          ...comparisonData.map((d) => d.duration)
                        )}{' '}
                        min
                      </p>
                      <p className="text-xs opacity-50 mt-1">
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
                    <div
                      className={`${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      } border rounded-lg p-4`}
                    >
                      <p className="text-sm opacity-70 mb-2">Best Value</p>
                      <p className="font-bold text-lg">
                        {(
                          Math.min(
                            ...comparisonData.map(
                              (d) => d.fare / (d.duration / 10)
                            )
                          ) * 10
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs opacity-50 mt-1">
                        Lowest cost per time unit
                      </p>
                    </div>

                    {/* Most Used */}
                    <div
                      className={`${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-gray-50 border-gray-200'
                      } border rounded-lg p-4`}
                    >
                      <p className="text-sm opacity-70 mb-2">Most Used</p>
                      <p className="font-bold text-lg">
                        {Math.max(...comparisonData.map((d) => d.frequency))}{' '}
                        times
                      </p>
                      <p className="text-xs opacity-50 mt-1">
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
