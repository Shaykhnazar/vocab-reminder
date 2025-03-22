// services/ai-models/claude-model.ts
import { AiModelInterface } from './model-interface';
import { ExtractedWord } from '../img-ocr-service';
import { commonWords } from '../common-words';
import AppConfig from '@/lib/config';

class ClaudeModel implements AiModelInterface {
  private apiKey: string;
  private modelVersion: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = AppConfig.aiModel.claude.apiKey;
    this.modelVersion = AppConfig.aiModel.claude.modelVersion;
    this.apiEndpoint = `${AppConfig.apiEndpoints.claude}${this.modelVersion}:generateContent`;

    if (!this.apiKey) {
      console.error('Anthropic API key is not set. Set NEXT_PUBLIC_ANTHROPIC_API_KEY in your environment variables.');
    }
  }

  getModelName(): string {
    return 'Claude';
  }

  async extractWordsFromImage(imageData: string): Promise<ExtractedWord[]> {
    try {
      const payload = {
        model: this.modelVersion,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract vocabulary words from this image. Focus on words that would be valuable for language learners to study. For each word, provide a clear, concise definition. Format your response as a JSON array with objects containing 'word' and 'definition' properties. Don't include extremely common words. Only include words that are clearly visible in the image."
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageData
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Claude API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const textContent = data.content?.[0]?.text;

      if (!textContent) {
        throw new Error('No text content found in Claude response');
      }

      // Try to parse JSON from the response
      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
        textContent.match(/```\s*([\s\S]*?)\s*```/) ||
        [null, textContent];

      let extractedJson;

      try {
        // Try to parse the matched JSON, or the whole text if no match
        extractedJson = JSON.parse(jsonMatch[1] || textContent);
      } catch (e) {
        console.error('Failed to parse JSON from Claude response:', e);
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
      console.error('Error using Claude to extract words:', error);
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
const claudeModel = new ClaudeModel();
export default claudeModel;
