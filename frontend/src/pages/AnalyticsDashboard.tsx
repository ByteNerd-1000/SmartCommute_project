import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/theme';
import { useAnalyticsStore } from '../store/search';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MapPin, DollarSign } from 'lucide-react';
import apiService from '../services/api';

export const AnalyticsDashboard: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { summary, trends, setSummary, setTrends } = useAnalyticsStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const summaryRes = await apiService.getAnalyticsSummary().catch(() => ({ data: null }));
        const trendsRes = await apiService.getAnalyticsTrends(7).catch(() => ({ data: null }));

        if (summaryRes?.data) setSummary(summaryRes.data);
        if (trendsRes?.data) setTrends(trendsRes.data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const modeEntries = Object.entries(summary?.mode_distribution || {});
  const mostUsedMode = modeEntries.length
    ? modeEntries.reduce((a: any, b: any) => (a[1] > b[1] ? a : b))[0]?.toUpperCase()
    : 'N/A';

  return (
    <div className={`min-h-screen pt-8 pb-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics Dashboard
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Track your commuting patterns and insights
          </p>
        </motion.div>

        {loading ? (
          <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Searches */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Total Searches
                      </p>
                      <p className="text-3xl font-bold mt-2">{summary.total_searches || 0}</p>
                    </div>
                    <MapPin className="w-10 h-10 text-blue-500 opacity-20" />
                  </div>
                </motion.div>

                {/* Average Fare */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Average Fare
                      </p>
                      <p className="text-3xl font-bold mt-2">₹{(summary.average_fare || 0).toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
                  </div>
                </motion.div>

                {/* Most Used Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Most Used Mode
                      </p>
                      <p className="text-3xl font-bold mt-2">
                        {mostUsedMode}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-purple-500 opacity-20" />
                  </div>
                </motion.div>

                {/* Date */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Period
                      </p>
                      <p className="text-2xl font-bold mt-2">{summary.date || 'Today'}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-500 opacity-20" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mode Distribution Pie Chart */}
              {modeEntries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}
                >
                  <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Mode Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modeEntries.map(([name, value]) => ({
                          name: name.charAt(0).toUpperCase() + name.slice(1),
                          value,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {modeEntries.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Trends Line Chart */}
              {trends && trends.trends && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}
                >
                  <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    7-Day Trends
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.trends}>
                      <CartesianGrid stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
                      />
                      <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                        }}
                        labelStyle={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="searches"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_fare"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Empty State */}
            {!summary && !trends && (
              <div className={`text-center py-20 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>No analytics data available yet. Start searching for routes!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
