import { useState, useEffect, useRef } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { getSellerAnalytics, exportAnalyticsToCSV, type AnalyticsData } from '../lib/analytics';

interface SellerAnalyticsDashboardProps {
  onClose: () => void;
  sellerId: string;
  sellerName: string;
}

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

// Animated counter hook
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    const startTime = Date.now();
    const step = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * end);

      if (countRef.current !== current) {
        setCount(current);
        countRef.current = current;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle
}: {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: string;
  subtitle: string;
}) {
  const animatedValue = useCountUp(value);

  return (
    <div className={`group relative bg-gradient-to-br ${color} backdrop-blur-xl rounded-3xl p-6 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Glowing orb effect */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="text-white/80 text-xs font-bold uppercase tracking-widest">{title}</div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
            {icon}
          </div>
        </div>

        <div className="text-5xl font-black text-white mb-2 tabular-nums">
          {animatedValue.toLocaleString()}
        </div>

        <div className="text-white/70 text-sm font-medium">{subtitle}</div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full"></div>
    </div>
  );
}

export default function SellerAnalyticsDashboard({
  onClose,
  sellerId,
  sellerName
}: SellerAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, sellerId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getSellerAnalytics(sellerId, timeRange);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    setAnalyticsData(data);
    setLoading(false);
  };

  const handleExport = () => {
    if (analyticsData) {
      exportAnalyticsToCSV(analyticsData, sellerName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp border border-white/20">
        {/* Glass morphism header */}
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-8 flex items-center justify-between z-10 shadow-xl border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight">Analytics Hub</h2>
              <p className="text-white/80 text-base mt-1.5 font-medium">Real-time performance insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 group"
          >
            <svg className="w-7 h-7 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Glass morphism controls */}
        <div className="px-8 py-6 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-b border-white/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/50 scale-105'
                    : 'bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-white/80 hover:shadow-md backdrop-blur-sm'
                }`}
              >
                {range === 'week' && '7 Days'}
                {range === 'month' && '30 Days'}
                {range === 'all' && 'All Time'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={!analyticsData || loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-8 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-fuchsia-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-8 font-bold text-lg">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8">
            <div className="bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 rounded-3xl p-12 text-center">
              <div className="text-8xl mb-6">⚠️</div>
              <h3 className="text-3xl font-black text-red-900 mb-3">Unable to Load Analytics</h3>
              <p className="text-red-700 text-lg">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {analyticsData && !loading && !error && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 200px)' }}>
            <div className="p-8 space-y-8">
              {/* Stats Grid with Glass Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Views"
                  value={analyticsData.totalViews}
                  subtitle="Listing impressions"
                  color="from-blue-500 to-cyan-600"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                />

                <StatCard
                  title="Favorites"
                  value={analyticsData.totalFavorites}
                  subtitle="Saved by users"
                  color="from-rose-500 to-pink-600"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  }
                />

                <StatCard
                  title="Contacts"
                  value={analyticsData.totalContacts}
                  subtitle="Seller inquiries"
                  color="from-emerald-500 to-teal-600"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  }
                />

                <StatCard
                  title="Shares"
                  value={analyticsData.totalShares}
                  subtitle="Social shares"
                  color="from-violet-500 to-purple-600"
                  icon={
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  }
                />
              </div>

              {/* Charts with Glass Morphism */}
              {analyticsData.viewsOverTime.length > 0 && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">Views Trend</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Daily performance tracking</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={380}>
                    <AreaChart data={analyticsData.viewsOverTime}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '13px', fontWeight: '600' }} />
                      <YAxis stroke="#64748b" style={{ fontSize: '13px', fontWeight: '600' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorViews)" name="Views" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Favorites by Category */}
                {analyticsData.favoritesByCategory.length > 0 && (
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Category Breakdown</h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Favorites distribution</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={analyticsData.favoritesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => entry.category && entry.percent ? `${entry.category} ${(entry.percent * 100).toFixed(0)}%` : ''}
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="count"
                          strokeWidth={2}
                          stroke="#fff"
                        >
                          {analyticsData.favoritesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            fontWeight: 'bold'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Products */}
                {analyticsData.topProducts.length > 0 && (
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Top Performers</h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Best listings</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={analyticsData.topProducts.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="title" tick={{ fontSize: 11, fontWeight: 600 }} angle={-15} textAnchor="end" height={80} />
                        <YAxis stroke="#64748b" style={{ fontSize: '13px', fontWeight: '600' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            fontWeight: 'bold'
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                        <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[12, 12, 0, 0]} />
                        <Bar dataKey="favorites" fill="#EC4899" name="Favorites" radius={[12, 12, 0, 0]} />
                        <Bar dataKey="contacts" fill="#10B981" name="Contacts" radius={[12, 12, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Performance Table with Glass Effect */}
              {analyticsData.topProducts.length > 0 && (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="p-8 border-b border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">Performance Details</h3>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Complete analytics breakdown</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-violet-100/50 to-fuchsia-100/50 dark:from-slate-700/50 dark:to-slate-600/50">
                        <tr>
                          <th className="text-left py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Rank</th>
                          <th className="text-left py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Product</th>
                          <th className="text-center py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Views</th>
                          <th className="text-center py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Favorites</th>
                          <th className="text-center py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Contacts</th>
                          <th className="text-center py-5 px-8 font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {analyticsData.topProducts.map((product, index) => {
                          const score = product.views + product.favorites * 2 + product.contacts * 3;
                          return (
                            <tr key={product.product_id} className="hover:bg-white/40 dark:hover:bg-slate-700/40 transition-colors">
                              <td className="py-5 px-8">
                                <div className="flex items-center gap-3">
                                  {index === 0 && <span className="text-3xl">🥇</span>}
                                  {index === 1 && <span className="text-3xl">🥈</span>}
                                  {index === 2 && <span className="text-3xl">🥉</span>}
                                  {index > 2 && <span className="text-slate-400 font-black text-xl">#{index + 1}</span>}
                                </div>
                              </td>
                              <td className="py-5 px-8">
                                <span className="text-slate-900 dark:text-slate-100 font-bold text-base">{product.title}</span>
                              </td>
                              <td className="text-center py-5 px-8">
                                <span className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-lg">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {product.views}
                                </span>
                              </td>
                              <td className="text-center py-5 px-8">
                                <span className="inline-flex items-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-lg">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                  {product.favorites}
                                </span>
                              </td>
                              <td className="text-center py-5 px-8">
                                <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-lg">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {product.contacts}
                                </span>
                              </td>
                              <td className="text-center py-5 px-8">
                                <span className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black px-6 py-2.5 rounded-2xl shadow-lg text-lg">
                                  {score}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {analyticsData.totalViews === 0 && analyticsData.totalFavorites === 0 && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl border-4 border-dashed border-slate-300 dark:border-slate-600 p-20 text-center">
                  <div className="text-9xl mb-8">📊</div>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-4">No Data Yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xl mb-8 max-w-md mx-auto font-medium">
                    Your analytics will appear here as users interact with your listings
                  </p>
                  <div className="flex justify-center gap-6 text-sm font-bold text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Track Views</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <span>Monitor Favorites</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      <span>Measure Contacts</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
