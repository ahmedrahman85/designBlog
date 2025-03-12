// app/posts/[id]/page.js
import Link from "next/link";
import { supabase } from "@/lib/db";
import CommentSection from "@/components/CommentSection";

export default async function PostDetailPage({ params }) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  // Fetch post details
  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories:"categoryId" (
        id,
        name
      )
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching post:', error);
    return (
      <div className="errorContainer">
        <h1 className="errorTitle">Post not found</h1>
        <Link href="/posts" className="button">
          Return to Posts
        </Link>
      </div>
    );
  }
  
  // Format the date in British style
  const formattedDate = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';
  
  // Server action to add a comment
  async function addComment(formData) {
    'use server'
    
    // Extract form data
    const content = formData.get("content");
    const postId = formData.get("postId");
    
    // Validate content
    if (!content.trim()) {
      throw new Error('Comment content is required');
    }
    
    // Create comment
    const { error } = await supabase
      .from('comments')
      .insert({
        content,
        "postId": postId,
        likes: 0,
        "createdAt": new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }
  
  // Extract the category name string from the object
  const categoryName = post.categories?.name || "Uncategorised";
  
  return (
    <div className="postDetailContainer">
      <div className="postHeader">
        <Link href="/posts" className="backLink">
          ← Back to Posts
        </Link>
        
        <div className="postMeta">
          <span className="postCategory">{categoryName}</span>
          <span className="postDate">Published on {formattedDate}</span>
        </div>
        
        <h1 className="postTitle">{post.title}</h1>
        <div className="postAuthor">By {post.author}</div>
      </div>
      
      <div className="postContent">
        {post.content.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      <div className="postActions">
        <Link href={`/posts/${id}/edit`} className="button">
          Edit Post
        </Link>
      </div>
      
      <CommentSection postId={id} addComment={addComment} />
    </div>
  );
}