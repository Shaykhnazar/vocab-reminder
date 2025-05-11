// components/DictionarySubscription.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";
import { useWordsStore } from '@/lib/stores/use-words-store';
import { useTranslations } from 'next-intl';
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Loader2, Search, BookOpen, User, Star, Plus, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn-ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar";
import { Badge } from '@/components/shadcn-ui/badge';
import { Separator } from '@/components/shadcn-ui/separator';

interface Dictionary {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  isSubscribed: boolean;
  isFeatured?: boolean;
  category?: string;
}

interface SubscriptionDetails {
  dictionary: Dictionary;
  subscribedAt: string;
  lastSyncedAt: string;
  wordsAdded: number;
}

export default function DictionarySubscription() {
  // Get translations
  const t = useTranslations('DictionarySubscription');
  const wordsT = useTranslations('Words');

  const [activeTab, setActiveTab] = useState('featured');
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<SubscriptionDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [showDictionaryPreview, setShowDictionaryPreview] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { toast } = useToast();
  const { data: session } = useSession();
  const { addWords } = useWordsStore();

  useEffect(() => {
    fetchDictionaries();
    fetchMySubscriptions();
  }, [session?.user?.id]);

  const fetchDictionaries = async () => {
    setIsLoading(true);

    try {
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockDictionaries: Dictionary[] = [
        {
          id: '1',
          title: 'Essential Academic Vocabulary',
          description: 'Frequently used words in academic texts across various disciplines',
          wordCount: 570,
          author: {
            name: 'Prof. Sarah Johnson',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah',
          },
          isSubscribed: false,
          isFeatured: true,
          category: 'Academic'
        },
        {
          id: '2',
          title: 'Business English',
          description: 'Essential vocabulary for professional business communications',
          wordCount: 420,
          author: {
            name: 'Michael Chen, MBA',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael',
          },
          isSubscribed: false,
          isFeatured: true,
          category: 'Business'
        },
        {
          id: '3',
          title: 'Advanced IELTS Vocabulary',
          description: 'High-scoring vocabulary for IELTS Academic and General Training',
          wordCount: 350,
          author: {
            name: 'Emma Watson',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Emma',
          },
          isSubscribed: false,
          isFeatured: true,
          category: 'Test Prep'
        },
        {
          id: '4',
          title: 'Medical Terminology',
          description: 'Essential medical vocabulary for healthcare professionals',
          wordCount: 620,
          author: {
            name: 'Dr. James Wilson',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=James',
          },
          isSubscribed: false,
          category: 'Specialized'
        },
        {
          id: '5',
          title: 'Tech Industry Jargon',
          description: 'Up-to-date terminology used in the technology sector',
          wordCount: 280,
          author: {
            name: 'Alex Rivera',
            avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex',
          },
          isSubscribed: false,
          category: 'Specialized'
        },
      ];

      setDictionaries(mockDictionaries);
    } catch (error) {
      console.error("Error fetching dictionaries:", error);
      toast({
        title: t('toast.error'),
        description: t('toast.loadDictionariesFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySubscriptions = async () => {
    if (!session?.user?.id) return;

    try {
      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock data
      const mockSubscriptions: SubscriptionDetails[] = [];

      setMySubscriptions(mockSubscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: t('toast.error'),
        description: t('toast.loadSubscriptionsFailed'),
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const viewDictionaryDetails = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
    setShowDictionaryPreview(true);
  };

  const handleSubscribe = async (dictionary: Dictionary) => {
    if (!session?.user?.id) return;

    setIsSubscribing(true);

    try {
      // In a real app, this would be an API call to subscribe to the dictionary
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update the UI optimistically
      const updatedDictionaries = dictionaries.map(dict =>
        dict.id === dictionary.id
          ? { ...dict, isSubscribed: true }
          : dict
      );
      setDictionaries(updatedDictionaries);

      // Add to my subscriptions
      const newSubscription: SubscriptionDetails = {
        dictionary: { ...dictionary, isSubscribed: true },
        subscribedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
        wordsAdded: 0
      };

      setMySubscriptions([...mySubscriptions, newSubscription]);

      // Show success message
      toast({
        title: t('toast.success'),
        description: t('toast.subscribed', { title: dictionary.title }),
      });

      setShowDictionaryPreview(false);
    } catch (error) {
      console.error("Error subscribing to dictionary:", error);
      toast({
        title: t('toast.error'),
        description: t('toast.subscribeFailed'),
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const importWords = async (subscription: SubscriptionDetails) => {
    if (!session?.user?.id) return;

    try {
      // In a real app, this would be an API call to import the words
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock word import
      toast({
        title: t('toast.success'),
        description: t('toast.imported', {
          count: subscription.dictionary.wordCount,
          title: subscription.dictionary.title
        }),
      });

      // Update subscription details
      const updatedSubscriptions = mySubscriptions.map(sub =>
        sub.dictionary.id === subscription.dictionary.id
          ? {
            ...sub,
            lastSyncedAt: new Date().toISOString(),
            wordsAdded: sub.dictionary.wordCount
          }
          : sub
      );

      setMySubscriptions(updatedSubscriptions);
    } catch (error) {
      console.error("Error importing words:", error);
      toast({
        title: t('toast.error'),
        description: t('toast.importFailed'),
      });
    }
  };

  const filteredDictionaries = dictionaries.filter(dictionary =>
    (activeTab === 'featured' && dictionary.isFeatured) ||
    (activeTab === 'all') ||
    (activeTab === 'categories' && dictionary.category)
  ).filter(dictionary =>
    dictionary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dictionary.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dictionary.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dictionary.category && dictionary.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="w-full mb-6 md:mb-8">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl">{t('title')}</CardTitle>
          <CardDescription className="text-sm">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              {/* Tabs with horizontal scroll on mobile */}
              <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <TabsList className="inline-flex md:grid md:grid-cols-4 h-9 gap-1">
                  <TabsTrigger value="featured" className="text-xs md:text-sm whitespace-nowrap">
                    {t('tabs.featured')}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap">
                    {t('tabs.all')}
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="text-xs md:text-sm whitespace-nowrap">
                    {t('tabs.categories')}
                  </TabsTrigger>
                  <TabsTrigger value="my-subscriptions" className="text-xs md:text-sm whitespace-nowrap">
                    {t('tabs.mySubscriptions')}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search.placeholder')}
                  className="pl-8 w-full md:w-[250px] text-sm"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <TabsContent value="my-subscriptions">
              {mySubscriptions.length === 0 ? (
                <div className="text-center py-8 md:py-12 space-y-4">
                  <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-base md:text-lg font-medium">{t('emptySubscriptions.title')}</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      {t('emptySubscriptions.description')}
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('featured')} className="text-sm">
                    {t('emptySubscriptions.browseButton')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySubscriptions.map((subscription) => (
                    <Card key={subscription.dictionary.id}>
                      <CardHeader className="p-3 md:p-4 pb-2">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-base md:text-lg">{subscription.dictionary.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">{subscription.dictionary.description}</CardDescription>
                          </div>
                          {subscription.dictionary.category && (
                            <Badge variant="outline" className="text-xs self-start">
                              {subscription.dictionary.category}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4 pb-2">
                        <div className="flex flex-wrap items-center text-xs md:text-sm text-muted-foreground gap-2">
                          <div className="flex items-center">
                            <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
                              <AvatarImage src={subscription.dictionary.author.avatar} />
                              <AvatarFallback>{subscription.dictionary.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{subscription.dictionary.author.name}</span>
                          </div>
                          <span className="hidden md:inline">•</span>
                          <span>{subscription.dictionary.wordCount} {t('subscriptionDetails.words')}</span>
                          <span className="hidden md:inline">•</span>
                          <span>{t('subscriptionDetails.subscribedOn')} {formatDate(subscription.subscribedAt)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 md:p-4 pt-2 flex flex-col md:flex-row justify-between gap-3">
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {subscription.wordsAdded > 0
                            ? t('subscriptionDetails.lastImported', {
                                count: subscription.wordsAdded,
                                date: formatDate(subscription.lastSyncedAt)
                              })
                            : t('subscriptionDetails.notImportedYet')}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => importWords(subscription)}
                          className="w-full md:w-auto text-xs md:text-sm"
                        >
                          {subscription.wordsAdded > 0
                            ? t('subscriptionDetails.refreshAndImport')
                            : t('subscriptionDetails.importWords')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDictionaries
                    .filter(dict => dict.isFeatured)
                    .map((dictionary) => (
                      <Card key={dictionary.id} className="overflow-hidden transition-all hover:shadow-md">
                        <CardHeader className="p-3 md:p-4 pb-2">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="flex items-center text-base md:text-lg">
                              {dictionary.title}
                              {dictionary.isFeatured && (
                                <Star className="h-3 w-3 md:h-4 md:w-4 ml-2 text-yellow-500 fill-yellow-500" />
                              )}
                            </CardTitle>
                            {dictionary.category && (
                              <Badge variant="outline" className="text-xs">{dictionary.category}</Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">{dictionary.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pb-2">
                          <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
                              <AvatarImage src={dictionary.author.avatar} />
                              <AvatarFallback>{dictionary.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{dictionary.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>{dictionary.wordCount} {t('subscriptionDetails.words')}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 md:p-4 pt-2">
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => viewDictionaryDetails(dictionary)}
                          >
                            {t('preview.viewDetails')}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDictionaries.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <p className="text-sm text-muted-foreground">{t('noResults')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDictionaries.map((dictionary) => (
                    <Card key={dictionary.id} className="overflow-hidden transition-all hover:shadow-md">
                      <CardHeader className="p-3 md:p-4 pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="flex items-center text-base md:text-lg">
                            {dictionary.title}
                            {dictionary.isFeatured && (
                              <Star className="h-3 w-3 md:h-4 md:w-4 ml-2 text-yellow-500 fill-yellow-500" />
                            )}
                          </CardTitle>
                          {dictionary.category && (
                            <Badge variant="outline" className="text-xs">{dictionary.category}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4 pb-2">
                        <p className="text-sm mb-2 line-clamp-2">{dictionary.description}</p>
                        <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
                            <AvatarImage src={dictionary.author.avatar} />
                            <AvatarFallback>{dictionary.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{dictionary.author.name}</span>
                          <span className="mx-2">•</span>
                          <span>{dictionary.wordCount} {t('subscriptionDetails.words')}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 md:p-4 pt-2">
                        <Button
                          variant="outline"
                          className="w-full text-sm"
                          onClick={() => viewDictionaryDetails(dictionary)}
                        >
                          {t('preview.viewDetails')}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {['Academic', 'Business', 'Test Prep', 'Specialized'].map((category) => {
                    const categoryDictionaries = filteredDictionaries.filter(
                      dict => dict.category === category
                    );

                    if (categoryDictionaries.length === 0) return null;

                    return (
                      <div key={category}>
                        <div className="flex items-center mb-3 md:mb-4">
                          <h3 className="text-base md:text-lg font-medium">{category}</h3>
                          <Separator className="flex-1 mx-4" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryDictionaries.map((dictionary) => (
                            <Card key={dictionary.id} className="overflow-hidden transition-all hover:shadow-md">
                              <CardHeader className="p-3 md:p-4 pb-2">
                                <CardTitle className="flex items-center text-base md:text-lg">
                                  {dictionary.title}
                                  {dictionary.isFeatured && (
                                    <Star className="h-3 w-3 md:h-4 md:w-4 ml-2 text-yellow-500 fill-yellow-500" />
                                  )}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 md:p-4 pb-2">
                                <p className="text-sm mb-2 line-clamp-2">{dictionary.description}</p>
                                <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                                  <Avatar className="h-5 w-5 md:h-6 md:w-6 mr-2">
                                    <AvatarImage src={dictionary.author.avatar} />
                                    <AvatarFallback>{dictionary.author.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{dictionary.author.name}</span>
                                  <span className="mx-2">•</span>
                                  <span>{dictionary.wordCount} {t('subscriptionDetails.words')}</span>
                                </div>
                              </CardContent>
                              <CardFooter className="p-3 md:p-4 pt-2">
                                <Button
                                  variant="outline"
                                  className="w-full text-sm"
                                  onClick={() => viewDictionaryDetails(dictionary)}
                                >
                                  {t('preview.viewDetails')}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dictionary Preview Dialog - Mobile Responsive */}
      <Dialog open={showDictionaryPreview} onOpenChange={setShowDictionaryPreview}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg md:text-xl">
              {selectedDictionary?.title}
              {selectedDictionary?.isFeatured && (
                <Star className="h-4 w-4 md:h-5 md:w-5 ml-2 text-yellow-500 fill-yellow-500" />
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDictionary && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage src={selectedDictionary.author.avatar} />
                  <AvatarFallback>{selectedDictionary.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm md:text-base">{selectedDictionary.author.name}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{t('preview.dictionaryCreator')}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-sm md:text-base">{t('preview.description')}</h3>
                <p className="text-sm">{selectedDictionary.description}</p>
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4">
                <div className="bg-muted rounded-md px-3 py-2 md:px-4 md:py-2">
                  <p className="text-xs md:text-sm text-muted-foreground">{t('preview.wordCount')}</p>
                  <p className="font-medium text-sm md:text-base">{selectedDictionary.wordCount} {t('preview.words')}</p>
                </div>

                {selectedDictionary.category && (
                  <div className="bg-muted rounded-md px-3 py-2 md:px-4 md:py-2">
                    <p className="text-xs md:text-sm text-muted-foreground">{t('preview.category')}</p>
                    <p className="font-medium text-sm md:text-base">{selectedDictionary.category}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2 text-sm md:text-base">{t('preview.sampleWords')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border rounded-md p-2">
                    <p className="font-medium text-sm">ephemeral</p>
                    <p className="text-xs md:text-sm">Lasting for a very short time</p>
                  </div>
                  <div className="border rounded-md p-2">
                    <p className="font-medium text-sm">serendipity</p>
                    <p className="text-xs md:text-sm">The occurrence of events by chance in a happy way</p>
                  </div>
                  <div className="border rounded-md p-2">
                    <p className="font-medium text-sm">eloquent</p>
                    <p className="text-xs md:text-sm">Fluent or persuasive in speaking or writing</p>
                  </div>
                  <div className="border rounded-md p-2">
                    <p className="font-medium text-sm">meticulous</p>
                    <p className="text-xs md:text-sm">Showing great attention to detail</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDictionaryPreview(false)}
              className="w-full sm:w-auto text-sm"
            >
              {t('preview.cancel')}
            </Button>
            <Button
              className="gap-2 w-full sm:w-auto text-sm"
              onClick={() => handleSubscribe(selectedDictionary!)}
              disabled={isSubscribing || selectedDictionary?.isSubscribed}
            >
              {isSubscribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('preview.subscribing')}
                </>
              ) : selectedDictionary?.isSubscribed ? (
                t('preview.alreadySubscribed')
              ) : (
                <>
                  {t('preview.subscribe')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
