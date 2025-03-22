// services/ai-models/model-interface.ts
import { ExtractedWord } from '../img-ocr-service';

/**
 * Interface that all AI model implementations must follow
 */
export interface AiModelInterface {
  /**
   * Extract vocabulary words from an image
   * @param imageData The image data as a base64 string
   * @returns Promise resolving to an array of extracted words with definitions
   */
  extractWordsFromImage(imageData: string): Promise<ExtractedWord[]>;

  /**
   * Optional method to get definitions for words
   * Some models can provide definitions directly, others might need a separate API call
   * @param words Array of words to get definitions for
   * @returns Promise resolving to an array of words with definitions
   */
  getDefinitionsForWords?(words: string[]): Promise<Record<string, string>>;

  /**
   * Get the name of the AI model
   * @returns The name of the AI model
   */
  getModelName(): string;
}

/**
 * Factory function to get the configured AI model
 * This makes it easy to swap models by changing a single config value
 */
export function getAiModel(): AiModelInterface {
  let modelName = 'gemini'; // Default model

  // Check for client-side preference first (set by the AiModelSelector component)
  if (typeof window !== 'undefined') {
    // Check window object for runtime preference
    if ((window as any).preferredAiModel) {
      modelName = (window as any).preferredAiModel;
    }
    // Then check localStorage
    else if (localStorage.getItem('preferredAiModel')) {
      modelName = localStorage.getItem('preferredAiModel') || modelName;
    }
  }

  // Fall back to environment variable if no client preference
  if (!modelName || modelName === 'gemini') {
    modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'gemini';
  }

  // Get the appropriate model
  switch (modelName.toLowerCase()) {
    case 'gemini':
      // Dynamic import to avoid loading all models when only one is used
      return require('./gemini-model').default;
    case 'gpt4vision':
      return require('./gpt4-vision-model').default;
    case 'claude':
      return require('./claude-model').default;
    case 'imgocr':
      return require('./imgocr-model').default;
    default:
      // Default to Gemini if not specified or invalid
      return require('./gemini-model').default;
  }
}
