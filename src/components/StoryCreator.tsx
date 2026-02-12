import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import imageCompression from 'browser-image-compression';

interface StoryCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StoryCreator({ isOpen, onClose, onSuccess }: StoryCreatorProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      let fileToUpload = selectedFile;

      // Compress image if it's an image
      if (selectedFile.type.startsWith('image/')) {
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 1080,
          useWebWorker: true
        };

        fileToUpload = await imageCompression(selectedFile, options);
      }

      // Upload to Supabase Storage
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `stories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Create story record
      const { error: storyError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
          caption: caption.trim() || null,
          is_active: true
        });

      if (storyError) throw storyError;

      // Success!
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading story:', error);
      alert('Failed to upload story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col">
      {!previewUrl ? (
        <>
          {/* Upload Screen */}
          <div className="flex items-center justify-between p-4 text-white">
            <h2 className="text-xl font-bold">Create Story</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed border-white/30 hover:border-white/60 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-6 text-white group"
              >
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold mb-1">Add Photo or Video</p>
                  <p className="text-sm text-white/60">Tap to select</p>
                </div>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Preview Screen */}
          <div className="flex items-center justify-between p-4 text-white bg-black/40 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setCaption('');
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold">Preview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Story Preview */}
          <div className="flex-1 flex items-center justify-center bg-black relative">
            {selectedFile?.type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt="Story preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={previewUrl}
                className="max-w-full max-h-full object-contain"
                controls
              />
            )}

            {/* Caption overlay */}
            {caption && (
              <div className="absolute bottom-32 left-0 right-0 px-6">
                <div className="bg-black/60 backdrop-blur-sm px-5 py-3 rounded-xl">
                  <p className="text-white text-center">{caption}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom controls */}
          <div className="bg-black/50 backdrop-blur-md p-4 space-y-3 border-t border-white/10">
            {/* Caption input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={150}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">
                {caption.length}/150
              </span>
            </div>

            {/* Post button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3.5 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Share to Your Story'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
