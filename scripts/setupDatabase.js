const { executeQuery, supabase } = require('../lib/db.js');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Check if tables exist
    console.log('Checking if tables exist...');
    
    // Create categories table if it doesn't exist
    const { error: createCategoriesError } = await supabase.rpc('create_categories_if_not_exists', {});
    if (createCategoriesError) {
      // If the RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('categories')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // relation does not exist
        console.log('Creating categories table...');
        
        // Create the table
        await supabase.query(`
          CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT
          );
        `);
        
        console.log('Categories table created');
      } else if (!error) {
        console.log('Categories table already exists');
      } else {
        throw error;
      }
    }
    
    // Create posts table if it doesn't exist
    const { error: createPostsError } = await supabase.rpc('create_posts_if_not_exists', {});
    if (createPostsError) {
      // If the RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('posts')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // relation does not exist
        console.log('Creating posts table...');
        
        // Create the table
        await supabase.query(`
          CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            author VARCHAR(100) NOT NULL,
            createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
            categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL
          );
        `);
        
        console.log('Posts table created');
      } else if (!error) {
        console.log('Posts table already exists');
      } else {
        throw error;
      }
    }
    
    // Create comments table if it doesn't exist
    const { error: createCommentsError } = await supabase.rpc('create_comments_if_not_exists', {});
    if (createCommentsError) {
      // If the RPC function doesn't exist, create the table directly
      const { error } = await supabase
        .from('comments')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') { // relation does not exist
        console.log('Creating comments table...');
        
        // Create the table
        await supabase.query(`
          CREATE TABLE comments (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            likes INTEGER DEFAULT 0,
            createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
            postId INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE
          );
        `);
        
        console.log('Comments table created');
      } else if (!error) {
        console.log('Comments table already exists');
      } else {
        throw error;
      }
    }

    // Check if categories table has data
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('count', { count: 'exact' });
    
    if (categoriesError) throw categoriesError;
    
    // Insert sample categories if needed
    if (!categoriesData || categoriesData.length === 0) {
      console.log('Inserting sample categories...');
      
      await supabase
        .from('categories')
        .insert([
          { name: 'Essays', description: 'Thoughtful explorations of ideas and concepts' },
          { name: 'Reviews', description: 'Critical analysis and opinions on books, films, and other media' },
          { name: 'Interviews', description: 'Conversations with interesting people' },
          { name: 'Personal', description: 'Reflections and personal experiences' },
          { name: 'Photography', description: 'Visual storytelling and photography' },
          { name: 'Travel', description: 'Adventures and explorations from around the world' },
          { name: 'Creative Writing', description: 'Fiction, poetry, and other creative works' }
        ]);
      
      console.log('Sample categories inserted');
    } else {
      console.log('Categories already exist, skipping insertion');
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup if this script is executed directly
setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });