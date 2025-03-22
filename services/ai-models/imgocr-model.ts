// services/ai-models/imgocr-model.ts
import { AiModelInterface } from './model-interface';
import { ExtractedWord } from '../img-ocr-service';
import { commonWords } from '../common-words';
import AppConfig from '@/lib/config';

class ImgOcrModel implements AiModelInterface {
  private apiKey: string;
  private dictApiEndpoint: string;

  constructor() {
    this.apiKey = AppConfig.aiModel.imgocr.apiKey;
    this.dictApiEndpoint = AppConfig.apiEndpoints.dictionary;

    if (!this.apiKey) {
      console.error('ImgOCR API key is not set. Set NEXT_PUBLIC_IMGOCR_API_KEY in your environment variables.');
    }
  }

  getModelName(): string {
    return 'ImgOCR';
  }

  async extractWordsFromImage(imageData: string): Promise<ExtractedWord[]> {
    try {
      // API call to ImgOCR
      const response = await fetch('/api/extract-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
        }),
      });

      const data = await response.json();

      if (data.message === 'fail') {
        throw new Error(data.error || 'Failed to extract text from image');
      }

      // Extract text from response
      const extractedText = data.text;

      // Process the text to find potential vocabulary words
      return await this.processExtractedText(extractedText);
    } catch (error) {
      console.error('Error using ImgOCR to extract words:', error);
      throw error;
    }
  }

  /**
   * Process extracted text to find vocabulary words
   */
  private async processExtractedText(text: string): Promise<ExtractedWord[]> {
    // Split text into words, remove punctuation, and filter out common words
    const words = text
      .split(/\s+/)
      .map(word => word.replace(/[^\w\s']/g, '').toLowerCase())
      .filter(word => word.length > 3) // Filter out short words
      .filter(word => !commonWords.includes(word)); // Filter out common words

    // Remove duplicates
    const uniqueWords = [...new Set(words)];

    // Get definitions for each word (limited to avoid API rate limits)
    const wordList = uniqueWords.slice(0, 20); // Limit to 20 words

    // Get definitions for each word
    const definitions = await this.getDefinitionsForWords(wordList);

    // Map words to ExtractedWord format
    const extractedWords: ExtractedWord[] = [];

    for (const word of wordList) {
      if (definitions[word]) {
        extractedWords.push({
          word,
          definition: definitions[word],
          selected: true,
        });
      }
    }

    return extractedWords;
  }

  /**
   * Get definitions for a list of words
   */
  async getDefinitionsForWords(words: string[]): Promise<Record<string, string>> {
    const definitions: Record<string, string> = {};

    // Process in batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < words.length; i += batchSize) {
      const batch = words.slice(i, i + batchSize);

      // Create an array of promises for each word in the batch
      const definitionPromises = batch.map(word => this.getWordDefinition(word));

      // Wait for all promises in the batch to resolve
      const batchResults = await Promise.allSettled(definitionPromises);

      // Process the results
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          definitions[batch[index]] = result.value;
        }
      });

      // Add a small delay between batches to be gentle on the API
      if (i + batchSize < words.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return definitions;
  }

  /**
   * Get definition for a single word
   */
  private async getWordDefinition(word: string): Promise<string | null> {
    try {
      // Using Free Dictionary API
      const response = await fetch(`${this.dictApiEndpoint}${encodeURIComponent(word)}`);

      // If word not found
      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Extract first definition
      if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
        const firstMeaning = data[0].meanings[0];
        if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
          return firstMeaning.definitions[0].definition;
        }
      }

      return null;
    } catch (error) {
      console.error(`Error fetching definition for word: ${word}`, error);
      return null;
    }
  }
}

// Export a singleton instance
const imgOcrModel = new ImgOcrModel();
export default imgOcrModel;
