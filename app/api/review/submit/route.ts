// app/api/review/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { addToNotificationQueue } from '@/lib/notifications';

interface ReviewResult {
  wordId: string;
  success: boolean;
  responseTimeMs: number;
  confidenceLevel: number;
}

interface ReviewSession {
  sessionId: string;
  results: ReviewResult[];
  totalTimeMs: number;
}

// Spaced Repetition Algorithm
function calculateNextReview(currentStage: number, success: boolean): { nextStage: number, nextReviewAt: Date, mastered: boolean } {
  const now = new Date();
  let nextStage = currentStage;
  let mastered = false;

  if (success) {
    // Move to next stage on success
    nextStage = Math.min(currentStage + 1, 6);

    // Mark as mastered if reached final stage
    if (nextStage >= 6) {
      mastered = true;
    }
  } else {
    // Reset to stage 0 on failure, or reduce stage if already progressed
    nextStage = currentStage > 0 ? Math.max(0, currentStage - 1) : 0;
  }

  // Calculate next review date based on stage
  const intervals = [
    1,        // Stage 0: 1 day
    3,        // Stage 1: 3 days
    7,        // Stage 2: 1 week
    14,       // Stage 3: 2 weeks
    30,       // Stage 4: 1 month
    60,       // Stage 5: 2 months
    365       // Stage 6: 1 year (mastered)
  ];

  const daysToAdd = intervals[nextStage] || 365;
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + daysToAdd);

  return { nextStage, nextReviewAt, mastered };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviewSession: ReviewSession = await request.json();
    const userId = session.user.id;

    console.log(`📝 Processing review session for user ${userId}:`, {
      sessionId: reviewSession.sessionId,
      resultsCount: reviewSession.results.length,
      totalTime: reviewSession.totalTimeMs
    });

    // Process each review result
    const updatePromises = reviewSession.results.map(async (result) => {
      try {
        // Get current word data
        const { data: wordData, error: fetchError } = await supabase
          .from('words')
          .select('review_stage')
          .eq('id', result.wordId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !wordData) {
          console.error(`Error fetching word ${result.wordId}:`, fetchError);
          return { success: false, wordId: result.wordId, error: 'Word not found' };
        }

        const currentStage = wordData.review_stage || 0;
        const { nextStage, nextReviewAt, mastered } = calculateNextReview(currentStage, result.success);

        // Update word in database
        const { error: updateError } = await supabase
          .from('words')
          .update({
            review_stage: nextStage,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: mastered ? null : nextReviewAt.toISOString(),
            mastered: mastered
          })
          .eq('id', result.wordId)
          .eq('user_id', userId);

        if (updateError) {
          console.error(`Error updating word ${result.wordId}:`, updateError);
          return { success: false, wordId: result.wordId, error: 'Update failed' };
        }

        // Record review in reviews table
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            word_id: result.wordId,
            user_id: userId,
            success: result.success,
            reviewed_at: new Date().toISOString(),
            response_time_ms: result.responseTimeMs,
            confidence_level: result.confidenceLevel
          });

        if (reviewError) {
          console.error(`Error recording review for word ${result.wordId}:`, reviewError);
          // Don't fail the whole operation for review recording issues
        }

        // Schedule next notification if word is not mastered
        if (!mastered) {
          try {
            await addToNotificationQueue({
              userId,
              wordId: result.wordId,
              scheduledFor: nextReviewAt,
              type: 'email' // Will be determined based on user preferences
            });
          } catch (notificationError) {
            console.error(`Error scheduling notification for word ${result.wordId}:`, notificationError);
            // Don't fail the review for notification issues
          }
        }

        console.log(`✅ Updated word ${result.wordId}: stage ${currentStage} → ${nextStage}, mastered: ${mastered}`);

        return {
          success: true,
          wordId: result.wordId,
          oldStage: currentStage,
          newStage: nextStage,
          mastered: mastered,
          nextReviewAt: mastered ? null : nextReviewAt.toISOString()
        };

      } catch (error) {
        console.error(`Error processing word ${result.wordId}:`, error);
        return { success: false, wordId: result.wordId, error: 'Processing failed' };
      }
    });

    const results = await Promise.all(updatePromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📊 Review session complete: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sessionId: reviewSession.sessionId,
      processed: results.length,
      successful,
      failed,
      results: results
    });

  } catch (error) {
    console.error('❌ Error in review submit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}