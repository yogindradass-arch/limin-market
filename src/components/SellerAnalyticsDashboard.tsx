import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
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
  ResponsiveContainer
} from 'recharts';
import { getSellerAnalytics, exportAnalyticsToCSV, type AnalyticsData } from '../lib/analytics';

interface SellerAnalyticsDashboardProps {
  onClose: () => void;
  sellerId: string;
  sellerName: string;
}

const COLORS = ['#FF6B35', '#F7931E', '#FDC830', '#37B7C3', '#088395', '#071952'];

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
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-r from-limin-primary to-limin-secondary p-6 flex items-center justify-between z-10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
              <p className="text-white/80 text-sm mt-1">Track your listing performance & insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-200 hover:rotate-90"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls Bar */}
        <div className="px-6 py-5 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-limin-primary to-limin-secondary text-white shadow-md scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                {range === 'week' && '📅 Last 7 Days'}
                {range === 'month' && '📆 Last 30 Days'}
                {range === 'all' && '🗓️ All Time'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={!analyticsData || loading}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 bg-gradient-to-br from-gray-50 to-white">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-limin-primary border-t-transparent absolute top-0"></div>
            </div>
            <p className="text-gray-600 mt-6 font-medium">Loading analytics data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Unable to Load Analytics</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {analyticsData && !loading && !error && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 180px)' }}>
            <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-white">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Total Views</span>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-1">{analyticsData.totalViews.toLocaleString()}</div>
                  <div className="text-blue-100 text-xs font-medium">People viewed your listings</div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-rose-100 text-sm font-semibold uppercase tracking-wider">Favorites</span>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-1">{analyticsData.totalFavorites.toLocaleString()}</div>
                  <div className="text-rose-100 text-xs font-medium">Added to favorites</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">Contacts</span>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-1">{analyticsData.totalContacts.toLocaleString()}</div>
                  <div className="text-emerald-100 text-xs font-medium">Direct seller contacts</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-100 text-sm font-semibold uppercase tracking-wider">Shares</span>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-1">{analyticsData.totalShares.toLocaleString()}</div>
                  <div className="text-purple-100 text-xs font-medium">Listings shared</div>
                </div>
              </div>

              {/* Charts Section */}
              {analyticsData.viewsOverTime.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Views Over Time</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={analyticsData.viewsOverTime}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={3} fill="url(#colorViews)" name="Views" dot={{ fill: '#FF6B35', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Favorites by Category */}
                {analyticsData.favoritesByCategory.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Favorites by Category</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={analyticsData.favoritesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => entry.category && entry.percent ? `${entry.category} (${(entry.percent * 100).toFixed(0)}%)` : ''}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.favoritesByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Products Chart */}
                {analyticsData.topProducts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Top Performing Listings</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={analyticsData.topProducts.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="title" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="views" fill="#4299E1" name="Views" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="favorites" fill="#F56565" name="Favorites" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="contacts" fill="#48BB78" name="Contacts" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Detailed Performance Table */}
              {analyticsData.topProducts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-8 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">Detailed Performance</h3>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Rank</th>
                          <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Product</th>
                          <th className="text-center py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Views</th>
                          <th className="text-center py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Favorites</th>
                          <th className="text-center py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Contacts</th>
                          <th className="text-center py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wider">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analyticsData.topProducts.map((product, index) => {
                          const score = product.views + product.favorites * 2 + product.contacts * 3;
                          return (
                            <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  {index === 0 && <span className="text-2xl">🥇</span>}
                                  {index === 1 && <span className="text-2xl">🥈</span>}
                                  {index === 2 && <span className="text-2xl">🥉</span>}
                                  {index > 2 && <span className="text-gray-400 font-bold text-lg">#{index + 1}</span>}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="text-gray-900 font-medium">{product.title}</span>
                              </td>
                              <td className="text-center py-4 px-6">
                                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {product.views}
                                </span>
                              </td>
                              <td className="text-center py-4 px-6">
                                <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                  {product.favorites}
                                </span>
                              </td>
                              <td className="text-center py-4 px-6">
                                <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  {product.contacts}
                                </span>
                              </td>
                              <td className="text-center py-4 px-6">
                                <span className="inline-block bg-gradient-to-r from-limin-primary to-limin-secondary text-white font-bold px-4 py-2 rounded-xl shadow-md">
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
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
                  <div className="text-8xl mb-6">📊</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">No Analytics Data Yet</h3>
                  <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                    Start getting valuable insights as users discover and interact with your amazing listings!
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Track views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      <span>Monitor favorites</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Measure contacts</span>
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
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
