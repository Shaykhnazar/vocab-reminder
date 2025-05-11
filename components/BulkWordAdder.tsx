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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('BulkWordAdder');
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
            title: t('toast.fileLoaded'),
            description: t('toast.fileLoadedDesc', { filename: file.name }),
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: t('toast.error'),
          description: t('toast.fileReadError'),
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
        title: t('toast.error'),
        description: t('toast.noContent'),
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
        // Simple CSV parsing
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
          throw new Error(t('errors.invalidJson'));
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
        throw new Error(t('errors.noValidWords'));
      }

      setParsedWords(parsed);
      setShowParsedDialog(true);

      toast({
        title: t('toast.success'),
        description: t('toast.parseSuccess', { count: parsed.length }),
      });
    } catch (error) {
      console.error("Error parsing words:", error);
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('errors.parseError'),
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
        title: t('toast.noWordsSelected'),
        description: t('toast.selectWords'),
      });
      return;
    }

    setIsAddingWords(true);

    try {
      // Prepare words for adding
      const wordsToAdd = selectedWords.map(w => ({
        word: w.word,
        definition: w.definition,
        context: null,
        userId: session.user.id,
      }));

      // Add words to store
      addWords(wordsToAdd);

      toast({
        title: t('toast.success'),
        description: t('toast.addSuccess', { count: selectedWords.length }),
      });

      // Close dialog and reset state
      setShowParsedDialog(false);
      setWordText('');
      setWordFile(null);
      setParsedWords([]);
    } catch (error) {
      console.error("Error adding words:", error);
      toast({
        title: t('toast.error'),
        description: t('toast.addError'),
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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">{t('title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as 'text' | 'file' | 'paste')}
                className="w-full"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              {/* Tabs with horizontal scroll on mobile */}
              <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <TabsList className="inline-flex md:grid md:grid-cols-4 h-9 gap-1">
                  <TabsTrigger value="text" className="text-xs md:text-sm whitespace-nowrap">{t('tabs.typeOrPaste')}</TabsTrigger>
                  <TabsTrigger value="file" className="text-xs md:text-sm whitespace-nowrap">{t('tabs.uploadFile')}</TabsTrigger>
                  <TabsTrigger value="paste" className="text-xs md:text-sm whitespace-nowrap">{t('tabs.advancedFormat')}</TabsTrigger>
                </TabsList>
              </div>
            </div>

              <TabsContent value="text" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Label htmlFor="word-text" className="text-sm leading-relaxed block">
                      {t('text.instructions', {separator})}
                    </Label>
                    <Textarea
                      id="word-text"
                      placeholder={t('text.placeholder', {separator})}
                      value={wordText}
                      onChange={(e) => setWordText(e.target.value)}
                      className="min-h-[150px] md:min-h-[200px] text-sm leading-relaxed"
                    />
                    <div className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {t('text.helpText', {separator})}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                      <Input
                        type="file"
                        accept=".txt,.csv,.json"
                        onChange={handleFileUpload}
                        className="flex-1 text-sm"
                      />
                      {wordFile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearFile}
                          className="self-end md:self-auto"
                        >
                          <X className="h-4 w-4"/>
                        </Button>
                      )}
                    </div>

                    {wordFile && (
                      <div className="p-3 md:p-4 border rounded-md bg-muted/50">
                        <p className="font-medium text-sm">{t('file.label')}: {wordFile.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                          {wordFile.content.length > 200
                            ? wordFile.content.substring(0, 200) + '...'
                            : wordFile.content}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm leading-relaxed">{t('file.formatLabel')}</Label>
                      <Select
                        value={formatType}
                        onValueChange={(value) => setFormatType(value as any)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t('file.selectFormatPlaceholder')}/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="word-definition">{t('file.formats.text', {separator})}</SelectItem>
                          <SelectItem value="csv">{t('file.formats.csv')}</SelectItem>
                          <SelectItem value="json">{t('file.formats.json')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="paste" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="format-type" className="text-sm leading-relaxed">
                        {t('advanced.formatTypeLabel')}
                      </Label>
                      <Select
                        value={formatType}
                        onValueChange={(value) => setFormatType(value as any)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder={t('advanced.selectFormatPlaceholder')}/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="word-definition">{t('advanced.formats.text', {separator})}</SelectItem>
                          <SelectItem value="csv">{t('advanced.formats.csv')}</SelectItem>
                          <SelectItem value="json">{t('advanced.formats.json')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formatType === 'word-definition' && (
                      <div className="space-y-2">
                        <Label htmlFor="separator" className="text-sm leading-relaxed">
                          {t('advanced.separatorLabel')}
                        </Label>
                        <Input
                          id="separator"
                          value={separator}
                          onChange={(e) => setSeparator(e.target.value)}
                          placeholder={t('advanced.separatorPlaceholder')}
                          className="max-w-[150px] md:max-w-[200px] text-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="paste-area" className="text-sm leading-relaxed">
                        {t('advanced.pasteLabel')}
                      </Label>
                      <Textarea
                        id="paste-area"
                        placeholder={formatType === 'json'
                          ? t('advanced.placeholders.json')
                          : formatType === 'csv'
                            ? t('advanced.placeholders.csv')
                            : t('advanced.placeholders.text', {separator})
                        }
                        value={wordText}
                        onChange={(e) => setWordText(e.target.value)}
                        className="min-h-[150px] md:min-h-[200px] text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t p-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="remove-duplicates-input"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
            <Label htmlFor="remove-duplicates-input" className="text-sm leading-relaxed">
              {t('removeDuplicates')}
            </Label>
          </div>
          <Button
            onClick={parseWords}
            disabled={isProcessing || (inputMethod === 'text' && !wordText) || (inputMethod === 'file' && !wordFile)}
            className="w-full sm:w-auto text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('processing')}
              </>
            ) : (
              t('processWords')
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Parsed Words Dialog - Mobile Responsive */}
      <Dialog open={showParsedDialog} onOpenChange={setShowParsedDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">{t('processedWords.title')}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mb-4">
            {/* Search Input - Full width on mobile */}
            <div className="w-full">
              <Input
                placeholder={t('processedWords.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm"
              />
            </div>

            {/* Controls - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">
                  {t('processedWords.sortBy')}:
                </Label>
                <div className="flex gap-2">
                  <Select value={sortField} onValueChange={(value) => sortWords(value as 'word' | 'definition', sortOrder)}>
                    <SelectTrigger className="flex-1 sm:w-36 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="word">{t('processedWords.sortOptions.word')}</SelectItem>
                      <SelectItem value="definition">{t('processedWords.sortOptions.definition')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sortWords(sortField, sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-9 w-9"
                  >
                    {sortOrder === 'asc' ? '↓' : '↑'}
                  </Button>
                </div>
              </div>

              {/* Selection Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllWords(true)}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  {t('processedWords.selectAll')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllWords(false)}
                  className="flex-1 sm:flex-initial text-xs"
                >
                  {t('processedWords.deselectAll')}
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 md:w-12">{t('processedWords.table.select')}</TableHead>
                  <TableHead className="min-w-[120px]">{t('processedWords.table.word')}</TableHead>
                  <TableHead className="min-w-[200px]">{t('processedWords.table.definition')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedWords.length > 0 ? (
                  processedWords.map((word, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-2 md:px-4">
                        <div className="flex items-center justify-center">
                          <Button
                            variant={word.selected ? "default" : "outline"}
                            size="icon"
                            className="h-5 w-5 md:h-6 md:w-6"
                            onClick={() => toggleWordSelection(index)}
                          >
                            {word.selected && <Check className="h-3 w-3 md:h-4 md:w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{word.word}</TableCell>
                      <TableCell className="text-sm">{word.definition}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24 text-sm">
                      {t('processedWords.noWordsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-4 flex-col sm:flex-row gap-3">
            <div className="flex items-center justify-between w-full">
              <Badge variant="outline" className="text-xs">
                {t('processedWords.selectionCount', {
                  selected: parsedWords.filter(w => w.selected).length,
                  total: parsedWords.length
                })}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowParsedDialog(false)} className="text-sm">
                  {t('cancel')}
                </Button>
                <Button
                  onClick={addSelectedWords}
                  disabled={isAddingWords || parsedWords.filter(w => w.selected).length === 0}
                  className="text-sm"
                >
                  {isAddingWords ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('processedWords.addingWords')}
                    </>
                  ) : (
                    t('processedWords.addSelectedWords')
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
