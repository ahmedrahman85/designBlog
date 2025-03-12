import { NextResponse } from "next/server";
import { supabase } from "../../../lib/db";

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const limit = searchParams.get('limit') || 100;
    const sort = searchParams.get('sort') || 'newest';
    
    // Validate postId
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }
    
    // Determine sort order based on parameter
    let orderBy;
    let ascending;
    
    switch (sort) {
      case 'likes':
        orderBy = 'likes';
        ascending = false;
        break;
      case 'oldest':
        orderBy = 'createdAt';
        ascending = true;
        break;
      case 'newest':
      default:
        orderBy = 'createdAt';
        ascending = false;
        break;
    }
    
    // Fetch comments for the post with the specified sort order and limit
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('postId', postId)
      .order(orderBy, { ascending })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}