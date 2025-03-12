// app/posts/new/page.js
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/db";

export default async function NewPostPage() {
  // Fetch categories for the dropdown
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
  }

  // Server action to handle form submission
  async function createPost(formData) {
    'use server'
    
    // Convert the FormData to a plain object
    const data = Object.fromEntries(formData);
    const { title, content, author, categoryId } = data;
    
    // Basic validation
    if (!title || !content || !author) {
      throw new Error('All required fields must be filled out');
    }
    
    try {
      // Prepare post data - use the EXACT column names from your schema
      const postData = {
        title,
        content,
        author
      };
      
      // Only add category if selected and not empty/zero
      if (categoryId && categoryId !== "" && categoryId !== "0") {
        // Add the category ID without parsing to integer
        postData["categoryId"] = categoryId;
      }
      
      console.log("Creating post with data:", postData);
      
      // Insert the post using Supabase
      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select();
      
      if (error) {
        console.error('Error creating post:', error);
        throw new Error(`Failed to create post: ${error.message}`);
      }
      
      // Revalidate the posts list and redirect
      revalidatePath('/posts');
      redirect('/posts');
    } catch (error) {
      console.error('Post creation error:', error);
      throw error;
    }
  }
  
  return (
    <div className="newPostContainer">
      <h1 className="pageTitle">Create New Post</h1>
      
      <form action={createPost} className="postForm">
        <div className="formGroup">
          <label htmlFor="title" className="formLabel">Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="formInput" 
            required 
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
          />
        </div>
        
        <div className="formGroup">
          <label htmlFor="categoryId" className="formLabel">Category</label>
          <select 
            id="categoryId" 
            name="categoryId" 
            className="formSelect"
          >
            <option value="">Select a category (optional)</option>
            {categories && categories.map((category) => (
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
          ></textarea>
        </div>
        
        <div className="formActions">
          <Link href="/posts" className="cancelButton">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create Post
          </button>
        </div>
      </form>
    </div>
  );
}