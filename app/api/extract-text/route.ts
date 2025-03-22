// app/api/extract-text/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    // Your server-side code can make this request without CORS issues
    const response = await fetch('https://www.imgocr.com/api/imgocr_get_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.IMGOCR_API_KEY, // Server-side environment variable
        image: image, // Base64 image data
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error extracting text:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
