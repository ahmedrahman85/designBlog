'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CommentList({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('likes'); // Default sort by popularity
  
  // Fetch comments for this post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${postId}&sort=${sortOrder}`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        
        const data = await response.json();
        setComments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, sortOrder]);
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };
  
  const handleLike = async (commentId) => {
    try {
      console.log('Liking comment with ID:', commentId);
      
      // Optimistically update the UI first
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
  
      // Then make the API call
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        // Don't send a body unless needed by your API
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      // Try to parse the response as text first to debug
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON if possible
      let data = {};
      if (responseText && responseText.trim().length > 0) {
        try {
          data = JSON.parse(responseText);
          console.log('Parsed data:', data);
        } catch (parseError) {
          console.warn('Failed to parse response as JSON:', parseError);
        }
      }
      
      if (!response.ok) {
        // Log details for debugging
        console.error('Like error details:', {
          status: response.status,
          statusText: response.statusText,
          responseText,
          data
        });
        
        // Revert the optimistic update
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: comment.likes - 1 } 
              : comment
          )
        );
        
        const errorMessage = (data && data.error) ? data.error : `Failed to like comment (${response.status})`;
        throw new Error(errorMessage);
      }
      
      console.log('Like operation successful');
      
      // If we have comment data in the response, update with the returned data
      if (data && Object.keys(data).length > 0) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId ? { ...comment, ...data } : comment
          )
        );
        console.log('Updated comment with response data');
      } else {
        console.log('Keeping optimistic update (no data returned)');
      }
      
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };
  // Format date in British style
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return <div className="commentLoading">Loading comments...</div>;
  }
  
  return (
    <div className="commentListContainer">
      <div className="commentListHeader">
        <h3 className="commentListTitle">All Comments ({comments.length})</h3>
        <div className="commentSorting">
          <label htmlFor="commentSort">Sort by:</label>
          <select 
            id="commentSort" 
            value={sortOrder} 
            onChange={handleSortChange}
            className="formSelect commentSortSelect"
          >
            <option value="likes">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>
      
      {comments.length === 0 ? (
        <p className="noComments">No comments yet. Be the first to comment!</p>
      ) : (
        <motion.div 
          className="commentList"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {comments.map((comment) => (
            <motion.div 
              key={comment.id}
              className="commentItem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="commentContent">
                {comment.content}
              </div>
              
              <div className="commentMeta">
                <span className="commentDate">
                  {formatDate(comment.createdAt)}
                </span>
                
                <div className="commentActions">
                  <button 
                    className="likeButton"
                    onClick={() => handleLike(comment.id)}
                  >
                    ♥ {comment.likes}
                  </button>
                  
                  <Link 
                    href={`/posts/${postId}/comments/${comment.id}/edit`}
                    className="editCommentLink"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}