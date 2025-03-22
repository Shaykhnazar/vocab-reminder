// lib/services/ai-models/gemini-model.ts
import { AiModelInterface } from './model-interface';
import { ExtractedWord } from '../img-ocr-service';
import { commonWords } from '../common-words';
import AppConfig from '@/lib/config';

class GeminiModel implements AiModelInterface {
  private apiKey: string;
  private modelVersion: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = AppConfig.aiModel.gemini.apiKey;
    this.modelVersion = AppConfig.aiModel.gemini.modelVersion;
    this.apiEndpoint = `${AppConfig.apiEndpoints.gemini}${this.modelVersion}:generateContent`;

    if (!this.apiKey) {
      console.error('Gemini API key is not set. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
    }
  }

  getModelName(): string {
    return 'Gemini AI';
  }

  async extractWordsFromImage(imageData: string): Promise<ExtractedWord[]> {
    try {
      // Prepare the request payload for Gemini
      const payload = {
        contents: [
          {
            parts: [
              {
                text: "Extract vocabulary words from this image. Focus on words that would be valuable for language learners to study. For each word, provide a clear, concise definition. Format your response as a JSON array with objects containing 'word' and 'definition' properties. Don't include extremely common words. Only include words that are clearly visible in the image."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      };

      // Make the request to Gemini API
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      // Extract the text content from the response
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        throw new Error('No text content found in Gemini response');
      }

      // Try to parse JSON from the response
      // Gemini might wrap JSON in markdown code blocks or add extra text
      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
                         textContent.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, textContent];

      let extractedJson;

      try {
        // Try to parse the matched JSON, or the whole text if no match
        extractedJson = JSON.parse(jsonMatch[1] || textContent);
      } catch (e) {
        console.error('Failed to parse JSON from Gemini response:', e);
        // Fallback: Try to extract a list format if JSON parsing fails
        return this.fallbackExtraction(textContent);
      }

      // Convert to our ExtractedWord format
      const words: ExtractedWord[] = Array.isArray(extractedJson)
        ? extractedJson.map(item => ({
          word: item.word.toLowerCase(),
          definition: item.definition,
          selected: true,
        }))
        : [];

      // Filter out common words and ensure we have valid entries
      return words
        .filter(word => word.word && word.definition && word.word.length > 1)
        .filter(word => !commonWords.includes(word.word.toLowerCase()));

    } catch (error) {
      console.error('Error using Gemini to extract words:', error);
      throw error;
    }
  }

  /**
   * Fallback method to extract words and definitions if JSON parsing fails
   */
  private fallbackExtraction(text: string): ExtractedWord[] {
    const extractedWords: ExtractedWord[] = [];

    // Try to extract word-definition pairs from text format
    // Look for patterns like "word - definition" or "word: definition"
    const lines = text.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      // Check for various formats
      const delimiterMatch = line.match(/^[*-]?\s*([A-Za-z]+)\s*[-:–]\s*(.+)$/);
      const numberMatch = line.match(/^[0-9]+\.\s*([A-Za-z]+)\s*[-:–]\s*(.+)$/);

      const match = delimiterMatch || numberMatch;

      if (match && match[1] && match[2]) {
        const word = match[1].trim().toLowerCase();
        const definition = match[2].trim();

        if (word.length > 1 && !commonWords.includes(word)) {
          extractedWords.push({
            word,
            definition,
            selected: true
          });
        }
      }
    }

    return extractedWords;
  }
}

// Export a singleton instance
const geminiModel = new GeminiModel();
export default geminiModel;
