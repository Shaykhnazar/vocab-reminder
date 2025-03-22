// components/BulkWordAdder.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { Button } from "@/components/shadcn-ui/button";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Input } from "@/components/shadcn-ui/input";
import { Loader2, Upload, Filter, Check, X } from 'lucide-react';
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
  CardFooter,
} from "@/components/shadcn-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select";
import { Badge } from '@/components/shadcn-ui/badge';
import { Switch } from '@/components/shadcn-ui/switch';
import { Label } from '@/components/shadcn-ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";

interface ParsedWord {
  word: string;
  definition: string;
  selected: boolean;
}

interface WordFile {
  name: string;
  content: string;
}

export default function BulkWordAdder() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file' | 'paste'>('text');
  const [wordText, setWordText] = useState('');
  const [wordFile, setWordFile] = useState<WordFile | null>(null);
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([]);
  const [showParsedDialog, setShowParsedDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingWords, setIsAddingWords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'word' | 'definition'>('word');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formatType, setFormatType] = useState<'word-definition' | 'csv' | 'json'>('word-definition');
  const [separator, setSeparator] = useState<string>('-');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWords } = useWordsStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (evt.target && typeof evt.target.result === 'string') {
          setWordFile({
            name: file.name,
            content: evt.target.result
          });

          toast({
            title: "File loaded",
            description: `Successfully loaded ${file.name}`,
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",

        });
      };

      reader.readAsText(file);
    }
  };

  const clearFile = () => {
    setWordFile(null);
  };

  const parseWords = () => {
    setIsProcessing(true);

    let content = '';
    if (inputMethod === 'text') {
      content = wordText;
    } else if (inputMethod === 'file' && wordFile) {
      content = wordFile.content;
    } else if (inputMethod === 'paste') {
      content = wordText;
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "No content to parse",

      });
      setIsProcessing(false);
      return;
    }

    try {
      let parsed: ParsedWord[] = [];

      if (formatType === 'word-definition') {
        // Split by lines and then by the separator
        const lines = content.split('\n').filter(line => line.trim());

        parsed = lines.map(line => {
          const parts = line.split(separator, 2);
          return {
            word: parts[0]?.trim() || '',
            definition: parts[1]?.trim() || '',
            selected: true
          };
        }).filter(item => item.word && item.definition);
      } else if (formatType === 'csv') {
        // Simple CSV parsing (could be enhanced with a CSV library)
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          // Assuming first row is header, skip it
          const dataLines = lines.slice(1);

          parsed = dataLines.map(line => {
            const parts = line.split(',');
            return {
              word: parts[0]?.trim().replace(/^"|"$/g, '') || '',
              definition: parts[1]?.trim().replace(/^"|"$/g, '') || '',
              selected: true
            };
          }).filter(item => item.word);
        }
      } else if (formatType === 'json') {
        try {
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            parsed = jsonData.map(item => ({
              word: (item.word || item.term || '').toString().trim(),
              definition: (item.definition || item.meaning || '').toString().trim(),
              selected: true
            })).filter(item => item.word && item.definition);
          }
        } catch (err) {
          throw new Error('Invalid JSON format');
        }
      }

      // Remove duplicates if option is enabled
      if (removeDuplicates) {
        const uniqueWords = new Set();
        parsed = parsed.filter(item => {
          const lowerWord = item.word.toLowerCase();
          if (uniqueWords.has(lowerWord)) {
            return false;
          }
          uniqueWords.add(lowerWord);
          return true;
        });
      }

      if (parsed.length === 0) {
        throw new Error('No valid words found in the provided content');
      }

      setParsedWords(parsed);
      setShowParsedDialog(true);

      toast({
        title: "Success",
        description: `Parsed ${parsed.length} words successfully.`,
      });
    } catch (error) {
      console.error("Error parsing words:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse words",

      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleWordSelection = (index: number) => {
    setParsedWords(prev =>
      prev.map((word, i) =>
        i === index ? { ...word, selected: !word.selected } : word
      )
    );
  };

  const toggleAllWords = (selected: boolean) => {
    setParsedWords(prev =>
      prev.map(word => ({ ...word, selected }))
    );
  };

  const addSelectedWords = async () => {
    if (!session?.user?.id) return;

    const selectedWords = parsedWords.filter(w => w.selected);
    if (selectedWords.length === 0) {
      toast({
        title: "No words selected",
        description: "Please select at least one word to add.",

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
      setShowParsedDialog(false);
      setWordText('');
      setWordFile(null);
      setParsedWords([]);
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

  const sortWords = (field: 'word' | 'definition', order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
  };

  // Apply filtering and sorting
  const processedWords = [...parsedWords]
    .filter(word =>
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Multiple Words</CardTitle>
          <CardDescription>
            Add words in bulk by typing, pasting, or uploading a file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'text' | 'file' | 'paste')}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="text">Type or Paste</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
              <TabsTrigger value="paste">Advanced Format</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="word-text">Enter one word per line using the format: word{separator}definition</Label>
                <Textarea
                  id="word-text"
                  placeholder={`apple${separator}a red fruit that grows on trees\ndiligent${separator}working hard and being careful`}
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="text-sm text-muted-foreground">
                  Each line should contain a word and its definition separated by "{separator}"
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  {wordFile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {wordFile && (
                  <div className="p-4 border rounded-md bg-muted/50">
                    <p className="font-medium">File: {wordFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {wordFile.content.length > 200
                        ? wordFile.content.substring(0, 200) + '...'
                        : wordFile.content}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>File Format</Label>
                  <Select
                    value={formatType}
                    onValueChange={(value) => setFormatType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word-definition">Text (word{separator}definition)</SelectItem>
                      <SelectItem value="csv">CSV (word,definition)</SelectItem>
                      <SelectItem value="json">JSON Array</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format-type">Format Type</Label>
                  <Select
                    value={formatType}
                    onValueChange={(value) => setFormatType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word-definition">Text (word{separator}definition)</SelectItem>
                      <SelectItem value="csv">CSV (word,definition)</SelectItem>
                      <SelectItem value="json">JSON Array</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formatType === 'word-definition' && (
                  <div className="space-y-2">
                    <Label htmlFor="separator">Separator</Label>
                    <Input
                      id="separator"
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                      placeholder="e.g. - or : or |"
                      className="max-w-[200px]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="paste-area">Paste Your Content</Label>
                  <Textarea
                    id="paste-area"
                    placeholder={formatType === 'json'
                      ? '[{"word":"apple","definition":"a red fruit"},{"word":"banana","definition":"a yellow fruit"}]'
                      : formatType === 'csv'
                        ? 'word,definition\napple,a red fruit\nbanana,a yellow fruit'
                        : `apple${separator}a red fruit\nbanana${separator}a yellow fruit`
                    }
                    value={wordText}
                    onChange={(e) => setWordText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="remove-duplicates-input"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
            <Label htmlFor="remove-duplicates-input">Remove duplicates</Label>
          </div>
          <Button
            onClick={parseWords}
            disabled={isProcessing || (inputMethod === 'text' && !wordText) || (inputMethod === 'file' && !wordFile)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Words"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showParsedDialog} onOpenChange={setShowParsedDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Processed Words</DialogTitle>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="sort-by" className="text-sm">Sort by:</Label>
                <Select value={sortField} onValueChange={(value) => sortWords(value as 'word' | 'definition', sortOrder)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="word">Word</SelectItem>
                    <SelectItem value="definition">Definition</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => sortWords(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↓' : '↑'}
                </Button>
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
                {processedWords.length > 0 ? (
                  processedWords.map((word, index) => (
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
                {parsedWords.filter(w => w.selected).length} of {parsedWords.length} selected
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowParsedDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={addSelectedWords}
                  disabled={isAddingWords || parsedWords.filter(w => w.selected).length === 0}
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
