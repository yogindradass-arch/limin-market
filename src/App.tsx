import { useState, useEffect } from 'react';
import Header from './components/Header';
import LocationBar from './components/LocationBar';
import FilterBar from './components/FilterBar';
import HotDealsSection from './components/HotDealsSection';
import ProductCard from './components/ProductCard';
import BottomNav from './components/BottomNav';
import FAB from './components/FAB';
import ProductDetailModal from './components/ProductDetailModal';
import PostListingForm, { type ListingFormData } from './components/PostListingForm';
import SearchModal from './components/SearchModal';
import AuthModal from './components/AuthModal';
import SideMenu from './components/SideMenu';
import LocationSelector from './components/LocationSelector';
import EmptyState from './components/EmptyState';
import AboutModal from './components/AboutModal';
import SettingsModal from './components/SettingsModal';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import type { Product } from './types/product';

export default function App() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Georgetown');

  // Products state - fetched from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (data) {
        // Transform database format to Product type
        const transformedProducts: Product[] = data.map(item => {
          const createdDate = new Date(item.created_at);
          const now = new Date();
          const diffMs = now.getTime() - createdDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          let timeAgo = '';
          if (diffMins < 60) {
            timeAgo = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            timeAgo = `${diffHours}h ago`;
          } else {
            timeAgo = `${diffDays}d ago`;
          }

          return {
            id: item.id,
            title: item.title,
            description: item.description,
            price: Number(item.price),
            category: item.category,
            location: item.location,
            seller: item.seller_name,
            sellerId: item.seller_id,
            sellerPhone: item.seller_phone,
            listingType: item.listing_type as 'wholesale' | 'local',
            image: item.image_url,
            isFavorited: false,
            rating: 0, // Can be calculated later based on reviews
            timeAgo,
          };
        });

        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categorize products
  const hotDeals = products.filter(p => p.price > 0 && p.price < 100);
  const dollarItems = products.filter(p => p.price > 0 && p.price <= 50);
  const freeItems = products.filter(p => p.price === 0);

  const toggleFav = (id: string) => {
    setFavorites(f => {
      const n = new Set(f);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const handlePostListing = async (listingData: ListingFormData) => {
    try {
      // Require authentication for posting
      if (!user) {
        alert('Please sign in to post a listing');
        setShowAuth(true);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            title: listingData.title,
            description: listingData.description,
            price: listingData.price,
            category: listingData.category,
            location: listingData.location,
            seller_name: user.email?.split('@')[0] || 'Seller',
            seller_phone: listingData.phone,
            listing_type: listingData.listingType || 'standard',
            image_url: listingData.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500',
            is_active: true,
            seller_id: user.id,
          },
        ])
        .select();

      if (error) {
        console.error('Error posting listing:', error);
        alert('Failed to post listing. Please try again.');
        return;
      }

      if (data) {
        alert('Listing posted successfully!');
        setShowPostForm(false);
        // Refresh products list
        fetchProducts();
      }
    } catch (error) {
      console.error('Error posting listing:', error);
      alert('Failed to post listing. Please try again.');
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'account' && !user) {
      setShowAuth(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleDeleteListing = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user?.id); // Ensure user can only delete their own listings

      if (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
        return;
      }

      alert('Listing deleted successfully!');
      // Refresh products list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  // All products for search (from Supabase)
  const allProducts = products;

  // Filter products based on active filter
  const getFilteredProducts = (products: Product[]) => {
    if (activeFilter === 'All') return products;
    if (activeFilter === 'Nearby') return products.filter(p => p.location === currentLocation);
    if (activeFilter === 'Under $50') return products.filter(p => p.price > 0 && p.price < 50);
    if (activeFilter === 'Wholesale') return products.filter(p => p.listingType === 'wholesale');
    if (activeFilter === 'New') return products.slice(0, 6); // Newest items
    if (activeFilter === 'Top Rated') return products.filter(p => p.rating >= 4.5);
    return products;
  };

  const filteredHotDeals = getFilteredProducts(hotDeals);
  const filteredDollarItems = getFilteredProducts(dollarItems);
  const filteredFreeItems = getFilteredProducts(freeItems);

  // Render different content based on active tab
  const renderContent = () => {
    // Show loading state while fetching products
    if (loading && activeTab === 'home') {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-limin-primary mb-4"></div>
          <p className="text-gray-600">Loading listings...</p>
        </div>
      );
    }

    if (activeTab === 'messages') {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-24 h-24 bg-limin-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-limin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-limin-dark mb-2">No Messaging System</h2>
          <p className="text-gray-600 mb-6">Limin Market uses direct phone contact. Click any product to see the seller's phone number and call them directly!</p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Browse Products
          </button>
        </div>
      );
    }

    if (activeTab === 'local') {
      const localProducts = allProducts.filter(p => p.listingType === 'local');
      return (
        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-limin-dark mb-2">Local Pickup Only</h2>
            <p className="text-gray-600">Items available for local pickup in {currentLocation}</p>
          </div>
          {localProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No local pickup items</h3>
              <p className="text-gray-600">Check back later for items in your area</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {localProducts.map(p => (
                <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Default home tab content
    const hasAnyProducts = filteredHotDeals.length > 0 || filteredDollarItems.length > 0 || filteredFreeItems.length > 0;

    if (!hasAnyProducts) {
      return (
        <div className="px-4">
          <EmptyState
            icon="🌟"
            title="Be the First to Post!"
            message="Limin Market is ready for its first listings. Start the marketplace by posting something you want to sell, trade, or give away."
            actionLabel="Post Your First Item"
            onAction={() => setShowPostForm(true)}
          />

          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-limin-dark mb-4">What can you post?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <strong>Items for sale</strong>
                  <p className="text-gray-600">Electronics, furniture, vehicles, clothing, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🎁</span>
                <div>
                  <strong>Free items</strong>
                  <p className="text-gray-600">Give away things you no longer need</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">💰</span>
                <div>
                  <strong>Great deals</strong>
                  <p className="text-gray-600">Wholesale items and bargain prices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {filteredHotDeals.length > 0 ? (
          <HotDealsSection deals={filteredHotDeals} onDealClick={handleProductClick} />
        ) : (
          <div className="px-4 pt-6">
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-bold text-limin-dark mb-2">No Hot Deals Yet</h3>
              <p className="text-sm text-gray-600">Be the first to post an amazing deal!</p>
            </div>
          </div>
        )}

        <div className="px-4 py-6 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-limin-dark flex items-center">
                <span className="text-2xl mr-2">💰</span>Dollar Express
              </h2>
              {filteredDollarItems.length > 0 && (
                <button className="text-sm text-limin-primary font-medium">See All →</button>
              )}
            </div>
            {filteredDollarItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {filteredDollarItems.map(p => (
                  <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">💸</div>
                <p className="text-sm text-gray-600">No affordable items yet. Post budget-friendly deals!</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-limin-dark flex items-center">
                <span className="text-2xl mr-2">🎁</span>Free Items
              </h2>
              {filteredFreeItems.length > 0 && (
                <button className="text-sm text-limin-primary font-medium">See All →</button>
              )}
            </div>
            {filteredFreeItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {filteredFreeItems.map(p => (
                  <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-sm text-gray-600">No free items yet. Share things you want to give away!</p>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-limin-dark flex items-center">
                <span className="text-2xl mr-2">🆕</span>Recently Posted
              </h2>
            </div>
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {getFilteredProducts(allProducts).slice(0, 10).map(p => (
                  <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm text-gray-600">No listings yet. Be the first to post!</p>
              </div>
            )}
          </section>

          <section className="pt-4">
            <h2 className="text-xl font-bold text-limin-dark mb-4">Shop by Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Electronics', emoji: '📱' },
                { name: 'Fashion', emoji: '👕' },
                { name: 'Home', emoji: '🏠' },
                { name: 'Sports', emoji: '⚽' },
                { name: 'Vehicles', emoji: '🚗' },
                { name: 'Books', emoji: '📚' },
              ].map(c => (
                <div key={c.name} className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <p className="text-sm font-medium text-gray-700">{c.name}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Header onMenuClick={() => setShowMenu(true)} onSearchClick={() => setShowSearch(true)} />
      <LocationBar location={`${currentLocation}, Guyana`} onLocationClick={() => setShowLocationSelector(true)} />
      {activeTab === 'home' && <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />}

      {renderContent()}

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearchClick={() => setShowSearch(true)}
      />
      <FAB onClick={() => setShowPostForm(true)} />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={true}
          onClose={closeModal}
          onFavoriteToggle={toggleFav}
          onDelete={handleDeleteListing}
        />
      )}

      {showPostForm && (
        <PostListingForm
          onClose={() => setShowPostForm(false)}
          onSubmit={handlePostListing}
        />
      )}

      <SearchModal
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        products={allProducts}
        onProductClick={handleProductClick}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />

      <SideMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onAboutClick={() => {
          setShowMenu(false);
          setShowAbout(true);
        }}
        onSettingsClick={() => {
          setShowMenu(false);
          setShowSettings(true);
        }}
      />

      <LocationSelector
        isOpen={showLocationSelector}
        onClose={() => setShowLocationSelector(false)}
        currentLocation={currentLocation}
        onSelectLocation={setCurrentLocation}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onAuthClick={() => setShowAuth(true)}
      />
    </div>
  );
}
