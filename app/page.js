import Link from "next/link";
const { supabase } = require("../lib/db");

export default async function Home() {
  // Try to fetch latest posts (if database is set up)
  let latestPosts = [];
  let featuredCategories = [];
  
  try {
    // Fetch latest posts
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*, categories(name)')
      .order('createdAt', { ascending: false })
      .limit(3);
    
    if (postError) throw postError;
    latestPosts = postData || [];
    
    // Fetch featured categories
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('*, posts(count)')
      .order('id', { ascending: true })
      .limit(4);
    
    if (categoryError) throw categoryError;
    featuredCategories = categoryData || [];
  } catch (error) {
    console.error('Database error:', error);
    // Continue with empty arrays if database isn't ready yet
  }
  
  return (
    <div className="homePage">
      <section className="heroSection" style={{ 
        backgroundColor: "#E6C67C", 
        padding: "60px 0", 
        marginBottom: "40px" 
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ 
            fontSize: "3rem", 
            marginBottom: "1rem", 
            color: "#112542",
            borderLeft: "12px solid #023C3D",
            paddingLeft: "20px" 
          }}>
            The Rushmore Blog
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            marginBottom: "2rem",
            color: "#023C3D" 
          }}>
            A superflat blog experience with the iconic Rushmore colour palette
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Link href="/posts" style={{
              backgroundColor: "#112542",
              color: "white",
              padding: "12px 25px",
              fontWeight: "500"
            }}>
              Browse Posts
            </Link>
            <Link href="/posts/new" style={{
              backgroundColor: "white",
              color: "#112542",
              padding: "12px 25px",
              fontWeight: "500",
              border: "2px solid #112542"
            }}>
              Create Post
            </Link>
          </div>
        </div>
      </section>
      
      <section style={{ marginBottom: "60px" }}>
        <h2 style={{ 
          fontSize: "1.75rem", 
          marginBottom: "30px",
          color: "#112542",
          borderLeft: "8px solid #E6C67C",
          paddingLeft: "15px" 
        }}>
          Latest Posts
        </h2>
        
        {latestPosts.length > 0 ? (
          <div className="postsGrid">
            {latestPosts.map((post) => (
              <div key={post.id} className="postCard">
                <div className="postCardHeader">
                  <span>{post.categories?.name || "Uncategorised"}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
                
                <Link href={`/posts/${post.id}`}>
                  <h3 className="postTitle">{post.title}</h3>
                </Link>
                
                <div className="postMeta">
                  <span>By {post.author}</span>
                </div>
                
                <div className="postActions">
                  <Link href={`/posts/${post.id}`} style={{
                    backgroundColor: "#112542",
                    color: "white",
                    padding: "8px 16px",
                    display: "inline-block"
                  }}>
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No posts found. Create your first post to get started!</p>
        )}
        
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Link href="/posts" style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#E6C67C",
            color: "#112542",
            fontWeight: "500",
            border: "2px solid #112542"
          }}>
            View All Posts
          </Link>
        </div>
      </section>
    </div>
  );
}