// app/api/comments/[commentId]/like/route.js
import { supabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    // Next.js requires awaiting params in App Router
    const resolvedParams = await params;
    const { commentId } = resolvedParams;
    
    console.log('Received commentId:', commentId);
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }
    
    // First get the current comment to get its likes count
    const { data: currentComment, error: fetchError } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching comment:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch comment: ' + fetchError.message },
        { status: 500 }
      );
    }
    
    if (!currentComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Calculate new likes count
    const newLikesCount = (currentComment.likes || 0) + 1;
    console.log(`Incrementing likes from ${currentComment.likes} to ${newLikesCount}`);
    
    // Simple update without chaining .select()
    const { error } = await supabase
      .from('comments')
      .update({ likes: newLikesCount })
      .eq('id', commentId);
      
    if (error) {
      console.error('Database error when updating comment:', error);
      return NextResponse.json(
        { error: 'Failed to update like count: ' + error.message },
        { status: 500 }
      );
    }
    
    // Return a simple success response with the new like count
    return NextResponse.json({ 
      success: true,
      likes: newLikesCount 
    });
    
  } catch (error) {
    console.error('Server error when liking comment:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}