'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions/postActions";

export default function PostCard({ post }) {
  const router = useRouter();
  const { 
    id, 
    title, 
    author, 
    createdAt, 
    categoryname, 
    commentcount 
  } = post;
  
  const formattedDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const handleDelete = async () => {
    // Confirm deletion
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      const result = await deletePost(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete post');
      }

      // Refresh the page or navigate
      router.push('/posts');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Error deleting post: ${err.message}`);
    }
  };
  
  return (
    <div className="postCard">
      <div className="postCardHeader">
        <span className="postCategory">{categoryname || "Uncategorised"}</span>
        <span className="postComments">
          {commentcount} {parseInt(commentcount) === 1 ? "comment" : "comments"}
        </span>
      </div>
      
      <Link href={`/posts/${id}`} className="postTitleLink">
        <h2 className="postTitle">{title}</h2>
      </Link>
      
      <div className="postMeta">
        <span className="postAuthor">By {author}</span>
        <span className="postDate">Published on {formattedDate}</span>
      </div>
      
      <div className="postActions">
        <Link href={`/posts/${id}`} className="button">
          Read More
        </Link>
        <Link href={`/posts/${id}/edit`} className="secondaryButton">
          Edit
        </Link>
        <button 
          onClick={handleDelete}
          className="deleteButton"
        >
          Delete
        </button>
      </div>
    </div>
  );
}