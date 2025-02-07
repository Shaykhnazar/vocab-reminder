// app/api/words/[wordId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Context = {
  params: {
    wordId: string;
  };
};

export async function PATCH(
  req: NextRequest,
  context: Context
) {
  try {
    const { wordId } = context.params;
    const updates = await req.json();

    // Validate the request
    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    // Update the word
    const { data: updatedWord, error } = await supabase
      .from('words')
      .update(updates)
      .eq('id', wordId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: updatedWord
    });
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: Context
) {
  try {
    const { wordId } = context.params;

    if (!wordId) {
      return NextResponse.json({ error: 'Word ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', wordId);

    if (error) throw error;

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
  }
}
