import { useState, useEffect } from 'react';
import type { Conversation } from '../types/messages';
import type { Product } from '../types/product';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationClick: (conversation: Conversation) => void;
}

export default function MessagesModal({ isOpen, onClose, onConversationClick }: MessagesModalProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  const fetchConversations = async () => {
    if (!user) {
      console.log('[Messages] No user, skipping fetch');
      setLoading(false); // Make sure loading is false
      return;
    }

    try {
      console.log('[Messages] Starting to fetch conversations for user:', user.id);
      setLoading(true);

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      console.log('[Messages] Query completed. Error:', error, 'Data count:', data?.length);

      if (error) {
        console.error('[Messages] Error fetching conversations:', error);
        alert(`Error loading messages: ${error.message}`);
        return;
      }

      if (data) {
        console.log('[Messages] Processing', data.length, 'conversations');
        // Simplified - no product fetch, no profile fetch
        const enhancedConversations = data.map((conv) => {
          const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
          return {
            ...conv,
            other_user_name: 'User',
            other_user_id: otherUserId
          };
        });

        setConversations(enhancedConversations);
        console.log('[Messages] Set conversations successfully');
      }
    } catch (error) {
      console.error('[Messages] Exception fetching conversations:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('[Messages] Loading complete');
    }
  };

  // Get unread count for current user
  const getUnreadCount = (conv: Conversation) => {
    if (!user) return 0;
    return conv.buyer_id === user.id ? conv.buyer_unread_count : conv.seller_unread_count;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform transition-all max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-limin-dark">Messages</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Sign in to view messages</h3>
                <p className="text-gray-600 mb-6">
                  You need to be signed in to access your conversations
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limin-primary mb-4"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 bg-limin-primary/10 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-limin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-6">
                  Start a conversation by clicking "Contact Seller" on any product!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => {
                  const unreadCount = getUnreadCount(conv);
                  const product = conv.product as Product;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => onConversationClick(conv)}
                      className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-limin-primary transition-all text-left"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {product?.image && product.image !== 'null' ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-limin-dark truncate">
                            {conv.other_user_name}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {product?.title || 'Product'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="inline-block px-2 py-1 bg-limin-primary text-white text-xs font-bold rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
