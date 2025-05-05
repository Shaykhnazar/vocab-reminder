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
import { useTranslations } from 'next-intl';

interface AiModel {
  id: string;
  name: string;
  description: string;
}

export default function AiModelSelector() {
  const t = useTranslations('AiModelSelector');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { toast } = useToast();

  // Get available models with translations
  const availableModels: AiModel[] = [
    {
      id: 'gemini',
      name: t('models.gemini.name'),
      description: t('models.gemini.description')
    },
    {
      id: 'gpt4vision',
      name: t('models.gpt4vision.name'),
      description: t('models.gpt4vision.description')
    },
    {
      id: 'claude',
      name: t('models.claude.name'),
      description: t('models.claude.description')
    },
    {
      id: 'imgocr',
      name: t('models.imgocr.name'),
      description: t('models.imgocr.description')
    }
  ];

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
      title: t('toast.modelUpdated'),
      description: t('toast.usingModel', { model: modelName }),
    });
  };

  const getSelectedModelDetails = () => {
    return availableModels.find(model => model.id === selectedModel);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('selectModelPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t('aiModelsLabel')}</SelectLabel>
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
}