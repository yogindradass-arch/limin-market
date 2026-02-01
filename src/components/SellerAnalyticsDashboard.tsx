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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-limin-dark">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Insights for your listings</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Time Range Selector & Export */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-limin-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === 'week' && 'Last 7 Days'}
                {range === 'month' && 'Last 30 Days'}
                {range === 'all' && 'All Time'}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            disabled={!analyticsData || loading}
            className="px-4 py-2 bg-limin-secondary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-limin-primary mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {analyticsData && !loading && !error && (
          <div className="p-6 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-100 text-sm font-medium">Total Views</span>
                  <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-100 text-sm font-medium">Favorites</span>
                  <svg className="w-6 h-6 text-red-100" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{analyticsData.totalFavorites.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-100 text-sm font-medium">Contacts</span>
                  <svg className="w-6 h-6 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{analyticsData.totalContacts.toLocaleString()}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 text-sm font-medium">Shares</span>
                  <svg className="w-6 h-6 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold">{analyticsData.totalShares.toLocaleString()}</div>
              </div>
            </div>

            {/* Views Over Time Chart */}
            {analyticsData.viewsOverTime.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-limin-dark mb-4">Views Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#FF6B35" strokeWidth={2} name="Views" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Favorites by Category Chart */}
              {analyticsData.favoritesByCategory.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-limin-dark mb-4">Favorites by Category</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.favoritesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => entry.category && entry.percent ? `${entry.category} (${(entry.percent * 100).toFixed(0)}%)` : ''}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.favoritesByCategory.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Products Chart */}
              {analyticsData.topProducts.length > 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-limin-dark mb-4">Top Performing Listings</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.topProducts.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#4299E1" name="Views" />
                      <Bar dataKey="favorites" fill="#F56565" name="Favorites" />
                      <Bar dataKey="contacts" fill="#48BB78" name="Contacts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top Products Table */}
            {analyticsData.topProducts.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-limin-dark mb-4">Detailed Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Views</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Favorites</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Contacts</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Engagement Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProducts.map((product, index) => {
                        const score = product.views + product.favorites * 2 + product.contacts * 3;
                        return (
                          <tr key={product.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-medium">#{index + 1}</span>
                                <span className="text-gray-900">{product.title}</span>
                              </div>
                            </td>
                            <td className="text-center py-3 px-4 text-gray-700">{product.views}</td>
                            <td className="text-center py-3 px-4 text-gray-700">{product.favorites}</td>
                            <td className="text-center py-3 px-4 text-gray-700">{product.contacts}</td>
                            <td className="text-center py-3 px-4">
                              <span className="inline-block bg-limin-primary/10 text-limin-primary font-bold px-3 py-1 rounded-full">
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
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Analytics Data Yet</h3>
                <p className="text-gray-600">
                  Start getting insights as users interact with your listings!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
