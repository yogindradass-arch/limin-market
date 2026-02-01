import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Report, UserBan, AdminStats } from '../types/admin';
import type { Product } from '../types/product';

interface AdminModerationDashboardProps {
  onClose: () => void;
  adminId: string;
  onProductClick: (product: Product) => void;
}

type TabType = 'pending' | 'reviewed' | 'dismissed' | 'bans';

export default function AdminModerationDashboard({
  onClose,
  adminId,
  onProductClick,
}: AdminModerationDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [reports, setReports] = useState<Report[]>([]);
  const [bans, setBans] = useState<UserBan[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    pendingReports: 0,
    reviewedReports: 0,
    dismissedReports: 0,
    activeBans: 0,
    hiddenProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const { data: allReports } = await supabase
        .from('reports')
        .select('status');
      
      const { data: hiddenProducts } = await supabase
        .from('products')
        .select('id')
        .eq('status', 'hidden');

      const { data: activeBansData } = await supabase
        .from('user_bans')
        .select('id')
        .or('banned_until.is.null,banned_until.gt.' + new Date().toISOString());

      setStats({
        pendingReports: allReports?.filter(r => r.status === 'pending').length || 0,
        reviewedReports: allReports?.filter(r => r.status === 'reviewed').length || 0,
        dismissedReports: allReports?.filter(r => r.status === 'dismissed').length || 0,
        activeBans: activeBansData?.length || 0,
        hiddenProducts: hiddenProducts?.length || 0,
      });

      // Fetch reports or bans based on active tab
      if (activeTab === 'bans') {
        await fetchBans();
      } else {
        await fetchReports(activeTab);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (status: 'pending' | 'reviewed' | 'dismissed') => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        product:products(id, title, image, seller_id, category),
        reporter:profiles!reports_reporter_id_fkey(email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    setReports(data || []);
  };

  const fetchBans = async () => {
    const { data, error } = await supabase
      .from('user_bans')
      .select(`
        *,
        user:profiles!user_bans_user_id_fkey(email),
        banned_by_user:profiles!user_bans_banned_by_fkey(email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bans:', error);
      return;
    }

    setBans(data || []);
  };

  const handleDismissReport = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: 'dismissed',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;

      await fetchData();
    } catch (error) {
      console.error('Error dismissing report:', error);
      alert('Failed to dismiss report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleHideProduct = async (reportId: string, productId: string) => {
    if (!confirm('Hide this product from public view?')) return;

    setActionLoading(reportId);
    try {
      // Hide the product
      const { error: productError } = await supabase
        .from('products')
        .update({ status: 'hidden' })
        .eq('id', productId);

      if (productError) throw productError;

      // Mark report as reviewed
      const { error: reportError } = await supabase
        .from('reports')
        .update({
          status: 'reviewed',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          notes: 'Product hidden by admin',
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      await fetchData();
    } catch (error) {
      console.error('Error hiding product:', error);
      alert('Failed to hide product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (reportId: string, userId: string, _productTitle: string) => {
    const duration = prompt(
      'Ban duration:\n' +
      '1 = 7 days\n' +
      '2 = 30 days\n' +
      '3 = Permanent\n\n' +
      'Enter choice (1-3):'
    );

    if (!duration || !['1', '2', '3'].includes(duration)) return;

    const reason = prompt('Reason for ban (will be shown to user):');
    if (!reason) return;

    setActionLoading(reportId);
    try {
      // Calculate ban end date
      let bannedUntil: string | null = null;
      if (duration === '1') {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        bannedUntil = date.toISOString();
      } else if (duration === '2') {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        bannedUntil = date.toISOString();
      }

      // Create ban record
      const { error: banError } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: adminId,
          reason,
          banned_until: bannedUntil,
        });

      if (banError) throw banError;

      // Hide all products from banned user
      const { error: hideError } = await supabase
        .from('products')
        .update({ status: 'hidden' })
        .eq('seller_id', userId);

      if (hideError) throw hideError;

      // Mark report as reviewed
      const { error: reportError } = await supabase
        .from('reports')
        .update({
          status: 'reviewed',
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          notes: `User banned: ${reason}`,
        })
        .eq('id', reportId);

      if (reportError) throw reportError;

      alert(`User banned successfully. All their listings have been hidden.`);
      await fetchData();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (banId: string, userId: string) => {
    if (!confirm('Remove ban from this user?')) return;

    setActionLoading(banId);
    try {
      // Delete ban record
      const { error: banError } = await supabase
        .from('user_bans')
        .delete()
        .eq('id', banId);

      if (banError) throw banError;

      // Restore user's products (make them active again)
      const { error: restoreError } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('seller_id', userId)
        .eq('status', 'hidden');

      if (restoreError) throw restoreError;

      alert('User unbanned successfully. Their listings have been restored.');
      await fetchData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      spam_misleading: '📧 Spam/Misleading',
      prohibited_items: '🚫 Prohibited Items',
      harassment: '⚠️ Harassment',
      duplicate: '📋 Duplicate',
      pricing_scam: '💰 Pricing Scam',
      inappropriate_images: '🖼️ Inappropriate Images',
      other: '❓ Other',
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-surface rounded-2xl w-full max-w-6xl shadow-2xl animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                  <p className="text-white/80 text-sm">Moderation & User Management</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-3 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.pendingReports}</div>
                <div className="text-xs text-white/80">Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.reviewedReports}</div>
                <div className="text-xs text-white/80">Reviewed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.dismissedReports}</div>
                <div className="text-xs text-white/80">Dismissed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.activeBans}</div>
                <div className="text-xs text-white/80">Active Bans</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.hiddenProducts}</div>
                <div className="text-xs text-white/80">Hidden</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
            {[
              { id: 'pending' as const, label: 'Pending Reports', count: stats.pendingReports },
              { id: 'reviewed' as const, label: 'Reviewed', count: stats.reviewedReports },
              { id: 'dismissed' as const, label: 'Dismissed', count: stats.dismissedReports },
              { id: 'bans' as const, label: 'User Bans', count: stats.activeBans },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeTab === 'bans' ? (
              /* Bans List */
              <div className="space-y-4">
                {bans.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <p>No banned users</p>
                  </div>
                ) : (
                  bans.map((ban) => {
                    const isExpired = ban.banned_until && new Date(ban.banned_until) < new Date();
                    const isPermanent = !ban.banned_until;

                    return (
                      <div
                        key={ban.id}
                        className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 border border-gray-200 dark:border-dark-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900 dark:text-dark-text">
                                {ban.user?.email || 'Unknown User'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                isPermanent
                                  ? 'bg-red-100 text-red-700'
                                  : isExpired
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {isPermanent ? 'Permanent' : isExpired ? 'Expired' : 'Active'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Reason:</strong> {ban.reason}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Banned by: {ban.banned_by_user?.email || 'System'}</p>
                              <p>Date: {formatDate(ban.created_at)}</p>
                              {ban.banned_until && (
                                <p>
                                  {isExpired ? 'Expired' : 'Expires'}: {formatDate(ban.banned_until)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnbanUser(ban.id, ban.user_id)}
                            disabled={actionLoading === ban.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === ban.id ? 'Unbanning...' : 'Unban User'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Reports List */
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No {activeTab} reports</p>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4 border border-gray-200 dark:border-dark-border"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        {report.product && (
                          <div
                            onClick={() => onProductClick(report.product as any)}
                            className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            {report.product.image ? (
                              <img
                                src={report.product.image}
                                alt={report.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">
                                📦
                              </div>
                            )}
                          </div>
                        )}

                        {/* Report Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">
                                {report.product?.title || 'Product Deleted'}
                              </h3>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  {getReasonLabel(report.reason)}
                                </span>
                                {report.product?.category && (
                                  <span className="text-gray-500">• {report.product.category}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {report.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {report.description}
                            </p>
                          )}

                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Reporter: {report.reporter?.email || 'Anonymous'}</p>
                            <p>Reported: {formatDate(report.created_at)}</p>
                            {report.reviewed_at && (
                              <p>Reviewed: {formatDate(report.reviewed_at)}</p>
                            )}
                            {report.notes && (
                              <p className="text-gray-700 dark:text-gray-300">
                                <strong>Notes:</strong> {report.notes}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          {activeTab === 'pending' && report.product && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => onProductClick(report.product as any)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              >
                                View Product
                              </button>
                              <button
                                onClick={() => handleDismissReport(report.id)}
                                disabled={actionLoading === report.id}
                                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === report.id ? 'Processing...' : 'Dismiss'}
                              </button>
                              <button
                                onClick={() => handleHideProduct(report.id, report.product_id)}
                                disabled={actionLoading === report.id}
                                className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                              >
                                Hide Product
                              </button>
                              <button
                                onClick={() =>
                                  handleBanUser(
                                    report.id,
                                    report.product!.seller_id,
                                    report.product!.title
                                  )
                                }
                                disabled={actionLoading === report.id}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Ban User
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
