import { useState, useRef, useEffect } from 'react';
import { uploadProductImage, type ImageVariants } from '../lib/imageUpload';
import { moderateListing } from '../lib/contentModeration';
import { moderateImage } from '../lib/imageModeration';

interface PostListingFormProps {
  onClose: () => void;
  onSubmit: (listing: ListingFormData, productId?: string) => void;
  initialData?: ListingFormData;
  productId?: string;
  autoOpenCamera?: boolean;
}

interface ImageUploadProgress {
  stage: 'validating' | 'compressing' | 'uploading' | 'complete';
  variant?: 'thumb' | 'medium' | 'full' | 'original';
  progress: number;
  imageIndex: number;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  phone: string;
  listingType: 'wholesale' | 'local' | 'standard';
  listingMode?: 'offering' | 'seeking';  // Whether offering or seeking
  image: string;
  images?: string[];  // Array of all uploaded image URLs
  imageVariants?: ImageVariants[];  // Array of optimized image variants for each image
  // Real Estate fields
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  propertyType?: string;
  listingPurpose?: string;
  // Vehicle fields
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  mileage?: number;
  vehicleCondition?: string;
  transmission?: string;
  fuelType?: string;
  // Job fields
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  company?: string;
  experienceLevel?: string;
  // Service fields
  serviceType?: string;
  serviceArea?: string;
  priceType?: string;
  hourlyRate?: number;
  responseTime?: string;
  // Delivery fields
  deliveryAvailable?: boolean;
  deliveryOption?: 'pickup' | 'delivery' | 'both';
  deliveryFee?: number;
  deliveryZones?: string[];
  // Diaspora Shopping "Send Home" fields
  sendHomeAvailable?: boolean;
  sendHomeShippingFee?: number;
  sendHomeCarrier?: string;
  sendHomeDeliveryTime?: string;
  sendHomeDestinations?: string[];
}

const categories = [
  'Electronics',
  'Fashion',
  'Household',
  'Sports',
  'Vehicles',
  'Real Estate',
  'Jobs',
  'Services',
  'Books',
  'Furniture',
  'Tools',
  'Toys',
  'Other',
];

const categoriesWithOptionalImages = ['Jobs', 'Services'];
const categoriesWithOptionalPrice = ['Jobs', 'Services'];

const locations = [
  // Guyana 🇬🇾
  'Georgetown, Guyana',
  'New Amsterdam, Guyana',
  'Linden, Guyana',
  'Anna Regina, Guyana',
  'Bartica, Guyana',
  'Skeldon, Guyana',
  'Rose Hall, Guyana',
  'Mahaica, Guyana',
  // New York 🇺🇸
  'Queens, NY',
  'Brooklyn, NY',
  'Bronx, NY',
  'Richmond Hill, NY',
  'Ozone Park, NY',
  'South Ozone Park, NY',
  'Jamaica, NY',
  'Schenectady, NY',
  'Albany, NY',
  'Yonkers, NY',
  'Mount Vernon, NY',
  'Staten Island, NY',
  // Florida 🌴
  'Miami, FL',
  'Fort Lauderdale, FL',
  'Orlando, FL',
  'Lauderhill, FL',
  'Pembroke Pines, FL',
  'Miramar, FL',
  'Tampa, FL',
  'Jacksonville, FL',
  // Other US Cities 🇺🇸
  'Atlanta, GA',
  'Houston, TX',
  'Dallas, TX',
  'Washington, DC',
  'Charlotte, NC',
  'Boston, MA',
  'Philadelphia, PA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Baltimore, MD',
  // Canada 🇨🇦
  'Toronto, Canada',
  'Brampton, Canada',
  'Mississauga, Canada',
  'Scarborough, Canada',
  'Markham, Canada',
  // UK 🇬🇧
  'London, UK',
  'Birmingham, UK',
  'Manchester, UK',
  // Other
  'Other',
];

export default function PostListingForm({ onClose, onSubmit, initialData, productId, autoOpenCamera = false }: PostListingFormProps) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<ListingFormData>(
    initialData || {
      title: '',
      description: '',
      price: 0,
      category: '',
      location: '',
      phone: '',
      listingType: 'standard',
      listingMode: 'offering',
      image: '',
    }
  );

  const [isFree, setIsFree] = useState(initialData ? initialData.price === 0 : false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData && initialData.image ? [initialData.image] : []
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [checkingImage, setCheckingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);

  // Ref for camera input to auto-trigger it
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-open camera when opened from camera button
  useEffect(() => {
    if (autoOpenCamera && !isEditMode && cameraInputRef.current) {
      // Small delay to ensure the modal is fully rendered
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 300);
    }
  }, [autoOpenCamera, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    // Price is optional for Jobs (use salary fields) and Services (use hourly rate)
    if (!categoriesWithOptionalPrice.includes(formData.category)) {
      if (!isFree && formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    // Images are optional for Jobs, Services, and all "Seeking" (Wanted) listings
    const skipImageValidation = categoriesWithOptionalImages.includes(formData.category) || formData.listingMode === 'seeking';
    if (!skipImageValidation) {
      // In edit mode, existing image is okay; in create mode, require new image
      if (imageFiles.length === 0 && !formData.image.trim()) newErrors.image = 'Please select at least one image';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Content moderation check
    const moderationResult = moderateListing(formData.title, formData.description);
    if (!moderationResult.isAllowed) {
      alert(moderationResult.message || 'Your listing contains inappropriate content.');
      return;
    }

    // Get default image for categories that don't need photos
    const getDefaultImageForCategory = (category: string): string => {
      const defaultImages: Record<string, string> = {
        'Jobs': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500',
        'Services': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500',
        'Real Estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500',
        'Vehicles': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500',
      };
      return defaultImages[category] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=500';
    };

    // Upload images if files were selected with optimization
    let imageUrl = formData.image;
    let uploadedImages: string[] = [];
    let imageVariants: ImageVariants[] = [];

    if (imageFiles.length > 0) {
      setUploadingImage(true);

      // Upload all selected images with optimization and progress tracking
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];

        const { variants, error } = await uploadProductImage(file, (progress) => {
          setUploadProgress({ ...progress, imageIndex: i });
        });

        if (error) {
          setUploadingImage(false);
          setUploadProgress(null);
          setErrors(prev => ({ ...prev, image: error }));
          return;
        }

        if (variants) {
          // Store all variants
          imageVariants.push(variants);
          // Use medium variant as the primary URL for backwards compatibility
          uploadedImages.push(variants.medium);
        }
      }

      // Set the first image as the primary image for backwards compatibility
      if (uploadedImages.length > 0) {
        imageUrl = uploadedImages[0];
      }

      setUploadingImage(false);
      setUploadProgress(null);
    }

    // Use default image if no image was uploaded for Jobs/Services
    if (!imageUrl || imageUrl === '') {
      imageUrl = getDefaultImageForCategory(formData.category);
    }

    onSubmit({
      ...formData,
      price: isFree ? 0 : formData.price,
      image: imageUrl,
      images: uploadedImages.length > 0 ? uploadedImages : (formData.images || [imageUrl]),
      imageVariants: imageVariants.length > 0 ? imageVariants : formData.imageVariants,
    }, productId);
  };

  const handleChange = (field: keyof ListingFormData, value: string | number) => {
    // If category is changing, clear specialized fields
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value as string,
        // Clear Real Estate fields
        bedrooms: undefined,
        bathrooms: undefined,
        squareFeet: undefined,
        propertyType: undefined,
        listingPurpose: undefined,
        // Clear Vehicle fields
        vehicleMake: undefined,
        vehicleModel: undefined,
        vehicleYear: undefined,
        mileage: undefined,
        vehicleCondition: undefined,
        transmission: undefined,
        fuelType: undefined,
        // Clear Job fields
        jobType: undefined,
        salaryMin: undefined,
        salaryMax: undefined,
        company: undefined,
        experienceLevel: undefined,
        // Clear Service fields
        serviceType: undefined,
        serviceArea: undefined,
        priceType: undefined,
        hourlyRate: undefined,
        responseTime: undefined,
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    const totalImages = imageFiles.length + files.length;
    if (totalImages > 2) {
      setErrors(prev => ({ ...prev, image: 'Maximum 2 images allowed' }));
      return;
    }

    // Validate each file
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: `"${file.name}" is not an image file` }));
        return;
      }
      if (file.size > maxSize) {
        const actualSize = formatFileSize(file.size);
        setErrors(prev => ({ ...prev, image: `"${file.name}" is ${actualSize}. Max size is 5 MB. Please compress or choose a smaller image.` }));
        return;
      }
    }

    // Check images for inappropriate content
    setCheckingImage(true);
    try {
      for (const file of files) {
        console.log(`🔍 Checking image: ${file.name}`);
        const moderationResult = await moderateImage(file);

        if (!moderationResult.isAllowed) {
          setCheckingImage(false);
          setErrors(prev => ({
            ...prev,
            image: moderationResult.message || 'Image contains inappropriate content and cannot be uploaded.'
          }));
          // Reset the file input
          e.target.value = '';
          return;
        }
      }
      console.log('✅ All images passed moderation check');
    } catch (error) {
      console.error('Error checking image:', error);
      // Allow upload on error (fail open)
    } finally {
      setCheckingImage(false);
    }

    // Add new files
    const newFiles = [...imageFiles, ...files].slice(0, 2);
    setImageFiles(newFiles);

    // Create previews for all images
    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear error
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // If removing the only image and it was the existing one, clear formData.image
    if (imagePreviews.length === 1 && isEditMode) {
      setFormData(prev => ({ ...prev, image: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-end justify-center sm:items-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-limin-dark">
                {isEditMode ? 'Edit Listing' : 'Post a Listing'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Listing Mode Toggle */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What are you doing? *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('listingMode', 'offering')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    formData.listingMode === 'offering'
                      ? 'bg-limin-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-limin-primary'
                  }`}
                >
                  <span className="block text-lg mb-1">💼</span>
                  <span className="block">Offering</span>
                  <span className="block text-xs opacity-75">I'm selling/offering</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('listingMode', 'seeking')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    formData.listingMode === 'seeking'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-600'
                  }`}
                >
                  <span className="block text-lg mb-1">🔍</span>
                  <span className="block">Seeking</span>
                  <span className="block text-xs opacity-75">I'm looking for</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.listingMode === 'seeking' ? 'What are you looking for? *' : 'Title *'}
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                placeholder={
                  formData.listingMode === 'seeking'
                    ? 'e.g., Looking for 2BR apartment in Georgetown'
                    : 'e.g., iPhone 14 Pro 256GB'
                }
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>

              {/* Description Tips */}
              {formData.category && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">💡 Tips for a great description:</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {formData.category === 'Electronics' && (
                          <>
                            <li>• Mention condition, brand, model, and storage/specs</li>
                            <li>• Include what's in the box (charger, cables, box, etc.)</li>
                            <li>• Battery health for phones/laptops</li>
                            <li>• Any scratches, dents, or issues</li>
                          </>
                        )}
                        {formData.category === 'Vehicles' && (
                          <>
                            <li>• Year, make, model, mileage, transmission</li>
                            <li>• Recent maintenance or repairs</li>
                            <li>• Accident history, rust, mechanical issues</li>
                            <li>• Papers up to date, fitness certificate</li>
                          </>
                        )}
                        {formData.category === 'Real Estate' && (
                          <>
                            <li>• Number of bedrooms, bathrooms, square footage</li>
                            <li>• Recent renovations or upgrades</li>
                            <li>• Nearby amenities (schools, shops, transport)</li>
                            <li>• Property title, occupancy status</li>
                          </>
                        )}
                        {formData.category === 'Fashion' && (
                          <>
                            <li>• Brand, size, color, material</li>
                            <li>• Condition (new with tags, gently used, etc.)</li>
                            <li>• Measurements if possible</li>
                            <li>• Any flaws, stains, or alterations</li>
                          </>
                        )}
                        {formData.category === 'Jobs' && (
                          <>
                            <li>• Job responsibilities and requirements</li>
                            <li>• Work schedule and location</li>
                            <li>• Experience level needed</li>
                            <li>• Benefits and growth opportunities</li>
                          </>
                        )}
                        {formData.category === 'Services' && (
                          <>
                            <li>• What's included in the service</li>
                            <li>• Your experience and qualifications</li>
                            <li>• Service area and availability</li>
                            <li>• Response time and booking process</li>
                          </>
                        )}
                        {!['Electronics', 'Vehicles', 'Real Estate', 'Fashion', 'Jobs', 'Services'].includes(formData.category) && (
                          <>
                            <li>• Condition (new, like new, good, fair)</li>
                            <li>• What's included</li>
                            <li>• Any defects or issues</li>
                            <li>• Why you're selling</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                placeholder={
                  formData.listingMode === 'seeking'
                    ? 'Describe what you need in detail...'
                    : 'Describe your item in detail...'
                }
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.listingMode === 'seeking' ? 'Budget/Willing to Pay' : 'Price'} {categoriesWithOptionalPrice.includes(formData.category) ? '' : '*'}
                {categoriesWithOptionalPrice.includes(formData.category) && (
                  <span className="text-gray-500 text-xs ml-1">(Optional - use specialized pricing fields)</span>
                )}
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="mr-2 h-4 w-4 text-limin-primary focus:ring-limin-primary"
                  />
                  <span className="text-sm">
                    {formData.listingMode === 'seeking' ? 'Negotiable/Open to offers' : 'This item is FREE'}
                  </span>
                </label>
              </div>
              {!isFree && (
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Real Estate Specific Fields */}
            {formData.category === 'Real Estate' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-800">Real Estate Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      id="bedrooms"
                      value={formData.bedrooms || ''}
                      onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      id="bathrooms"
                      value={formData.bathrooms || ''}
                      onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="squareFeet" className="block text-sm font-medium text-gray-700 mb-2">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    id="squareFeet"
                    value={formData.squareFeet || ''}
                    onChange={(e) => handleChange('squareFeet', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    value={formData.propertyType || ''}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Land">Land</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="listingPurpose" className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Purpose
                  </label>
                  <select
                    id="listingPurpose"
                    value={formData.listingPurpose || ''}
                    onChange={(e) => handleChange('listingPurpose', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select purpose</option>
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                  </select>
                </div>
              </div>
            )}

            {/* Vehicle Specific Fields */}
            {formData.category === 'Vehicles' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800">Vehicle Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 mb-2">
                      Make
                    </label>
                    <input
                      type="text"
                      id="vehicleMake"
                      value={formData.vehicleMake || ''}
                      onChange={(e) => handleChange('vehicleMake', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="e.g., Toyota"
                    />
                  </div>

                  <div>
                    <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      id="vehicleModel"
                      value={formData.vehicleModel || ''}
                      onChange={(e) => handleChange('vehicleModel', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="e.g., Camry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      id="vehicleYear"
                      value={formData.vehicleYear || ''}
                      onChange={(e) => handleChange('vehicleYear', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage (miles)
                    </label>
                    <input
                      type="number"
                      id="mileage"
                      value={formData.mileage || ''}
                      onChange={(e) => handleChange('mileage', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vehicleCondition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    id="vehicleCondition"
                    value={formData.vehicleCondition || ''}
                    onChange={(e) => handleChange('vehicleCondition', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Used">Used</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission
                    </label>
                    <select
                      id="transmission"
                      value={formData.transmission || ''}
                      onChange={(e) => handleChange('transmission', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    >
                      <option value="">Select transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type
                    </label>
                    <select
                      id="fuelType"
                      value={formData.fuelType || ''}
                      onChange={(e) => handleChange('fuelType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    >
                      <option value="">Select fuel type</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Job Specific Fields */}
            {formData.category === 'Jobs' && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-800">Job Details</h3>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    placeholder="e.g., ABC Company"
                  />
                </div>

                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType || ''}
                    onChange={(e) => handleChange('jobType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={formData.experienceLevel || ''}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range (Annual)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        id="salaryMin"
                        value={formData.salaryMin || ''}
                        onChange={(e) => handleChange('salaryMin', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                        placeholder="Min $"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        id="salaryMax"
                        value={formData.salaryMax || ''}
                        onChange={(e) => handleChange('salaryMax', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                        placeholder="Max $"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Specific Fields */}
            {formData.category === 'Services' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-gray-800">Service Details</h3>

                <div>
                  <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    value={formData.serviceType || ''}
                    onChange={(e) => handleChange('serviceType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                    <option value="Construction">Construction</option>
                    <option value="Catering">Catering</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Event Planning">Event Planning</option>
                    <option value="Beauty & Wellness">Beauty & Wellness</option>
                    <option value="Tutoring">Tutoring</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Area
                  </label>
                  <input
                    type="text"
                    id="serviceArea"
                    value={formData.serviceArea || ''}
                    onChange={(e) => handleChange('serviceArea', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    placeholder="e.g., Georgetown, Kitty, Bel Air"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Type
                    </label>
                    <select
                      id="priceType"
                      value={formData.priceType || ''}
                      onChange={(e) => handleChange('priceType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Per Job">Per Job</option>
                      <option value="Per Item">Per Item</option>
                      <option value="Per Mile">Per Mile</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-2">
                      Rate/Price ($)
                    </label>
                    <input
                      type="number"
                      id="hourlyRate"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleChange('hourlyRate', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Response Time
                  </label>
                  <select
                    id="responseTime"
                    value={formData.responseTime || ''}
                    onChange={(e) => handleChange('responseTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="Immediate">Immediate</option>
                    <option value="Same Day">Same Day</option>
                    <option value="24 Hours">24 Hours</option>
                    <option value="48 Hours">48 Hours</option>
                    <option value="By Appointment">By Appointment</option>
                  </select>
                </div>
              </div>
            )}

            {/* Delivery Options - Show for all categories except Jobs */}
            {formData.category && formData.category !== 'Jobs' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">🚚</span> Delivery Options
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How will buyers receive this item?
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="pickup"
                        checked={formData.deliveryOption === 'pickup'}
                        onChange={(e) => handleChange('deliveryOption', e.target.value)}
                        className="h-4 w-4 text-limin-primary focus:ring-limin-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">Pickup Only</span>
                        <p className="text-xs text-gray-600">Buyer must collect in person</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="delivery"
                        checked={formData.deliveryOption === 'delivery'}
                        onChange={(e) => handleChange('deliveryOption', e.target.value)}
                        className="h-4 w-4 text-limin-primary focus:ring-limin-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">Delivery Only</span>
                        <p className="text-xs text-gray-600">You will deliver to buyer</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value="both"
                        checked={formData.deliveryOption === 'both'}
                        onChange={(e) => handleChange('deliveryOption', e.target.value)}
                        className="h-4 w-4 text-limin-primary focus:ring-limin-primary"
                      />
                      <div>
                        <span className="text-sm font-medium">Both Available</span>
                        <p className="text-xs text-gray-600">Pickup or delivery options</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Show delivery fee input if delivery is available */}
                {(formData.deliveryOption === 'delivery' || formData.deliveryOption === 'both') && (
                  <>
                    <div>
                      <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Fee (GYD)
                      </label>
                      <input
                        type="number"
                        id="deliveryFee"
                        value={formData.deliveryFee || 0}
                        onChange={(e) => handleChange('deliveryFee', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                        placeholder="Enter 0 for free delivery"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.deliveryFee === 0 ? '✅ Free delivery' : `Buyers will pay $${formData.deliveryFee} GYD for delivery`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Zones (Select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Georgetown', 'East Coast', 'West Coast', 'East Bank', 'West Bank', 'Linden', 'New Amsterdam', 'Nationwide'].map(zone => (
                          <label key={zone} className="flex items-center gap-2 p-2 border border-gray-300 rounded cursor-pointer hover:bg-orange-100">
                            <input
                              type="checkbox"
                              checked={formData.deliveryZones?.includes(zone) || false}
                              onChange={(e) => {
                                const currentZones = formData.deliveryZones || [];
                                const newZones = e.target.checked
                                  ? [...currentZones, zone]
                                  : currentZones.filter(z => z !== zone);
                                handleChange('deliveryZones', newZones as any);
                              }}
                              className="h-4 w-4 text-limin-primary focus:ring-limin-primary"
                            />
                            <span className="text-sm">{zone}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Diaspora Shopping "Send Home" - Show for physical products only */}
            {formData.category && !['Jobs', 'Services', 'Real Estate'].includes(formData.category) && (
              <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-xl">🇬🇾→🇺🇸</span> Diaspora Shopping (Send Home)
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Ship items to buyers in the USA, Canada & UK</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendHomeAvailable || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, sendHomeAvailable: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.sendHomeAvailable && (
                  <div className="space-y-4 pt-3 border-t border-blue-200">
                    {/* Shipping Carrier */}
                    <div>
                      <label htmlFor="sendHomeCarrier" className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Carrier
                      </label>
                      <select
                        id="sendHomeCarrier"
                        value={formData.sendHomeCarrier || ''}
                        onChange={(e) => handleChange('sendHomeCarrier', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select carrier</option>
                        <option value="FedEx">FedEx</option>
                        <option value="DHL">DHL</option>
                        <option value="USPS">USPS</option>
                        <option value="UPS">UPS</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Shipping Fee */}
                    <div>
                      <label htmlFor="sendHomeShippingFee" className="block text-sm font-medium text-gray-700 mb-2">
                        International Shipping Fee (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          id="sendHomeShippingFee"
                          value={formData.sendHomeShippingFee || 0}
                          onChange={(e) => handleChange('sendHomeShippingFee', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.sendHomeShippingFee === 0 ? '✅ Free international shipping' : `Buyers will pay $${formData.sendHomeShippingFee?.toFixed(2) || '0.00'} USD for shipping`}
                      </p>
                    </div>

                    {/* Delivery Time */}
                    <div>
                      <label htmlFor="sendHomeDeliveryTime" className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Delivery Time
                      </label>
                      <select
                        id="sendHomeDeliveryTime"
                        value={formData.sendHomeDeliveryTime || ''}
                        onChange={(e) => handleChange('sendHomeDeliveryTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select delivery time</option>
                        <option value="3-5 days">3-5 business days</option>
                        <option value="5-7 days">5-7 business days</option>
                        <option value="7-10 days">7-10 business days</option>
                        <option value="10-14 days">10-14 business days</option>
                        <option value="2-3 weeks">2-3 weeks</option>
                      </select>
                    </div>

                    {/* Shipping Destinations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Shipping Destinations
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { code: 'usa', label: '🇺🇸 USA', value: 'USA' },
                          { code: 'canada', label: '🇨🇦 Canada', value: 'Canada' },
                          { code: 'uk', label: '🇬🇧 United Kingdom', value: 'UK' },
                          { code: 'caribbean', label: '🏝️ Caribbean', value: 'Caribbean' }
                        ].map(dest => (
                          <label key={dest.code} className="flex items-center gap-2 p-2 border border-gray-300 rounded cursor-pointer hover:bg-blue-50">
                            <input
                              type="checkbox"
                              checked={formData.sendHomeDestinations?.includes(dest.value) || false}
                              onChange={(e) => {
                                const currentDests = formData.sendHomeDestinations || [];
                                const newDests = e.target.checked
                                  ? [...currentDests, dest.value]
                                  : currentDests.filter(d => d !== dest.value);
                                handleChange('sendHomeDestinations', newDests as any);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{dest.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-blue-100 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Items with "Send Home" shipping are displayed to diaspora buyers in USD and include international shipping options.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
              >
                <option value="">Select a location</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                placeholder="592-XXX-XXXX"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Listing Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="standard"
                    checked={formData.listingType === 'standard'}
                    onChange={(e) => handleChange('listingType', e.target.value)}
                    className="mr-2 h-4 w-4 text-limin-primary focus:ring-limin-primary"
                  />
                  <span className="text-sm">Standard</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="wholesale"
                    checked={formData.listingType === 'wholesale'}
                    onChange={(e) => handleChange('listingType', e.target.value)}
                    className="mr-2 h-4 w-4 text-limin-primary focus:ring-limin-primary"
                  />
                  <span className="text-sm">Wholesale</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="listingType"
                    value="local"
                    checked={formData.listingType === 'local'}
                    onChange={(e) => handleChange('listingType', e.target.value)}
                    className="mr-2 h-4 w-4 text-limin-primary focus:ring-limin-primary"
                  />
                  <span className="text-sm">Local Pickup Only</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images {(['Jobs', 'Services'].includes(formData.category) || formData.listingMode === 'seeking') ? '(Optional, Max 2)' : '* (Max 2)'}
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {/* File size badge - only show for new files */}
                      {imageFiles[index] && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                          {formatFileSize(imageFiles[index].size)}
                        </div>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Options */}
              {imageFiles.length < 2 && (
                <div className="space-y-3">
                  {/* Take Photo Button (Mobile Camera) */}
                  <label className="flex items-center justify-center w-full h-14 border-2 border-limin-primary bg-limin-primary/5 rounded-lg cursor-pointer hover:bg-limin-primary/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-limin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold text-limin-primary">📸 Take Photo</span>
                    </div>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      disabled={checkingImage}
                    />
                  </label>

                  {/* Choose from Gallery Button */}
                  <label className="flex items-center justify-center w-full h-14 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-gray-600">📁 Choose from Gallery</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      disabled={checkingImage}
                    />
                  </label>

                  <div className="flex justify-center">
                    <span className="text-xs text-gray-500">
                      {imageFiles.length}/2 images
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Upload photos of your item (JPG, PNG, max 5MB each)
              </p>

              {checkingImage && (
                <div className="flex items-center gap-2 mt-2 text-blue-600">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">Checking image for inappropriate content...</span>
                </div>
              )}

              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage || checkingImage}
                className="flex-1 px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingImage
                  ? 'Checking Image...'
                  : uploadingImage && uploadProgress
                  ? `${uploadProgress.stage === 'validating' ? 'Validating' : uploadProgress.stage === 'compressing' ? `Compressing ${uploadProgress.variant}` : uploadProgress.stage === 'uploading' ? `Uploading ${uploadProgress.variant}` : 'Processing'}... ${Math.round(uploadProgress.progress)}%`
                  : uploadingImage
                  ? 'Uploading Images...'
                  : (isEditMode ? 'Update Listing' : 'Post Listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
