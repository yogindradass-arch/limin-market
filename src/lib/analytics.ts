import { supabase } from './supabase';

export type AnalyticsEventType = 'view' | 'favorite' | 'contact' | 'share';

export interface AnalyticsEvent {
  id: string;
  product_id: string;
  user_id: string | null;
  event_type: AnalyticsEventType;
  created_at: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalFavorites: number;
  totalContacts: number;
  totalShares: number;
  viewsOverTime: { date: string; count: number }[];
  favoritesByCategory: { category: string; count: number }[];
  topProducts: { product_id: string; title: string; views: number; favorites: number; contacts: number }[];
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  event_type: AnalyticsEventType,
  product_id: string,
  user_id?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_type,
      product_id,
      user_id: user_id || null,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking analytics event:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error tracking analytics event:', err);
    return { success: false, error: 'Failed to track event' };
  }
}

/**
 * Get analytics data for a seller's products
 */
export async function getSellerAnalytics(
  sellerId: string,
  timeRange: 'week' | 'month' | 'all' = 'all'
): Promise<{ data: AnalyticsData | null; error?: string }> {
  try {
    // Calculate date filter based on time range
    let dateFilter: string | null = null;
    if (timeRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = weekAgo.toISOString();
    } else if (timeRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      dateFilter = monthAgo.toISOString();
    }

    // Fetch seller's products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, title, category')
      .eq('seller_id', sellerId);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return { data: null, error: productsError.message };
    }

    if (!products || products.length === 0) {
      return {
        data: {
          totalViews: 0,
          totalFavorites: 0,
          totalContacts: 0,
          totalShares: 0,
          viewsOverTime: [],
          favoritesByCategory: [],
          topProducts: []
        }
      };
    }

    const productIds = products.map(p => p.id);

    // Fetch analytics events
    let query = supabase
      .from('analytics_events')
      .select('*')
      .in('product_id', productIds);

    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError);
      return { data: null, error: eventsError.message };
    }

    // Calculate analytics
    const totalViews = events?.filter(e => e.event_type === 'view').length || 0;
    const totalFavorites = events?.filter(e => e.event_type === 'favorite').length || 0;
    const totalContacts = events?.filter(e => e.event_type === 'contact').length || 0;
    const totalShares = events?.filter(e => e.event_type === 'share').length || 0;

    // Views over time (grouped by day)
    const viewsMap = new Map<string, number>();
    events?.filter(e => e.event_type === 'view').forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      viewsMap.set(date, (viewsMap.get(date) || 0) + 1);
    });
    const viewsOverTime = Array.from(viewsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Favorites by category
    const favoritesMap = new Map<string, number>();
    events?.filter(e => e.event_type === 'favorite').forEach(event => {
      const product = products.find(p => p.id === event.product_id);
      if (product && product.category) {
        favoritesMap.set(product.category, (favoritesMap.get(product.category) || 0) + 1);
      }
    });
    const favoritesByCategory = Array.from(favoritesMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Top products by engagement
    const productStatsMap = new Map<string, { views: number; favorites: number; contacts: number }>();
    events?.forEach(event => {
      const stats = productStatsMap.get(event.product_id) || { views: 0, favorites: 0, contacts: 0 };
      if (event.event_type === 'view') stats.views++;
      if (event.event_type === 'favorite') stats.favorites++;
      if (event.event_type === 'contact') stats.contacts++;
      productStatsMap.set(event.product_id, stats);
    });

    const topProducts = Array.from(productStatsMap.entries())
      .map(([product_id, stats]) => {
        const product = products.find(p => p.id === product_id);
        return {
          product_id,
          title: product?.title || 'Unknown',
          ...stats
        };
      })
      .sort((a, b) => (b.views + b.favorites * 2 + b.contacts * 3) - (a.views + a.favorites * 2 + a.contacts * 3))
      .slice(0, 10);

    return {
      data: {
        totalViews,
        totalFavorites,
        totalContacts,
        totalShares,
        viewsOverTime,
        favoritesByCategory,
        topProducts
      }
    };
  } catch (err) {
    console.error('Error getting seller analytics:', err);
    return { data: null, error: 'Failed to fetch analytics' };
  }
}

/**
 * Export analytics data to CSV
 */
export function exportAnalyticsToCSV(data: AnalyticsData, sellerName: string) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `analytics-${sellerName}-${timestamp}.csv`;

  // Create CSV content
  let csvContent = 'Limin Market - Analytics Report\n\n';
  csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

  csvContent += 'OVERVIEW\n';
  csvContent += 'Metric,Count\n';
  csvContent += `Total Views,${data.totalViews}\n`;
  csvContent += `Total Favorites,${data.totalFavorites}\n`;
  csvContent += `Total Contacts,${data.totalContacts}\n`;
  csvContent += `Total Shares,${data.totalShares}\n\n`;

  csvContent += 'TOP PRODUCTS\n';
  csvContent += 'Product,Views,Favorites,Contacts\n';
  data.topProducts.forEach(p => {
    csvContent += `"${p.title}",${p.views},${p.favorites},${p.contacts}\n`;
  });
  csvContent += '\n';

  csvContent += 'VIEWS OVER TIME\n';
  csvContent += 'Date,Views\n';
  data.viewsOverTime.forEach(v => {
    csvContent += `${v.date},${v.count}\n`;
  });
  csvContent += '\n';

  csvContent += 'FAVORITES BY CATEGORY\n';
  csvContent += 'Category,Favorites\n';
  data.favoritesByCategory.forEach(f => {
    csvContent += `${f.category},${f.count}\n`;
  });

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
