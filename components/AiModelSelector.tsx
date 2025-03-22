// components/AiModelSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/shadcn-ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { useToast } from "@/hooks/use-toast";

interface AiModel {
  id: string;
  name: string;
  description: string;
}

const availableModels: AiModel[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI model with strong visual understanding'
  },
  {
    id: 'gpt4vision',
    name: 'GPT-4 Vision',
    description: 'OpenAI\'s vision model with excellent text extraction and definition capabilities'
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic\'s Claude model with visual understanding capabilities'
  },
  {
    id: 'imgocr',
    name: 'ImgOCR',
    description: 'Traditional OCR solution with dictionary API integration'
  }
];

const AiModelSelector: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { toast } = useToast();

  // Load the currently selected model on component mount
  useEffect(() => {
    const currentModel = localStorage.getItem('preferredAiModel') || 'gemini';
    setSelectedModel(currentModel);

    // Also update the environment variable if possible
    if (typeof window !== 'undefined') {
      (window as any).preferredAiModel = currentModel;
    }
  }, []);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);

    // Save selection to localStorage
    localStorage.setItem('preferredAiModel', value);

    // Update the runtime environment variable
    if (typeof window !== 'undefined') {
      (window as any).preferredAiModel = value;
    }

    // Show a toast notification
    const modelName = availableModels.find(model => model.id === value)?.name || value;
    toast({
      title: 'AI Model Updated',
      description: `Now using ${modelName} for image word extraction`,
    });
  };

  const getSelectedModelDetails = () => {
    return availableModels.find(model => model.id === selectedModel);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Model Settings</CardTitle>
        <CardDescription>
          Choose which AI model to use for extracting vocabulary from images
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AI model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AI Models</SelectLabel>
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {getSelectedModelDetails() && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-semibold">{getSelectedModelDetails()?.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {getSelectedModelDetails()?.description}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AiModelSelector;
