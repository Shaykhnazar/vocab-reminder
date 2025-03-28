import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs';
import { Button } from '@/components/shadcn-ui/button';
import { Progress } from '@/components/shadcn-ui/progress';
import { Calendar, Clock, Award, BookOpen, Plus, TrendingUp, List } from 'lucide-react';

const VocabularyDashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Vocabry</h1>
          <p className="text-slate-500">Your personal vocabulary builder</p>
        </div>
        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2" variant="outline">
            <Clock size={18} />
            <span>Reviews: 12</span>
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            <span>Add Word</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>New</span>
                  <span className="font-medium">24 words</span>
                </div>
                <Progress value={24} className="h-2 bg-slate-200" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Learning</span>
                  <span className="font-medium">47 words</span>
                </div>
                <Progress value={47} className="h-2 bg-slate-200" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mastered</span>
                  <span className="font-medium">83 words</span>
                </div>
                <Progress value={83} className="h-2 bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              Upcoming Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="font-medium">Today</span>
                <span className="px-2 py-1 bg-blue-100 rounded-md font-medium text-blue-700">12 words</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg">
                <span className="font-medium">Tomorrow</span>
                <span className="px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">8 words</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg">
                <span className="font-medium">In 3 days</span>
                <span className="px-2 py-1 bg-slate-100 rounded-md font-medium text-slate-700">14 words</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700">Success Rate</p>
                <p className="text-xl font-bold text-green-700">87%</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700">Retention</p>
                <p className="text-xl font-bold text-purple-700">92%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Streak</p>
                <p className="text-xl font-bold text-blue-700">7 days</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">Total Words</p>
                <p className="text-xl font-bold text-amber-700">154</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <List size={16} />
            All Words
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Plus size={16} />
            New
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Learning
          </TabsTrigger>
          <TabsTrigger value="mastered" className="flex items-center gap-2">
            <Award size={16} />
            Mastered
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Words</CardTitle>
              <CardDescription>Manage all your vocabulary words</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { word: "ephemeral", definition: "lasting for a very short time", stage: 3 },
                  { word: "ubiquitous", definition: "present, appearing, or found everywhere", stage: 5 },
                  { word: "serendipity", definition: "the occurrence and development of events by chance", stage: 2 },
                  { word: "eloquent", definition: "fluent or persuasive in speaking or writing", stage: 4 },
                  { word: "pragmatic", definition: "dealing with things sensibly and realistically", stage: 1 }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="font-medium">{item.word}</p>
                      <p className="text-sm text-slate-500">{item.definition}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        Stage {item.stage}
                      </span>
                      <Button variant="ghost" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">1</Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
              </div>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VocabularyDashboard;
