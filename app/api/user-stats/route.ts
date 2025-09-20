// app/api/user-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface UserStats {
  totalWords: number;
  newWords: number;
  learningWords: number;
  masteredWords: number;
  reviewsDue: number;
  streak: number;
  successRate: number;
  retentionRate: number;
  weeklyProgress: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('📊 Fetching stats for user:', userId);

    // Get total words count
    const { count: totalWords } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get words by stage
    const { data: wordsByStage } = await supabase
      .from('words')
      .select('review_stage, mastered')
      .eq('user_id', userId);

    // Calculate word categories
    const newWords = wordsByStage?.filter(w => w.review_stage === 0 && !w.mastered).length || 0;
    const learningWords = wordsByStage?.filter(w => w.review_stage > 0 && w.review_stage < 6 && !w.mastered).length || 0;
    const masteredWords = wordsByStage?.filter(w => w.mastered === true).length || 0;

    // Get words due for review today
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const { count: reviewsDue } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .lte('next_review_at', today.toISOString())
      .eq('mastered', false);

    // Get recent reviews for success rate calculation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('success')
      .eq('user_id', userId)
      .gte('reviewed_at', sevenDaysAgo.toISOString());

    // Calculate success rate
    const totalReviews = recentReviews?.length || 0;
    const successfulReviews = recentReviews?.filter(r => r.success === true).length || 0;
    const successRate = totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;

    // Calculate streak (days with reviews)
    const { data: reviewDates } = await supabase
      .from('reviews')
      .select('reviewed_at')
      .eq('user_id', userId)
      .order('reviewed_at', { ascending: false })
      .limit(30);

    let streak = 0;
    if (reviewDates && reviewDates.length > 0) {
      const today = new Date();
      let currentDate = new Date(today);
      currentDate.setHours(0, 0, 0, 0);

      const reviewDateSet = new Set(
        reviewDates.map(r => new Date(r.reviewed_at).toDateString())
      );

      // Check if user reviewed today or yesterday to start streak
      const todayStr = today.toDateString();
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();

      if (reviewDateSet.has(todayStr)) {
        streak = 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (reviewDateSet.has(yesterdayStr)) {
        streak = 1;
        currentDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        currentDate.setHours(0, 0, 0, 0);
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // Count consecutive days backwards
      while (reviewDateSet.has(currentDate.toDateString())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    // Calculate retention rate (words still being reviewed vs words that were dropped)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: oldWords } = await supabase
      .from('words')
      .select('id, last_reviewed_at, mastered')
      .eq('user_id', userId)
      .lte('created_at', thirtyDaysAgo.toISOString());

    const totalOldWords = oldWords?.length || 0;
    const stillActiveWords = oldWords?.filter(w =>
      w.mastered || (w.last_reviewed_at && new Date(w.last_reviewed_at) > sevenDaysAgo)
    ).length || 0;

    const retentionRate = totalOldWords > 0 ? Math.round((stillActiveWords / totalOldWords) * 100) : 100;

    // Calculate weekly progress (words added this week vs last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: thisWeekWords } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString());

    const weeklyProgress = thisWeekWords || 0;

    const stats: UserStats = {
      totalWords: totalWords || 0,
      newWords,
      learningWords,
      masteredWords,
      reviewsDue: reviewsDue || 0,
      streak,
      successRate,
      retentionRate,
      weeklyProgress
    };

    console.log('📊 Calculated stats:', stats);

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}