// components/ImageWordExtractor.tsx
'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Loader2, Upload, X, Check, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/shadcn-ui/card";
import { Badge } from '@/components/shadcn-ui/badge';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';

interface ExtractedWord {
  word: string;
  definition: string;
  selected: boolean;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWords } = useWordsStore();

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

      setIsUploading(true);

      // In a real implementation, you would upload to a secure URL and then process
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "Upload successful",
          description: "Your image has been uploaded successfully.",
        });
      }, 1500);
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
    if (!image || !session?.user?.id) return;

    setIsProcessing(true);

    try {
      // In a real implementation, you would call your AI service here
      // For now, we'll simulate with a timeout and mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted words
      const mockWords: ExtractedWord[] = [
        { word: "ephemeral", definition: "Lasting for a very short time", selected: true },
        { word: "serendipity", definition: "The occurrence of events by chance in a happy way", selected: true },
        { word: "eloquent", definition: "Fluent or persuasive in speaking or writing", selected: true },
        { word: "meticulous", definition: "Showing great attention to detail", selected: true },
        { word: "ubiquitous", definition: "Present, appearing, or found everywhere", selected: true },
        { word: "superfluous", definition: "Unnecessary, especially through being more than enough", selected: true },
        { word: "quintessential", definition: "Representing the most perfect example of a quality or class", selected: true },
      ];

      setExtractedWords(mockWords);
      setShowExtractedDialog(true);

      toast({
        title: "Success",
        description: `Extracted ${mockWords.length} words from your image.`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
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
    if (!session?.user?.id) return;

    const selectedWords = extractedWords.filter(w => w.selected);
    if (selectedWords.length === 0) {
      toast({
        title: "No words selected",
        description: "Please select at least one word to add.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingWords(true);

    try {
      // In a real implementation, you would batch add the words via your API
      const wordsToAdd = selectedWords.map(w => ({
        word: w.word,
        definition: w.definition,
        context: null,
        userId: session.user.id,
      }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call your hooks' addWords method
      addWords(wordsToAdd);

      toast({
        title: "Success",
        description: `Added ${selectedWords.length} words to your vocabulary.`,
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
        variant: "destructive",
      });
    } finally {
      setIsAddingWords(false);
    }
  };

  const filteredWords = extractedWords.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Extract Words from Image</CardTitle>
          <CardDescription>
            Upload an image containing text to automatically extract vocabulary words
          </CardDescription>
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
                {filteredWords.length > 0 ? (
                  filteredWords.map((word, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant={word.selected ? "default" : "outline"}
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleWordSelection(index)}
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
