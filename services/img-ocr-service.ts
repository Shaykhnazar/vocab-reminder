// services/img-ocr-service.ts
import { getAiModel } from './ai-models/model-interface';

export interface ExtractedWord {
  word: string;
  definition: string;
  selected: boolean;
}

/**
 * Extract words from an image file
 * This function is the main entry point for image word extraction
 */
export const extractWordsFromImage = async (image: File): Promise<ExtractedWord[]> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(image);

    // Get the configured AI model
    const aiModel = getAiModel();
    console.log(`Using AI model: ${aiModel.getModelName()}`);

    // Use the AI model to extract words
    const words = await aiModel.extractWordsFromImage(base64Image);

    // Log results for debugging
    console.log(`Extracted ${words.length} words from image`);

    return words;
  } catch (error) {
    console.error('Error extracting words from image:', error);
    throw error;
  }
};

/**
 * Helper function to convert File to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('FileReader did not return a string'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
