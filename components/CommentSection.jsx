'use client'

import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import CommentCarousel from './CommentCarousel';
import CommentList from './CommentList';

export default function CommentSection({ postId, addComment }) {
  const [commentContent, setCommentContent] = useState('');
  const [viewAllComments, setViewAllComments] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.1 });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent empty comments
    if (!commentContent.trim()) return;
    
    // Create a FormData object to pass to the server action
    const formData = new FormData();
    formData.append('content', commentContent);
    formData.append('postId', postId);
    
    // Call the server action
    addComment(formData);
    
    // Clear the input
    setCommentContent('');
  };
  
  // Toggle between carousel and full comment list
  const toggleCommentView = () => {
    setViewAllComments(!viewAllComments);
  };
  
  return (
    <div className="commentSectionContainer" ref={ref}>
      <div className={`commentSectionHeader ${inView ? 'fadeIn' : ''}`}>
        <h2 className="commentsTitle">Discussion</h2>
        <button 
          onClick={toggleCommentView} 
          className="toggleCommentsButton"
        >
          {viewAllComments ? "Show Top Comments" : "View All Comments"}
        </button>
      </div>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="commentForm">
        <textarea
          className="commentInput"
          placeholder="Add a thoughtful comment..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          required
          rows={3}
        />
        <button type="submit" className="submitCommentButton">
          Submit Comment
        </button>
      </form>
      
      {/* Show either carousel of top comments or full comment list */}
      {viewAllComments ? (
        <CommentList postId={postId} />
      ) : (
        <CommentCarousel postId={postId} />
      )}
    </div>
  );
}