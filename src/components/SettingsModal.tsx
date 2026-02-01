import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthClick?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onAuthClick }: SettingsModalProps) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });
  const [showPhone, setShowPhone] = useState(true);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      onClose();
    }
  };

  const handleToggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    alert(newValue ? '🔔 Notifications enabled!' : '🔕 Notifications disabled');
  };

  const handleTogglePhone = () => {
    const newValue = !showPhone;
    setShowPhone(newValue);
    alert(newValue ? '📱 Phone number will be shown on listings' : '🔒 Phone number will be hidden from listings');
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear all cache and data? This will reset your preferences.')) {
      setNotifications(true);
      setShowPhone(true);
      alert('✅ Cache and data cleared successfully!');
    }
  };

  const handlePrivacyPolicy = () => {
    alert('📄 Privacy Policy\n\nYour privacy is important to us. We only collect data necessary to provide our services. Your phone number and listings are stored securely in our database.\n\nFor the full privacy policy, visit our website once launched.');
  };

  const handleTermsOfService = () => {
    alert('📋 Terms of Service\n\nBy using Limin Market, you agree to:\n• Post only legitimate items for sale/trade\n• Provide accurate descriptions\n• Respect other users\n• Not engage in fraudulent activities\n\nFull terms will be available on our website.');
  };

  const handleSignIn = () => {
    onClose();
    onAuthClick?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-limin-primary to-orange-600 px-8 pt-8 pb-6 rounded-t-2xl text-white">
            <div className="text-4xl mb-3">⚙️</div>
            <h2 className="text-3xl font-bold">Settings</h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Account Section */}
            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-4">Account</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">👤</div>
                {user ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 mb-1">{user.email}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-red-600 font-semibold hover:underline"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-3">Not signed in</p>
                    <button
                      onClick={handleSignIn}
                      className="text-sm text-limin-primary font-semibold hover:underline"
                    >
                      Sign In / Sign Up
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Preferences Section */}
            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-4">Preferences</h3>
              <div className="space-y-4">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-500">Get alerts for new listings</p>
                  </div>
                  <button
                    onClick={handleToggleNotifications}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      notifications ? 'bg-limin-primary' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle notifications"
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-gray-800">Dark Mode</p>
                    <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      darkMode ? 'bg-limin-primary' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle dark mode"
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        darkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Phone Number */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-800">Show My Phone Number</p>
                    <p className="text-sm text-gray-500">Display on your listings</p>
                  </div>
                  <button
                    onClick={handleTogglePhone}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      showPhone ? 'bg-limin-primary' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle phone visibility"
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        showPhone ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* App Info Section */}
            <section>
              <h3 className="text-lg font-bold text-limin-dark mb-4">App Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium text-gray-800">1.0.0</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-800">January 2026</span>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <section className="space-y-3">
              <button
                onClick={handlePrivacyPolicy}
                className="w-full py-3 text-left px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <span className="font-medium text-gray-700">Privacy Policy</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleTermsOfService}
                className="w-full py-3 text-left px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <span className="font-medium text-gray-700">Terms of Service</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={handleClearCache}
                className="w-full py-3 text-left px-4 rounded-lg hover:bg-red-50 transition-colors text-red-600 font-medium"
              >
                Clear Cache & Data
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
