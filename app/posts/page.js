import Link from "next/link";
import { supabase } from "@/lib/db";
import PostCard from "@/components/PostCard";
import SortingControls from "@/components/SortingControls";

export default async function PostsPage({ searchParams }) {
  // Correctly await searchParams
  const resolvedSearchParams = await searchParams;
  
  // Determine sort order
  const sortOrder = resolvedSearchParams?.sort ?? 'desc';

  try {
    // Fetch posts with categories
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        categories:categoryId (
          name
        )
      `)
      .order('"createdAt"', { ascending: sortOrder === 'asc' });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      throw postsError;
    }

    // Fetch comment counts
    const commentCountPromises = posts.map(async (post) => {
      const { count: commentCount, error: commentError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('"postId"', post.id);

      if (commentError) {
        console.error(`Error counting comments for post ${post.id}:`, commentError);
        return { 
          ...post, 
          commentcount: 0,
          categoryname: post.categories?.name || 'Uncategorised'
        };
      }

      return { 
        ...post, 
        commentcount: commentCount || 0,
        categoryname: post.categories?.name || 'Uncategorised'
      };
    });

    // Wait for all comment count queries
    const postsWithComments = await Promise.all(commentCountPromises);

    return (
      <div className="postsContainer">
        <div className="postsHeader">
          <h1 className="pageTitle">Blog Posts</h1>
          <Link href="/posts/new" className="button createPostButton">
            Create New Post
          </Link>
        </div>

        <div className="postsControls">
          <SortingControls currentSort={sortOrder} />
        </div>

        <div className="postsList">
          {postsWithComments.length === 0 ? (
            <p className="noPosts">No posts yet. Create your first post!</p>
          ) : (
            postsWithComments.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id,
                  title: post.title,
                  author: post.author,
                  createdAt: post.createdAt,
                  categoryname: post.categoryname,
                  commentcount: post.commentcount
                }} 
              />
            ))
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return (
      <div className="postsContainer">
        <p className="errorMessage">
          Error loading posts. Please try again later.
        </p>
      </div>
    );
  }
}