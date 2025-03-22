// lib/config.ts

/**
 * Application configuration
 * Centralizes access to environment variables and configuration
 */
export const AppConfig = {
  // AI Model Settings
  aiModel: {
    default: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini',
    gemini: {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      modelVersion: process.env.NEXT_PUBLIC_GEMINI_MODEL_VERSION || 'gemini-pro-vision',
    },
    gpt4vision: {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      modelVersion: process.env.NEXT_PUBLIC_OPENAI_MODEL_VERSION || 'gpt-4-vision-preview',
    },
    claude: {
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
      modelVersion: process.env.NEXT_PUBLIC_CLAUDE_MODEL_VERSION || 'claude-3-haiku-20240307',
    },
    imgocr: {
      apiKey: process.env.NEXT_PUBLIC_IMGOCR_API_KEY || '',
    }
  },

  // API Endpoints
  apiEndpoints: {
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/',
    openai: 'https://api.openai.com/v1/chat/completions',
    claude: 'https://api.anthropic.com/v1/messages',
    imgocr: 'https://www.imgocr.com/api/imgocr_get_text',
    dictionary: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
  },

  // Feature flags
  features: {
    enableAiModelSelection: process.env.NEXT_PUBLIC_ENABLE_AI_MODEL_SELECTION === 'true',
    maxWordsPerExtraction: parseInt(process.env.NEXT_PUBLIC_MAX_WORDS_PER_EXTRACTION || '20', 10),
    filterCommonWords: process.env.NEXT_PUBLIC_FILTER_COMMON_WORDS !== 'false',
  },

  // Get the currently selected AI model (for client-side use)
  getCurrentAiModel: (): string => {
    if (typeof window !== 'undefined') {
      return (
        (window as any).preferredAiModel ||
        localStorage.getItem('preferredAiModel') ||
        process.env.NEXT_PUBLIC_AI_MODEL ||
        'gemini'
      );
    }
    return process.env.NEXT_PUBLIC_AI_MODEL || 'gemini';
  },

  // Helper method to check if a specific API key is configured
  isApiKeyConfigured: (model: 'gemini' | 'gpt4vision' | 'claude' | 'imgocr'): boolean => {
    const key = AppConfig.aiModel[model].apiKey;
    return !!key && key.length > 0;
  },
};

export default AppConfig;
