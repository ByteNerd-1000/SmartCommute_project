import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalyticsStore } from '../store/search';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MapPin, DollarSign, Activity } from 'lucide-react';
import apiService from '../services/api';

export const AnalyticsDashboard: React.FC = () => {
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

  const statCards = [
    {
      label: 'Total Searches',
      value: summary?.total_searches || 0,
      icon: MapPin,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      delay: 0,
    },
    {
      label: 'Average Fare',
      value: `₹${(summary?.average_fare || 0).toFixed(2)}`,
      icon: DollarSign,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      delay: 0.1,
    },
    {
      label: 'Most Used Mode',
      value: mostUsedMode,
      icon: Users,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      delay: 0.2,
    },
    {
      label: 'Period',
      value: summary?.date || 'Today',
      icon: TrendingUp,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      delay: 0.3,
    },
  ];

  return (
    <div className="page-shell min-h-screen pt-8 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          className="page-surface-strong mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-kicker mb-3">Performance overview</span>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-primary-500" />
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Track commuting patterns, fare behavior, and mode trends in one clean overview.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="page-stat px-4 py-3">Trend aware</div>
              <div className="page-stat px-4 py-3">Decision ready</div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, iconColor, bgColor, delay }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay }}
                    className="page-surface p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${bgColor}`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mode Distribution Pie Chart */}
              {modeEntries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="page-surface p-6"
                >
                  <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
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
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
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
                  className="page-surface p-6"
                >
                  <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
                    7-Day Trends
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.trends}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#f8fafc',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '16px' }} />
                      <Line
                        type="monotone"
                        dataKey="searches"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="avg_fare"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Empty State */}
            {!summary && !trends && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="page-surface flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="p-6 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Activity className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xl font-semibold text-slate-900 dark:text-white">No Analytics Yet</p>
                <p className="text-slate-600 dark:text-slate-400">Start searching for routes to see your commuting insights!</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
