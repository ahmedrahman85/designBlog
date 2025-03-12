import Link from "next/link";
import { executeQuery } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import PostCard from "@/components/PostCard";

export default async function CategoryDetailPage({ params, searchParams }) {
  const { id } = params;
  
  // Determine sorting order from query parameters
  const sortOrder = searchParams?.sort || "desc";
  
  // Fetch category details
  const categoryResult = await executeQuery("SELECT * FROM categories WHERE id = $1", [id]);
  
  // If category doesn't exist, redirect to categories page
  if (categoryResult.rows.length === 0) {
    redirect('/categories');
  }
  
  const category = categoryResult.rows[0];
  
  // Fetch posts in this category
  const postsResult = await executeQuery(`
    SELECT p.*, c.name as categoryName, COUNT(com.id) as commentCount 
    FROM posts p
    LEFT JOIN categories c ON p.categoryId = c.id
    LEFT JOIN comments com ON p.id = com.postId
    WHERE p.categoryId = $1
    GROUP BY p.id, c.name
    ORDER BY p.createdAt ${sortOrder === "asc" ? "ASC" : "DESC"}
  `, [id]);
  
  const posts = postsResult.rows;
  
  // Server action to delete a post
  async function deletePost(formData) {
    'use server'
    const postId = formData.get("postId");
    
    // Delete the post (comments will be deleted automatically due to CASCADE constraint)
    await executeQuery('DELETE FROM posts WHERE id = $1', [postId]);
    
    // Revalidate the category page
    revalidatePath(`/categories/${id}`);
  }
  
  return (
    <div className="categoryDetailContainer">
      <div className="categoryNavigation">
        <Link href="/categories" className="backLink">
          ← All Categories
        </Link>
      </div>
      
      <div className="categoryHeader">
        <h1 className="pageTitle">{category.name}</h1>
        <p className="categoryDescription">{category.description}</p>
        <p className="postCount">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this category
        </p>
      </div>
      
      <div className="controlsSection">
        <Link href="/posts/new" className="button">
          Create New Post
        </Link>
        <div className="sortingControls">
          <Link 
            href={`/categories/${id}?sort=desc`}
            className={`sortLink ${sortOrder !== "asc" ? "active" : ""}`}
          >
            Newest First
          </Link>
          <span className="sortDivider">|</span>
          <Link 
            href={`/categories/${id}?sort=asc`}
            className={`sortLink ${sortOrder === "asc" ? "active" : ""}`}
          >
            Oldest First
          </Link>
        </div>
      </div>
      
      <div className="postsGrid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              deletePost={deletePost} 
            />
          ))
        ) : (
          <p className="noPostsMessage">No posts found in this category yet.</p>
        )}
      </div>
    </div>
  );
}