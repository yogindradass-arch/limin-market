import { useState } from 'react';
import { uploadProductImage } from '../lib/imageUpload';
import { moderateListing } from '../lib/contentModeration';
import { moderateImage } from '../lib/imageModeration';

interface PostListingFormProps {
  onClose: () => void;
  onSubmit: (listing: ListingFormData, productId?: string) => void;
  initialData?: ListingFormData;
  productId?: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  phone: string;
  listingType: 'wholesale' | 'local' | 'standard';
  image: string;
  images?: string[];  // Array of all uploaded image URLs
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
  // Florida
  'Miami, FL',
  'Fort Lauderdale, FL',
  'Orlando, FL',
  // Other US Cities
  'Toronto, Canada',
  'Other',
];

export default function PostListingForm({ onClose, onSubmit, initialData, productId }: PostListingFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!isFree && formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    // In edit mode, existing image is okay; in create mode, require new image
    if (imageFiles.length === 0 && !formData.image.trim()) newErrors.image = 'Please select at least one image';

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

    // Upload images if files were selected
    let imageUrl = formData.image;
    let uploadedImages: string[] = [];

    if (imageFiles.length > 0) {
      setUploadingImage(true);

      // Upload all selected images
      for (const file of imageFiles) {
        const { url, error } = await uploadProductImage(file);

        if (error) {
          setUploadingImage(false);
          setErrors(prev => ({ ...prev, image: error }));
          return;
        }

        if (url) {
          uploadedImages.push(url);
        }
      }

      // Set the first image as the primary image for backwards compatibility
      if (uploadedImages.length > 0) {
        imageUrl = uploadedImages[0];
      }

      setUploadingImage(false);
    }

    onSubmit({
      ...formData,
      price: isFree ? 0 : formData.price,
      image: imageUrl,
      images: uploadedImages.length > 0 ? uploadedImages : (formData.images || [formData.image]),
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
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                placeholder="e.g., iPhone 14 Pro 256GB"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limin-primary focus:border-transparent"
                placeholder="Describe your item in detail..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="mr-2 h-4 w-4 text-limin-primary focus:ring-limin-primary"
                  />
                  <span className="text-sm">This item is FREE</span>
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
                Product Images * (Max 2)
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

              {/* Upload Button */}
              {imageFiles.length < 2 && (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {imageFiles.length === 0 ? 'Select Images' : 'Add Another Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-gray-500">
                    {imageFiles.length}/2 images
                  </span>
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
                  : uploadingImage
                  ? 'Uploading Image...'
                  : (isEditMode ? 'Update Listing' : 'Post Listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
