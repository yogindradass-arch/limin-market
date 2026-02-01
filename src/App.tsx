import { useState, useEffect } from 'react';
import Header from './components/Header';
import LocationBar from './components/LocationBar';
import FilterBar from './components/FilterBar';
import SortFilterBar from './components/SortFilterBar';
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
import UpdatePasswordModal from './components/UpdatePasswordModal';
import { supabase } from './lib/supabase';
import { useAuth } from './context/AuthContext';
import type { Product } from './types/product';

export default function App() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewingSellerId, setViewingSellerId] = useState<string | null>(null);
  const [viewingSellerName, setViewingSellerName] = useState<string>('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Georgetown');

  // Sort and Filter state
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Products state - fetched from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for password recovery on mount
  useEffect(() => {
    // Check if user clicked password reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      setShowResetPassword(true);
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      console.log('✅ Fetched products from database:', data?.length || 0, 'products');
      console.log('📦 Raw products data:', data);
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
            listingType: item.listing_type as 'wholesale' | 'local' | 'standard',
            listingMode: (item.listing_mode as 'offering' | 'seeking') || 'offering',
            image: item.image_url,
            images: item.images || [item.image_url],
            isFavorited: false,
            rating: 0, // Can be calculated later based on reviews
            timeAgo,
            status: item.status || 'active',
            expiresAt: item.expires_at,
            createdAt: item.created_at,
            // Real Estate fields
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            squareFeet: item.square_feet,
            propertyType: item.property_type,
            listingPurpose: item.listing_purpose,
            // Vehicle fields
            vehicleMake: item.vehicle_make,
            vehicleModel: item.vehicle_model,
            vehicleYear: item.vehicle_year,
            mileage: item.mileage,
            vehicleCondition: item.vehicle_condition,
            transmission: item.transmission,
            fuelType: item.fuel_type,
            // Job fields
            jobType: item.job_type,
            salaryMin: item.salary_min,
            salaryMax: item.salary_max,
            company: item.company,
            experienceLevel: item.experience_level,
            // Service fields
            serviceType: item.service_type,
            serviceArea: item.service_area,
            priceType: item.price_type,
            hourlyRate: item.hourly_rate,
            responseTime: item.response_time,
          };
        });

        console.log('✅ Setting products state with', transformedProducts.length, 'products');
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

  const handleViewSellerProfile = (sellerId: string, sellerName: string) => {
    setViewingSellerId(sellerId);
    setViewingSellerName(sellerName);
    setSelectedProduct(null); // Close product modal
  };

  const closeSellerProfile = () => {
    setViewingSellerId(null);
    setViewingSellerName('');
  };

  const handlePostListing = async (listingData: ListingFormData) => {
    try {
      // Require authentication for posting
      if (!user) {
        alert('Please sign in to post a listing');
        setShowAuth(true);
        return;
      }

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

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
            listing_mode: listingData.listingMode || 'offering',
            image_url: listingData.image || null,
            images: listingData.images || (listingData.image ? [listingData.image] : []),
            is_active: true,
            seller_id: user.id,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            // Real Estate fields
            bedrooms: listingData.bedrooms,
            bathrooms: listingData.bathrooms,
            square_feet: listingData.squareFeet,
            property_type: listingData.propertyType,
            listing_purpose: listingData.listingPurpose,
            // Vehicle fields
            vehicle_make: listingData.vehicleMake,
            vehicle_model: listingData.vehicleModel,
            vehicle_year: listingData.vehicleYear,
            mileage: listingData.mileage,
            vehicle_condition: listingData.vehicleCondition,
            transmission: listingData.transmission,
            fuel_type: listingData.fuelType,
            // Job fields
            job_type: listingData.jobType,
            salary_min: listingData.salaryMin,
            salary_max: listingData.salaryMax,
            company: listingData.company,
            experience_level: listingData.experienceLevel,
            // Service fields
            service_type: listingData.serviceType,
            service_area: listingData.serviceArea,
            price_type: listingData.priceType,
            hourly_rate: listingData.hourlyRate,
            response_time: listingData.responseTime,
          },
        ])
        .select();

      if (error) {
        console.error('Error posting listing:', error);
        alert('Failed to post listing. Please try again.');
        return;
      }

      if (data) {
        console.log('✅ Listing posted successfully:', data);
        console.log('📝 New listing details:', {
          title: data[0]?.title,
          price: data[0]?.price,
          category: data[0]?.category,
          id: data[0]?.id
        });
        alert('Listing posted successfully!');
        setShowPostForm(false);
        // Reset filter to "All" so user can see their new listing
        setActiveFilter('All');
        // Refresh products list
        console.log('🔄 Refreshing products list...');
        await fetchProducts();
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

  const handleEditListing = (productId: string) => {
    // Find the product to edit
    const productToEdit = products.find(p => p.id === productId);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setShowPostForm(true);
    }
  };

  const handleUpdateListing = async (listing: ListingFormData, productId?: string) => {
    if (!user || !productId) {
      alert('You must be logged in to update a listing');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category,
          location: listing.location,
          seller_phone: listing.phone,
          listing_type: listing.listingType,
          listing_mode: listing.listingMode || 'offering',
          image_url: listing.image,
          images: listing.images || [listing.image],
          // Real Estate fields
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          square_feet: listing.squareFeet,
          property_type: listing.propertyType,
          listing_purpose: listing.listingPurpose,
          // Vehicle fields
          vehicle_make: listing.vehicleMake,
          vehicle_model: listing.vehicleModel,
          vehicle_year: listing.vehicleYear,
          mileage: listing.mileage,
          vehicle_condition: listing.vehicleCondition,
          transmission: listing.transmission,
          fuel_type: listing.fuelType,
          // Job fields
          job_type: listing.jobType,
          salary_min: listing.salaryMin,
          salary_max: listing.salaryMax,
          company: listing.company,
          experience_level: listing.experienceLevel,
          // Service fields
          service_type: listing.serviceType,
          service_area: listing.serviceArea,
          price_type: listing.priceType,
          hourly_rate: listing.hourlyRate,
          response_time: listing.responseTime,
        })
        .eq('id', productId)
        .eq('seller_id', user.id); // Ensure user can only update their own listings

      if (error) {
        console.error('Error updating listing:', error);
        alert('Failed to update listing. Please try again.');
        return;
      }

      console.log('✅ Product updated:', productId);
      alert('Listing updated successfully!');
      setShowPostForm(false);
      setEditingProduct(null);
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  const handleDeleteListing = async (productId: string) => {
    try {
      // First, get the product to access its images
      const productToDelete = products.find(p => p.id === productId);

      if (!productToDelete) {
        alert('Product not found.');
        return;
      }

      // Helper function to extract filename from Supabase storage URL
      const getFilePathFromUrl = (url: string): string | null => {
        try {
          // Supabase storage URLs are in format: https://{project}.supabase.co/storage/v1/object/public/product-images/{filename}
          const parts = url.split('/product-images/');
          if (parts.length === 2) {
            return parts[1];
          }
          return null;
        } catch {
          return null;
        }
      };

      // Collect all image file paths to delete
      const imagePaths: string[] = [];

      // Add all images from the images array
      if (productToDelete.images && productToDelete.images.length > 0) {
        productToDelete.images.forEach(imageUrl => {
          const filePath = getFilePathFromUrl(imageUrl);
          if (filePath) {
            imagePaths.push(filePath);
          }
        });
      } else if (productToDelete.image) {
        // Fallback to single image if images array is empty
        const filePath = getFilePathFromUrl(productToDelete.image);
        if (filePath) {
          imagePaths.push(filePath);
        }
      }

      // Delete images from storage if any exist
      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(imagePaths);

        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
          // Don't block the deletion if storage deletion fails
          // Just log the error and continue
        } else {
          console.log('✅ Deleted', imagePaths.length, 'image(s) from storage');
        }
      }

      // Delete the product record from database
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

      console.log('✅ Product deleted:', productId);
      alert('Listing deleted successfully!');
      // Close modal first
      closeModal();
      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  const handleReportListing = async (productId: string, reason: string) => {
    if (!user) {
      alert('You must be logged in to report a listing');
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          product_id: productId,
          reporter_id: user.id,
          reason: reason,
          status: 'pending',
        });

      if (error) {
        console.error('Error reporting listing:', error);
        alert('Failed to submit report. Please try again.');
        return;
      }

      console.log('✅ Report submitted for product:', productId);
    } catch (error) {
      console.error('Error reporting listing:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleMarkAsSold = async (productId: string) => {
    if (!user) {
      alert('You must be logged in to mark a listing as sold');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', productId)
        .eq('seller_id', user.id);

      if (error) {
        console.error('Error marking as sold:', error);
        alert('Failed to mark listing as sold. Please try again.');
        return;
      }

      console.log('✅ Listing marked as sold:', productId);
      alert('Listing marked as sold! It will no longer appear in search results.');
      closeModal();
      await fetchProducts();
    } catch (error) {
      console.error('Error marking as sold:', error);
      alert('Failed to mark listing as sold. Please try again.');
    }
  };

  const handleExtendListing = async (productId: string) => {
    if (!user) {
      alert('You must be logged in to extend a listing');
      return;
    }

    try {
      // Extend listing by 30 days from now
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 30);

      const { error } = await supabase
        .from('products')
        .update({
          expires_at: newExpiresAt.toISOString(),
          status: 'active'
        })
        .eq('id', productId)
        .eq('seller_id', user.id);

      if (error) {
        console.error('Error extending listing:', error);
        alert('Failed to extend listing. Please try again.');
        return;
      }

      console.log('✅ Listing extended:', productId);
      alert('Listing extended for another 30 days!');
      await fetchProducts();
    } catch (error) {
      console.error('Error extending listing:', error);
      alert('Failed to extend listing. Please try again.');
    }
  };

  // All products for search (from Supabase)
  const allProducts = products;

  // Filter products based on active filter and category
  const getFilteredProducts = (products: Product[]) => {
    let filtered = products;

    // Apply category filter first
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply active filter
    if (activeFilter === 'Wanted') filtered = filtered.filter(p => p.listingMode === 'seeking');
    if (activeFilter === 'Nearby') filtered = filtered.filter(p => p.location === currentLocation);
    if (activeFilter === 'Real Estate') filtered = filtered.filter(p => p.category === 'Real Estate');
    if (activeFilter === 'Vehicles') filtered = filtered.filter(p => p.category === 'Vehicles');
    if (activeFilter === 'Jobs') filtered = filtered.filter(p => p.category === 'Jobs');
    if (activeFilter === 'Services') filtered = filtered.filter(p => p.category === 'Services');
    if (activeFilter === 'Under $50') {
      // Include free items when showFreeOnly is enabled
      filtered = filtered.filter(p => showFreeOnly ? (p.price >= 0 && p.price < 50) : (p.price > 0 && p.price < 50));
    }
    if (activeFilter === 'Wholesale') filtered = filtered.filter(p => p.listingType === 'wholesale');

    // Apply free only filter
    if (showFreeOnly) {
      filtered = filtered.filter(p => p.price === 0);
    } else {
      // Apply price range filter (only if not showing free items)
      filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    // Apply sorting
    const sorted = [...filtered];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    } else if (sortBy === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'expiring') {
      sorted.sort((a, b) => {
        const expiresA = new Date(a.expiresAt || '9999-12-31').getTime();
        const expiresB = new Date(b.expiresAt || '9999-12-31').getTime();
        return expiresA - expiresB;
      });
    }

    return sorted;
  };

  const handleClearFilters = () => {
    setPriceRange([0, 10000]);
    setShowFreeOnly(false);
    setSortBy('newest');
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

    if (activeTab === 'account') {
      const myListings = allProducts.filter(p => p.sellerId === user?.id);
      const activeListings = myListings.filter(p => p.status === 'active');

      return (
        <div className="px-4 py-6 pb-24">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-limin-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-limin-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-limin-dark">{user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-sm text-gray-600">{user?.email || 'Not signed in'}</p>
                {user && (
                  <p className="text-xs text-gray-500 mt-1">
                    {activeListings.length} active listing{activeListings.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                className="w-full py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Sign In to Post Listings
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowPostForm(true)}
                  className="py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Post Listing
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Settings
                </button>
              </div>
            )}
          </div>

          {/* My Listings */}
          {user && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-limin-dark mb-4">My Listings</h3>
              {activeListings.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-gray-600 mb-4">You haven't posted any listings yet</p>
                  <button
                    onClick={() => setShowPostForm(true)}
                    className="px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Create First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {activeListings.map(p => (
                    <ProductCard
                      key={p.id}
                      product={{...p, isFavorited: favorites.has(p.id)}}
                      onProductClick={handleProductClick}
                      onFavoriteToggle={toggleFav}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('favorites')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">❤️</span>
                <span className="text-sm font-medium text-gray-700">My Favorites</span>
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <span className="text-xl">ℹ️</span>
                <span className="text-sm font-medium text-gray-700">About Limin Market</span>
              </button>
            </div>
          </div>
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

    if (activeTab === 'favorites') {
      const favoritedProducts = allProducts.filter(p => favorites.has(p.id));
      return (
        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-limin-dark mb-2">My Favorites</h2>
            <p className="text-gray-600">Items you've saved for later</p>
          </div>
          {favoritedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">Start browsing and tap the heart icon on items you love!</p>
              <button
                onClick={() => setActiveTab('home')}
                className="px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoritedProducts.map(p => (
                <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
              ))}
            </div>
          )}
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
    const hasAnyProducts = allProducts.length > 0 || filteredHotDeals.length > 0 || filteredDollarItems.length > 0 || filteredFreeItems.length > 0;

    if (!hasAnyProducts) {
      return (
        <div className="px-4">
          <EmptyState
            icon="🚀"
            title="Launch Your Community Marketplace!"
            message="Be the pioneer! Limin Market isn't just another marketplace—it's your community hub for buying, selling, AND finding what you need. Post items you're offering OR things you're seeking."
            actionLabel="Post First Listing"
            onAction={() => setShowPostForm(true)}
          />

          <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-limin-dark mb-4">What makes Limin Market different?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <strong>Wanted Listings</strong>
                  <p className="text-gray-600">Post what you're seeking, not just what you're selling. Let others find you!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🏠</span>
                <div>
                  <strong>Specialized Categories</strong>
                  <p className="text-gray-600">Real Estate, Vehicles, Jobs, Services—built for your needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <strong>Instant WhatsApp Connect</strong>
                  <p className="text-gray-600">Contact sellers directly with pre-filled messages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🌍</span>
                <div>
                  <strong>Local & Wholesale</strong>
                  <p className="text-gray-600">Filter by nearby items or discover bulk deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Category Filter Banner */}
        {selectedCategory && (
          <div className="mx-4 mt-4 bg-limin-primary/10 border-2 border-limin-primary rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📂</span>
              <span className="font-medium text-limin-dark">
                Showing: <strong>{selectedCategory}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-1 bg-limin-primary text-white text-sm rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Recently Posted - Show first for visibility */}
        <div className="px-4 pt-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-limin-dark flex items-center">
                <span className="text-2xl mr-2">🆕</span>Recently Posted
              </h2>
            </div>
            {(() => {
              const recentProducts = getFilteredProducts(allProducts).slice(0, 10);
              return recentProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {recentProducts.map(p => (
                    <ProductCard key={p.id} product={{...p, isFavorited: favorites.has(p.id)}} onProductClick={handleProductClick} onFavoriteToggle={toggleFav} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-sm text-gray-600">
                    {allProducts.length > 0
                      ? "No items match the current filters."
                      : "No listings yet. Be the first to post!"}
                  </p>
                </div>
              );
            })()}
          </section>
        </div>

        {filteredHotDeals.length > 0 && (
          <HotDealsSection deals={filteredHotDeals} onDealClick={handleProductClick} />
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
                <p className="text-sm text-gray-600">
                  {allProducts.length > 0 && activeFilter !== 'All'
                    ? `No items under $50 match the "${activeFilter}" filter.`
                    : "No affordable items yet. Post budget-friendly deals!"}
                </p>
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
                <p className="text-sm text-gray-600">
                  {allProducts.length > 0 && activeFilter !== 'All'
                    ? `No free items match the "${activeFilter}" filter.`
                    : "No free items yet. Share things you want to give away!"}
                </p>
              </div>
            )}
          </section>

          <section className="pt-4">
            <h2 className="text-xl font-bold text-limin-dark mb-4">Shop by Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Electronics', emoji: '📱' },
                { name: 'Fashion', emoji: '👕' },
                { name: 'Household', emoji: '🏠' },
                { name: 'Sports', emoji: '⚽' },
                { name: 'Vehicles', emoji: '🚗' },
                { name: 'Books', emoji: '📚' },
              ].map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    setSelectedCategory(c.name);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`rounded-lg p-4 text-center hover:shadow-md transition-all cursor-pointer ${
                    selectedCategory === c.name
                      ? 'bg-limin-primary text-white shadow-md'
                      : 'bg-white'
                  }`}
                >
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <p className={`text-sm font-medium ${
                    selectedCategory === c.name ? 'text-white' : 'text-gray-700'
                  }`}>{c.name}</p>
                </button>
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
      {activeTab === 'home' && (
        <div className="px-4 pt-4">
          <SortFilterBar
            sortBy={sortBy}
            onSortChange={setSortBy}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            showFreeOnly={showFreeOnly}
            onFreeOnlyChange={setShowFreeOnly}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {renderContent()}

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearchClick={() => setShowSearch(true)}
      />
      <FAB onClick={() => setShowPostForm(true)} />

      {selectedProduct && (
        <ProductDetailModal
          product={{...selectedProduct, isFavorited: favorites.has(selectedProduct.id)}}
          isOpen={true}
          onClose={closeModal}
          onFavoriteToggle={toggleFav}
          onDelete={handleDeleteListing}
          onEdit={handleEditListing}
          onReport={handleReportListing}
          onMarkAsSold={handleMarkAsSold}
          onExtendListing={handleExtendListing}
          onViewSellerProfile={handleViewSellerProfile}
        />
      )}

      {/* Seller Profile Modal */}
      {viewingSellerId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={closeSellerProfile}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-limin-primary to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {viewingSellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-limin-dark">{viewingSellerName}</h2>
                    <p className="text-sm text-gray-600">
                      {allProducts.filter(p => p.sellerId === viewingSellerId).length} listing{allProducts.filter(p => p.sellerId === viewingSellerId).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeSellerProfile}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Seller's Listings */}
            <div className="p-6">
              {allProducts.filter(p => p.sellerId === viewingSellerId).length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {allProducts
                    .filter(p => p.sellerId === viewingSellerId)
                    .map(p => (
                      <ProductCard
                        key={p.id}
                        product={{...p, isFavorited: favorites.has(p.id)}}
                        onProductClick={handleProductClick}
                        onFavoriteToggle={toggleFav}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-600">No active listings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showPostForm && (
        <PostListingForm
          onClose={() => {
            setShowPostForm(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleUpdateListing : handlePostListing}
          initialData={editingProduct ? {
            title: editingProduct.title,
            description: editingProduct.description || '',
            price: editingProduct.price,
            category: editingProduct.category || '',
            location: editingProduct.location,
            phone: editingProduct.sellerPhone,
            listingType: editingProduct.listingType || 'standard',
            image: editingProduct.image,
            images: editingProduct.images || [editingProduct.image],
          } : undefined}
          productId={editingProduct?.id}
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
        onHomeClick={() => {
          setShowMenu(false);
          setActiveTab('home');
          setSelectedCategory(null);
          setActiveFilter('All');
        }}
        onFavoritesClick={() => {
          setShowMenu(false);
          setActiveTab('favorites');
        }}
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

      <UpdatePasswordModal
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </div>
  );
}
