// app/posts/[id]/edit/page.js
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';
import { updatePost } from "@/app/actions/postActions";

export default async function EditPostPage({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Fetch post details
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      *,
      categories:categoryId (
        id,
        name
      )
    `)
    .eq('id', params.id)
    .single();

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  // Handle errors
  if (postError) {
    return (
      <div className="errorContainer">
        <h1 className="errorTitle">Error Loading Post</h1>
        <p className="errorMessage">{postError.message}</p>
        <Link href="/posts" className="button">
          Return to Posts
        </Link>
      </div>
    );
  }

  if (categoriesError) {
    console.error('Categories fetch error:', categoriesError);
  }

  return (
    <div className="editPostContainer">
      <h1 className="pageTitle">Edit Post</h1>
      
      <form action={updatePost} className="postForm">
        <input type="hidden" name="postId" value={post.id} />
        
        <div className="formGroup">
          <label htmlFor="title" className="formLabel">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="formInput" 
            required 
            defaultValue={post.title}
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="author" className="formLabel">Author</label>
          <input 
            type="text" 
            id="author" 
            name="author" 
            className="formInput" 
            required 
            defaultValue={post.author}
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="categoryId" className="formLabel">Category</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            className="formSelect" 
            defaultValue={post.categoryId || ""}
          >
            <option value="">Select a category (optional)</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="formGroup">
          <label htmlFor="content" className="formLabel">Content</label>
          <textarea 
            id="content" 
            name="content" 
            className="formTextarea" 
            rows="10" 
            required 
            defaultValue={post.content}
          ></textarea>
        </div>
        
        <div className="formActions">
          <Link href={`/posts/${post.id}`} className="cancelButton">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="button"
          >
            Update Post
          </button>
        </div>
      </form>
    </div>
  );
}