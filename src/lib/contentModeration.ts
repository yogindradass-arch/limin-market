// Content moderation utilities

// List of banned keywords (case-insensitive)
// This is a basic list - you can expand it as needed
const BANNED_KEYWORDS = [
  // Explicit content
  'porn', 'xxx', 'nsfw', 'nude', 'sex',
  // Hate speech
  'hate', 'racist', 'nazi',
  // Violence
  'kill', 'murder', 'weapon', 'gun', 'explosive',
  // Scams
  'scam', 'fraud', 'stolen', 'fake id', 'counterfeit',
  // Drugs
  'drug', 'cocaine', 'heroin', 'meth',
  // Add more as needed
];

export interface ModerationResult {
  isAllowed: boolean;
  flaggedWords: string[];
  message?: string;
}

/**
 * Check if text contains any banned keywords
 */
export function checkContent(text: string): ModerationResult {
  const lowerText = text.toLowerCase();
  const flaggedWords: string[] = [];

  for (const keyword of BANNED_KEYWORDS) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(lowerText)) {
      flaggedWords.push(keyword);
    }
  }

  if (flaggedWords.length > 0) {
    return {
      isAllowed: false,
      flaggedWords,
      message: 'Your listing contains inappropriate content and cannot be posted. Please review and try again.',
    };
  }

  return {
    isAllowed: true,
    flaggedWords: [],
  };
}

/**
 * Check listing form data for inappropriate content
 */
export function moderateListing(title: string, description: string): ModerationResult {
  // Check title
  const titleResult = checkContent(title);
  if (!titleResult.isAllowed) {
    return titleResult;
  }

  // Check description
  const descriptionResult = checkContent(description);
  if (!descriptionResult.isAllowed) {
    return descriptionResult;
  }

  return {
    isAllowed: true,
    flaggedWords: [],
  };
}
