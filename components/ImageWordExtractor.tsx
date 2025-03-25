// components/ImageWordExtractor.tsx
'use client';

import {useState, useRef, useEffect} from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { extractWordsFromImage, ExtractedWord } from '@/services/img-ocr-service';
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Loader2, Upload, X, Check, Filter, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/shadcn-ui/card";
import { Badge } from '@/components/shadcn-ui/badge';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';
import AppConfig from "@/lib/config";
import AiModelSelector from './AiModelSelector';

export default function ImageWordExtractor() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedWords, setExtractedWords] = useState<ExtractedWord[]>([]);
  const [showExtractedDialog, setShowExtractedDialog] = useState(false);
  const [isAddingWords, setIsAddingWords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [currentAiModel, setCurrentAiModel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWords } = useWordsStore();

  // Load the currently selected AI model
  useEffect(() => {
    setCurrentAiModel(AppConfig.getCurrentAiModel());

    // Set up an interval to check for model changes
    const interval = setInterval(() => {
      const newModel = AppConfig.getCurrentAiModel();
      if (newModel !== currentAiModel) {
        setCurrentAiModel(newModel);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentAiModel]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: "Image loaded",
        description: "Your image has been loaded successfully. Click 'Extract Words' to process it.",
      });
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processImage = async () => {
    if (!image || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Please upload an image and ensure you're logged in.",
      });
      return;
    }

    // Check if the current AI model has its API key configured
    const modelKey = currentAiModel as 'gemini' | 'gpt4vision' | 'claude' | 'imgocr';
    if (!AppConfig.isApiKeyConfigured(modelKey)) {
      toast({
        title: "API Key Missing",
        description: `The ${modelKey} API key is not configured. Please check your environment variables.`,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Use the OCR service to extract words
      const words = await extractWordsFromImage(image);

      // Check if any words were found
      if (words.length === 0) {
        toast({
          title: "No words found",
          description: "We couldn't find any meaningful vocabulary words in this image. Try another image with clearer text.",
        });
        setIsProcessing(false);
        return;
      }

      setExtractedWords(words);
      setShowExtractedDialog(true);

      toast({
        title: "Success",
        description: `Extracted ${words.length} words from your image using ${getModelDisplayName()}.`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please check your API key or try another AI model.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleWordSelection = (index: number) => {
    setExtractedWords(prev =>
      prev.map((word, i) =>
        i === index ? { ...word, selected: !word.selected } : word
      )
    );
  };

  const toggleAllWords = (selected: boolean) => {
    setExtractedWords(prev =>
      prev.map(word => ({ ...word, selected }))
    );
  };

  const addSelectedWords = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to add words to your vocabulary.",
      });
      return;
    }

    const selectedWords = extractedWords.filter(w => w.selected);
    if (selectedWords.length === 0) {
      toast({
        title: "No words selected",
        description: "Please select at least one word to add.",
      });
      return;
    }

    setIsAddingWords(true);

    try {
      // Convert selected words to the expected format
      const wordsToAdd = selectedWords.map(w => ({
        word: w.word,
        definition: w.definition,
        context: null,
        userId: session.user.id,
      }));

      // Add words to store (this will be updated to add to Supabase in the API service)
      await addWords(wordsToAdd);

      toast({
        title: "Success",
        description: `Added ${selectedWords.length} words to your vocabulary. Reminders have been scheduled.`,
      });

      // Close dialog and reset state
      setShowExtractedDialog(false);
      clearImage();
      setExtractedWords([]);
    } catch (error) {
      console.error("Error adding words:", error);
      toast({
        title: "Error",
        description: "Failed to add words. Please try again.",
      });
    } finally {
      setIsAddingWords(false);
    }
  };

  // Get a user-friendly display name for the current AI model
  const getModelDisplayName = (): string => {
    switch (currentAiModel) {
      case 'gemini':
        return 'Google Gemini';
      case 'gpt4vision':
        return 'GPT-4 Vision';
      case 'claude':
        return 'Claude';
      case 'imgocr':
        return 'ImgOCR';
      default:
        return currentAiModel;
    }
  };

  // Filter words based on search term
  const filteredWords = extractedWords.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Remove duplicates if the option is enabled
  const displayedWords = removeDuplicates
    ? filteredWords.filter((word, index, self) =>
        index === self.findIndex((w) => w.word.toLowerCase() === word.word.toLowerCase())
      )
    : filteredWords;

  return (
    <>
      <Card className="w-full mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Extract Words from Image</CardTitle>
              <CardDescription>
                Upload an image containing text to automatically extract vocabulary words
              </CardDescription>
            </div>
            {AppConfig.features.enableAiModelSelection && (
              <Dialog open={showAiSettings} onOpenChange={setShowAiSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Model Settings</DialogTitle>
                  </DialogHeader>
                  <AiModelSelector />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isUploading || isProcessing}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              {imagePreview && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearImage}
                  disabled={isUploading || isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {imagePreview && (
              <div className="mt-4 space-y-4">
                <div className="relative rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Uploaded"
                    className="max-h-64 w-auto mx-auto"
                  />
                </div>
                <Button
                  onClick={processImage}
                  disabled={isProcessing || isUploading}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Image...
                    </>
                  ) : (
                    "Extract Words"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        {AppConfig.features.enableAiModelSelection && (
          <CardFooter className="border-t bg-muted/50 px-6 py-3">
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Using:</span>
              <Badge variant="outline" className="ml-2">
                {getModelDisplayName()}
              </Badge>
            </div>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showExtractedDialog} onOpenChange={setShowExtractedDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Extracted Words</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-duplicates"
                  checked={removeDuplicates}
                  onCheckedChange={setRemoveDuplicates}
                />
                <Label htmlFor="remove-duplicates">Remove duplicates</Label>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllWords(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllWords(false)}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Word</TableHead>
                  <TableHead>Definition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedWords.length > 0 ? (
                  displayedWords.map((word, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant={word.selected ? "default" : "outline"}
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleWordSelection(
                              extractedWords.findIndex(w => w.word === word.word && w.definition === word.definition)
                            )}
                          >
                            {word.selected && <Check className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell>{word.definition}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No words found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-4">
            <div className="flex items-center justify-between w-full">
              <Badge variant="outline">
                {extractedWords.filter(w => w.selected).length} of {extractedWords.length} selected
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowExtractedDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={addSelectedWords}
                  disabled={isAddingWords || extractedWords.filter(w => w.selected).length === 0}
                >
                  {isAddingWords ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Words...
                    </>
                  ) : (
                    "Add Selected Words"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
