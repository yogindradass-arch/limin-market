import { useState, useEffect, useRef } from 'react';
import type { Conversation, Message } from '../types/messages';
import type { Product } from '../types/product';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ChatModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
}

export default function ChatModal({ conversation, isOpen, onClose, onBack }: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (isOpen && conversation) {
      fetchMessages();
      setupRealtimeSubscription();
      markMessagesAsRead();
    }

    return () => {
      if (messageChannelRef.current) {
        supabase.removeChannel(messageChannelRef.current);
      }
    };
  }, [isOpen, conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!conversation) return;

    // Remove existing subscription
    if (messageChannelRef.current) {
      supabase.removeChannel(messageChannelRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel(`conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Mark as read if it's from the other user
          if (newMsg.sender_id !== user?.id) {
            markMessagesAsRead();
          }
        }
      )
      .subscribe();

    messageChannelRef.current = channel;
  };

  const markMessagesAsRead = async () => {
    if (!conversation || !user) return;

    try {
      // Mark all unread messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversation.id)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Reset unread count for current user
      const updateField = conversation.buyer_id === user.id ? 'buyer_unread_count' : 'seller_unread_count';
      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversation.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation || !user || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: messageContent,
          is_read: false
        });

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        setNewMessage(messageContent);
      } else {
        // Send email notification to recipient
        const recipientId = conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;

        // Call Edge Function for email notification (fire and forget)
        supabase.functions.invoke('send-email-notification', {
          body: {
            conversationId: conversation.id,
            emailType: 'new_message',
            recipientId: recipientId
          }
        }).catch(err => {
          console.error('Failed to send email notification:', err);
          // Don't alert user - email failure shouldn't block messaging
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen || !conversation) return null;

  const product = conversation.product as Product;
  const otherUserName = conversation.other_user_name || 'User';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform transition-all h-[90vh] flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 rounded-t-2xl">
            {/* Top Row: Back/Close buttons and User info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Back"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-limin-primary to-orange-600 flex items-center justify-center text-white font-bold">
                    {otherUserName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-limin-dark">{otherUserName}</h3>
                    <p className="text-xs text-gray-500">Active now</p>
                  </div>
                </div>
              </div>
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

            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {product?.image && product.image !== 'null' ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-limin-dark truncate">
                  {product?.title || 'Product'}
                </p>
                <p className="text-sm text-limin-primary font-bold">
                  {product?.price === 0 ? 'FREE' : `$${product?.price.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-limin-primary mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-600">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-limin-primary text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="sticky bottom-0 bg-white border-t p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-limin-primary transition-colors"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="p-3 bg-limin-primary text-white rounded-full hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
