import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/db";

export default async function EditCommentPage({ params }) {
  const resolvedParams = await params;
  const { id, commentId } = resolvedParams;
  
  // Fetch comment details
  const { data: comment, error } = await supabase
    .from('comments')
    .select('*')
    .eq('id', commentId)
    .single();
  
  // If comment doesn't exist, redirect to post page
  if (error || !comment) {
    console.error('Error fetching comment:', error);
    redirect(`/posts/${id}`);
  }
  
  // Verify that the comment belongs to the specified post
  if (comment.postid !== parseInt(id) && comment.postid !== id) {
    redirect(`/posts/${id}`);
  }
  
  // Server action to update a comment
  async function updateComment(formData) {
    'use server'
    
    // Extract form data
    const commentId = formData.get("commentId");
    const postId = formData.get("postId");
    const content = formData.get("content");
    
    // Validate content
    if (!content.trim()) {
      throw new Error('Comment content is required');
    }
    
    // Update comment using Supabase directly
    const { error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId);
      
    if (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
    
    // Redirect to the post page
    redirect(`/posts/${postId}`);
  }
  
  return (
    <div className="editCommentContainer">
      <h1 className="pageTitle">Edit Comment</h1>
      
      <form action={updateComment} className="commentForm">
        <input type="hidden" name="commentId" value={commentId} />
        <input type="hidden" name="postId" value={id} />
        
        <div className="formGroup">
          <label htmlFor="content" className="formLabel">Comment</label>
          <textarea 
            id="content" 
            name="content" 
            className="formTextarea" 
            rows="5" 
            required 
            defaultValue={comment.content}
          ></textarea>
        </div>
        
        <div className="formActions">
          <Link href={`/posts/${id}`} className="cancelButton">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update Comment
          </button>
        </div>
      </form>
    </div>
  );
}