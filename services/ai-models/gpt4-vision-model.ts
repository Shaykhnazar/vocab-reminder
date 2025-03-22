// services/ai-models/gpt4-vision-model.ts
import { AiModelInterface } from './model-interface';
import { ExtractedWord } from '../img-ocr-service';
import { commonWords } from '../common-words';
import AppConfig from '@/lib/config';

class GPT4VisionModel implements AiModelInterface {
  private apiKey: string;
  private apiEndpoint: string;
  private modelVersion: string;

  constructor() {
    this.apiKey = AppConfig.aiModel.gpt4vision.apiKey;
    this.modelVersion = AppConfig.aiModel.gpt4vision.modelVersion;
    this.apiEndpoint = AppConfig.apiEndpoints.openai;

    if (!this.apiKey) {
      console.error('OpenAI API key is not set. Set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }
  }

  getModelName(): string {
    return 'GPT-4 Vision';
  }

  async extractWordsFromImage(imageData: string): Promise<ExtractedWord[]> {
    try {
      const payload = {
        model: this.modelVersion,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract vocabulary words from this image. Focus on words that would be valuable for language learners to study. For each word, provide a clear, concise definition. Format your response as a JSON array with objects containing 'word' and 'definition' properties. Don't include extremely common words. Only include words that are clearly visible in the image."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.2
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const textContent = data.choices?.[0]?.message?.content;

      if (!textContent) {
        throw new Error('No text content found in GPT-4 Vision response');
      }

      // Try to parse JSON from the response
      // GPT-4 might wrap JSON in markdown code blocks or add extra text
      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
        textContent.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, textContent];

      let extractedJson;

      try {
        // Try to parse the matched JSON, or the whole text if no match
        extractedJson = JSON.parse(jsonMatch[1] || textContent);
      } catch (e) {
        console.error('Failed to parse JSON from GPT-4 Vision response:', e);
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
      console.error('Error using GPT-4 Vision to extract words:', error);
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
const gpt4VisionModel = new GPT4VisionModel();
export default gpt4VisionModel;
