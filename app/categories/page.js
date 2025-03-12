// app/categories/page.js
import Link from "next/link";
import { supabase } from "@/lib/db";

export default async function CategoriesPage() {
  // Direct Supabase query without using executeQuery
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
  }
  
  // We need to fetch post counts separately
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      // Count posts in this category
      const { count, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('"categoryId"', category.id);
        
      if (countError) {
        console.error(`Error counting posts for category ${category.id}:`, countError);
        return { ...category, postCount: 0 };
      }
      
      return { ...category, postCount: count || 0 };
    })
  );

  return (
    <div className="categoriesContainer">
      <div className="categoriesHeader">
        <h1 className="pageTitle">Categories</h1>
      </div>
      
      <div className="categoriesList">
        {categoriesWithCounts.length === 0 ? (
          <p className="noCategories">No categories yet.</p>
        ) : (
          categoriesWithCounts.map((category) => (
            <div key={category.id} className="categoryCard">
              <h2 className="categoryName">
                <Link href={`/categories/${category.id}`} className="categoryLink">
                  {category.name}
                </Link>
              </h2>
              
              <p className="categoryDescription">{category.description}</p>
              
              <div className="categoryMeta">
                <span className="postCount">
                  {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                </span>
                
                <Link href={`/categories/${category.id}`} className="viewCategoryLink">
                  View Posts
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}