// app/actions/postActions.js
'use server'

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';

export async function updatePost(formData) {
    // Create Supabase client server-side with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL, 
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  
    // Extract data from formData
    const postId = formData.get('postId');
    const title = formData.get('title');
    const content = formData.get('content');
    const author = formData.get('author');
    const categoryId = formData.get('categoryId') || null;
  
    // Validate required fields
    if (!postId || !title || !content || !author) {
      return { 
        success: false, 
        error: 'All fields are required except category' 
      };
    }
  
    try {
      // Prepare update data
      const updateData = {
        title,
        content,
        author,
        "categoryId": categoryId === "" ? null : categoryId
      };
  
      // Perform the update
      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);
  
      if (error) {
        console.error('Error updating post:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
  
      // Revalidate the posts path and specific post path
      revalidatePath('/posts');
      revalidatePath(`/posts/${postId}`);
  
      // Return the post ID to be used for redirection
      redirect('/posts');
  
    } catch (err) {
      console.error('Unexpected error during post update:', err);
      return { 
        success: false, 
        error: err.message 
      };
    }
  }
export async function deletePost(postId) {
  // Create Supabase client server-side with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log(`Attempting to delete post with ID: ${postId}`);

    // First, delete associated comments
    const { error: commentsDeleteError } = await supabase
      .from('comments')
      .delete()
      .eq('postId', postId);

    if (commentsDeleteError) {
      console.error('Error deleting comments:', commentsDeleteError);
      return { 
        success: false, 
        error: `Failed to delete comments: ${commentsDeleteError.message}` 
      };
    }

    // Then delete the post
    const { error: postDeleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (postDeleteError) {
      console.error('Error deleting post:', postDeleteError);
      return { 
        success: false, 
        error: `Failed to delete post: ${postDeleteError.message}` 
      };
    }

    // Revalidate the posts path
    revalidatePath('/posts');

    console.log(`Successfully deleted post with ID: ${postId}`);
    return { success: true };

  } catch (err) {
    console.error('Unexpected error during post deletion:', err);
    return { 
      success: false, 
      error: `Unexpected error: ${err.message}` 
    };
  }
}