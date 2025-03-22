// app/api/dictionaries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query') || '';
    const categoryFilter = url.searchParams.get('category') || '';
    const featured = url.searchParams.get('featured') === 'true';

    // In a real application, you would query your dictionaries table
    // This is a mock implementation for the MVP

    // For the MVP, we'll return mock data
    const mockDictionaries = [
      {
        id: '1',
        title: 'Essential Academic Vocabulary',
        description: 'Frequently used words in academic texts across various disciplines',
        wordCount: 570,
        author: {
          id: 'author1',
          name: 'Prof. Sarah Johnson',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Sarah',
        },
        isFeatured: true,
        category: 'Academic',
        createdAt: '2023-01-15T08:00:00Z',
        updatedAt: '2023-03-10T09:30:00Z',
      },
      {
        id: '2',
        title: 'Business English',
        description: 'Essential vocabulary for professional business communications',
        wordCount: 420,
        author: {
          id: 'author2',
          name: 'Michael Chen, MBA',
          avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Michael',
        },
        isFeatured: true,
        category: 'Business',
        createdAt: '2023-02-20T10:15:00Z',
        updatedAt: '2023-04-05T14:20:00Z',
      },
      // Add more mock dictionaries as needed
    ];

    // Apply filters to mock data
    let filteredDictionaries = [...mockDictionaries];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredDictionaries = filteredDictionaries.filter(dict =>
        dict.title.toLowerCase().includes(query) ||
        dict.description.toLowerCase().includes(query) ||
        dict.author.name.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      filteredDictionaries = filteredDictionaries.filter(dict =>
        dict.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (featured) {
      filteredDictionaries = filteredDictionaries.filter(dict => dict.isFeatured);
    }

    return NextResponse.json({
      success: true,
      data: filteredDictionaries
    });
  } catch (error) {
    console.error('Error fetching dictionaries:', error);
    return NextResponse.json({ error: 'Failed to fetch dictionaries' }, { status: 500 });
  }
}
