import * as nsfwjs from 'nsfwjs';

export interface ImageModerationResult {
  isAllowed: boolean;
  message?: string;
  predictions?: Array<{
    className: string;
    probability: number;
  }>;
}

let model: nsfwjs.NSFWJS | null = null;

/**
 * Loads the NSFW.js model (only loads once, then cached)
 */
async function loadModel(): Promise<nsfwjs.NSFWJS> {
  if (model) return model;

  try {
    // Load the MobileNetV2 model (smaller and faster)
    model = await nsfwjs.load();
    console.log('✅ NSFW.js model loaded');
    return model;
  } catch (error) {
    console.error('❌ Failed to load NSFW.js model:', error);
    throw new Error('Failed to load image moderation model');
  }
}

/**
 * Analyzes an image file for inappropriate content
 * @param file - The image file to analyze
 * @returns ModerationResult indicating if the image is safe
 */
export async function moderateImage(file: File): Promise<ImageModerationResult> {
  try {
    // Load the model
    const nsfwModel = await loadModel();

    // Create an image element to load the file
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(file);

    // Wait for the image to load
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    // Classify the image
    const predictions = await nsfwModel.classify(img);

    // Clean up
    URL.revokeObjectURL(imageUrl);

    console.log('🔍 Image moderation results:', predictions);

    // Define thresholds for each category
    // Higher thresholds = more lenient (reduces false positives for cars, products, etc.)
    const PORN_THRESHOLD = 0.6;      // Block if >60% porn (was 30%)
    const HENTAI_THRESHOLD = 0.6;    // Block if >60% hentai (was 30%)
    const SEXY_THRESHOLD = 0.85;     // Block if >85% sexy (was 60%)

    // Find the predictions
    const pornScore = predictions.find(p => p.className === 'Porn')?.probability || 0;
    const hentaiScore = predictions.find(p => p.className === 'Hentai')?.probability || 0;
    const sexyScore = predictions.find(p => p.className === 'Sexy')?.probability || 0;

    // Check if image should be blocked
    if (pornScore > PORN_THRESHOLD) {
      return {
        isAllowed: false,
        message: 'This image contains explicit sexual content and cannot be uploaded.',
        predictions,
      };
    }

    if (hentaiScore > HENTAI_THRESHOLD) {
      return {
        isAllowed: false,
        message: 'This image contains inappropriate animated content and cannot be uploaded.',
        predictions,
      };
    }

    if (sexyScore > SEXY_THRESHOLD) {
      return {
        isAllowed: false,
        message: 'This image contains inappropriate provocative content and cannot be uploaded.',
        predictions,
      };
    }

    // Image is safe
    return {
      isAllowed: true,
      predictions,
    };
  } catch (error) {
    console.error('❌ Error during image moderation:', error);

    // In case of error, allow the image (fail open)
    // You can change this to fail closed (block) if preferred
    return {
      isAllowed: true,
      message: 'Image moderation check failed, but upload is allowed.',
    };
  }
}
