import { useState } from 'react';
import { uploadProductImage } from '../lib/imageUpload';

interface PostListingFormProps {
  onClose: () => void;
  onSubmit: (listing: ListingFormData) => void;
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
}

const categories = [
  'Electronics',
  'Fashion',
  'Home',
  'Sports',
  'Vehicles',
  'Books',
  'Furniture',
  'Tools',
  'Toys',
  'Other',
];

const locations = [
  'Georgetown',
  'New Amsterdam',
  'Linden',
  'Anna Regina',
  'Bartica',
  'Skeldon',
  'Rose Hall',
  'Mahaica',
  'Other',
];

export default function PostListingForm({ onClose, onSubmit }: PostListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    location: '',
    phone: '',
    listingType: 'standard',
    image: '',
  });

  const [isFree, setIsFree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!isFree && formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!imageFile && !formData.image.trim()) newErrors.image = 'Please select an image';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Upload image if a file was selected
    let imageUrl = formData.image;
    if (imageFile) {
      setUploadingImage(true);
      const { url, error } = await uploadProductImage(imageFile);
      setUploadingImage(false);

      if (error) {
        setErrors(prev => ({ ...prev, image: error }));
        return;
      }

      if (url) {
        imageUrl = url;
      }
    }

    onSubmit({
      ...formData,
      price: isFree ? 0 : formData.price,
      image: imageUrl,
    });
  };

  const handleChange = (field: keyof ListingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-end justify-center sm:items-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-limin-dark">Post a Listing</h2>
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
                Product Image *
              </label>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {imageFile ? 'Change Image' : 'Select Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {imageFile && (
                  <span className="text-sm text-gray-600">
                    {imageFile.name}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Upload a photo of your item (JPG, PNG, max 5MB)
              </p>

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
                disabled={uploadingImage}
                className="flex-1 px-6 py-3 bg-limin-primary text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? 'Uploading Image...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
