'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function CommentCarousel({ postId }) {
  const [topComments, setTopComments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // Fetch top comments for this post
  useEffect(() => {
    const fetchTopComments = async () => {
      try {
        const response = await fetch(`/api/comments?postId=${postId}&limit=5&sort=likes`);
        if (!response.ok) throw new Error('Failed to fetch comments');
        
        const data = await response.json();
        setTopComments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top comments:', error);
        setLoading(false);
      }
    };
    
    fetchTopComments();
  }, [postId]);
  
  // Auto-rotate comments when not hovered
  useEffect(() => {
    if (topComments.length <= 1 || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === topComments.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Rotate every 5 seconds
    
    return () => clearInterval(interval);
  }, [topComments, isHovered]);
  
  // Navigate to previous comment
  const prevComment = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? topComments.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next comment
  const nextComment = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === topComments.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleLike = async (commentId) => {
    try {
      console.log('Attempting to like comment ID:', commentId);
      
      // Optimistically update the UI
      setTopComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
      
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });
      
      console.log('Response status:', response.status);
      
      // Get text first to see what's being returned
      const text = await response.text();
      console.log('Raw response:', text);
      
      // Try to parse JSON if there's content
      let data = {};
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
          console.log('Parsed data:', data);
        } catch (e) {
          console.warn('Not valid JSON:', e);
        }
      }
      
      if (!response.ok) {
        console.error('Like error details:', {
          status: response.status,
          text: text,
          data: data
        });
        
        // Revert the optimistic update
        setTopComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: comment.likes - 1 } 
              : comment
          )
        );
        
        throw new Error(data.error || `Failed to like comment (${response.status})`);
      }
      
      // On successful response, update the comment in state with returned data
      if (data) {
        // If the response is the full comment object
        if (data.id && data.id === commentId) {
          setTopComments(prevComments => 
            prevComments.map(comment => 
              comment.id === commentId ? data : comment
            )
          );
        } 
        // If the response just has likes property (minimal response)
        else if (data.likes) {
          setTopComments(prevComments => 
            prevComments.map(comment => 
              comment.id === commentId 
                ? { ...comment, likes: data.likes }
                : comment
            )
          );
        }
        // Otherwise, the optimistic update remains
      }
      
      console.log('Like successful');
      
    } catch (error) {
      console.error('Like error caught:', error);
    }
  };
  
  if (loading) {
    return <div className="commentLoading">Loading comments...</div>;
  }
  
  if (topComments.length === 0) {
    return <div className="noComments">No comments yet. Be the first to comment!</div>;
  }
  
  return (
    <div 
      className="commentCarousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="carouselContainer">
        <button 
          className="carouselButton prevButton" 
          onClick={prevComment}
          aria-label="Previous comment"
        >
          ‹
        </button>
        
        <div className="commentViewport">
          <AnimatePresence mode="wait">
            <motion.div 
              key={topComments[currentIndex]?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="commentCard"
            >
              <div className="commentContent">
                {topComments[currentIndex]?.content}
              </div>
              
              <div className="commentMeta">
                <div className="commentDate">
                  {formatDate(topComments[currentIndex]?.createdAt)}
                </div>
                
                <div className="commentActions">
                  <button 
                    className="likeButton"
                    onClick={() => handleLike(topComments[currentIndex]?.id)}
                  >
                    ♥ {topComments[currentIndex]?.likes}
                  </button>
                  
                  <Link 
                    href={`/posts/${postId}/comments/${topComments[currentIndex]?.id}/edit`}
                    className="editCommentLink"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <button 
          className="carouselButton nextButton" 
          onClick={nextComment}
          aria-label="Next comment"
        >
          ›
        </button>
      </div>
      
      <div className="commentIndicators">
        {topComments.map((_, index) => (
          <button
            key={index}
            className={`indicatorDot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to comment ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}