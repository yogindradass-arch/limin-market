import { useState, useEffect } from 'react';
import type { SavedSearch, SearchFilters } from '../types/search';
import { getFilterSummary } from '../types/search';
import { supabase } from '../lib/supabase';

interface SavedSearchesListProps {
  onClose: () => void;
  onApplySearch: (filters: SearchFilters) => void;
  userId: string;
}

export default function SavedSearchesList({
  onClose,
  onApplySearch,
  userId
}: SavedSearchesListProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedSearches();
  }, [userId]);

  const fetchSavedSearches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        return;
      }

      setSearches(data || []);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    setDeleting(searchId);

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) {
        console.error('Error deleting search:', error);
        alert('Failed to delete search. Please try again.');
        return;
      }

      // Remove from local state
      setSearches((prev) => prev.filter((s) => s.id !== searchId));
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleApplySearch = (search: SavedSearch) => {
    onApplySearch(search.filters);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limin-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-limin-dark">Saved Searches</h2>
            <p className="text-sm text-gray-600 mt-1">
              {searches.length} {searches.length === 1 ? 'search' : 'searches'} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {searches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved searches yet</h3>
              <p className="text-gray-600 mb-6">
                Use Advanced Search to create and save custom search filters
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-limin-primary text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                Start Searching
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map((search) => {
                const summary = getFilterSummary(search.filters);

                return (
                  <div
                    key={search.id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-limin-primary transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Search Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-limin-dark text-lg mb-1 truncate">
                          {search.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {summary}
                        </p>
                        <p className="text-xs text-gray-500">
                          Saved {formatDate(search.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplySearch(search)}
                          className="px-4 py-2 bg-limin-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors whitespace-nowrap"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          disabled={deleting === search.id}
                          className="w-10 h-10 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete search"
                        >
                          {deleting === search.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                          ) : (
                            <svg
                              className="w-5 h-5 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Filter Details (Expandable) */}
                    <details className="mt-3 pt-3 border-t border-gray-200">
                      <summary className="text-sm text-limin-primary cursor-pointer hover:text-orange-600 font-medium">
                        View Filter Details
                      </summary>
                      <div className="mt-3 space-y-2 text-sm text-gray-700">
                        {search.filters.categories.length > 0 && (
                          <p>
                            <span className="font-semibold">Categories:</span>{' '}
                            {search.filters.categories.join(', ')}
                          </p>
                        )}
                        {(search.filters.priceMin || search.filters.priceMax) && (
                          <p>
                            <span className="font-semibold">Price:</span>{' '}
                            {search.filters.priceMin ? `$${search.filters.priceMin}` : 'Any'} -{' '}
                            {search.filters.priceMax ? `$${search.filters.priceMax}` : 'Any'}
                          </p>
                        )}
                        {search.filters.location && (
                          <p>
                            <span className="font-semibold">Location:</span> {search.filters.location}
                          </p>
                        )}
                        {search.filters.listingType && (
                          <p>
                            <span className="font-semibold">Type:</span> {search.filters.listingType}
                          </p>
                        )}
                        {search.filters.listingMode && (
                          <p>
                            <span className="font-semibold">Mode:</span> {search.filters.listingMode}
                          </p>
                        )}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
