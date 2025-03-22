// lib/services/img-ocr-service.ts
import { toast } from '@/hooks/use-toast';

export interface ExtractedWord {
  word: string;
  definition: string;
  selected: boolean;
}

export const extractWordsFromImage = async (image: File): Promise<ExtractedWord[]> => {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(image);

    // API call to ImgOCR
    const response = await fetch('https://www.imgocr.com/api/imgocr_get_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.NEXT_PUBLIC_IMGOCR_API_KEY, // Make sure to set this in your .env.local
        image: base64Image,
      }),
    });

    const data = await response.json();

    if (data.message === 'fail') {
      throw new Error(data.error || 'Failed to extract text from image');
    }

    // Extract text from response
    const extractedText = data.text;

    // Process the text to find potential vocabulary words
    // This is a simple implementation - you might want to enhance this with NLP
    const words = await processExtractedText(extractedText);

    return words;
  } catch (error) {
    console.error('Error extracting words from image:', error);
    throw error;
  }
};

// Helper function to convert File to base64
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

// Process extracted text to find vocabulary words
const processExtractedText = async (text: string): Promise<ExtractedWord[]> => {
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

  // For each word, get definition using Dictionary API
  const extractedWords = await Promise.all(
    wordList.map(async (word) => {
      const definition = await getWordDefinition(word);
      return {
        word,
        definition: definition || 'No definition found',
        selected: true,
      };
    })
  );

  // Filter out words where no definition was found
  return extractedWords.filter(w => w.definition !== 'No definition found');
};

// Get word definition using Dictionary API
const getWordDefinition = async (word: string): Promise<string | null> => {
  try {
    // Using Free Dictionary API
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

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
};

// Common English words to filter out
const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
];
