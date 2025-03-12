const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for querying data
async function executeQuery(table, query = {}) {
  try {
    let queryBuilder = supabase.from(table).select('*');
    
    // Apply filters if they exist
    if (query.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
    }
    
    // Apply order if it exists
    if (query.order) {
      const { column, ascending } = query.order;
      queryBuilder = queryBuilder.order(column, { ascending });
    }
    
    // Apply limit if it exists
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return { rows: data || [] };
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return { rows: [] };
  }
}

// Improved Raw Query function for Supabase
async function executeRawQuery(sql, params = []) {
  try {
    console.log("SQL operation:", sql);
    console.log("SQL params:", params);
    
    // Parse the SQL to determine table and operation
    const operation = sql.trim().split(' ')[0].toLowerCase();
    
    // Extract table name using regex
    let tableName;
    if (operation === 'select') {
      tableName = sql.match(/from\s+([^\s,;]+)/i)?.[1];
    } else if (operation === 'update') {
      tableName = sql.match(/update\s+([^\s,;]+)/i)?.[1];
    } else if (operation === 'insert') {
      tableName = sql.match(/into\s+([^\s,;]+)/i)?.[1];
    } else if (operation === 'delete') {
      tableName = sql.match(/from\s+([^\s,;]+)/i)?.[1];
    }
    
    if (!tableName) {
      throw new Error(`Could not determine table name from SQL: ${sql}`);
    }
    
    // Handle different SQL operations
    let result;
    
    switch (operation) {
      case 'select':
        // Basic SELECT handling
        const { data, error } = await supabase.from(tableName).select('*');
        result = { data, error };
        
        // If this is a specific SELECT by ID
        if (sql.includes('WHERE id =') && params.length > 0) {
          const idParam = params[0];
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', idParam)
            .single();
          result = { data: data ? [data] : [], error };
        }
        
        // Handle other SELECT conditions here as needed
        break;
        
      case 'update':
        // Extract column names and values from SQL
        let updateData = {};
        
        // Handle basic UPDATE with SET and WHERE
        if (operation === 'update' && sql.includes('SET') && sql.includes('WHERE')) {
          // Very basic implementation - for production you'd want more robust parsing
          const setFields = sql.match(/SET\s+(.+?)\s+WHERE/i)?.[1];
          
          if (setFields) {
            const fieldsArray = setFields.split(',').map(f => f.trim());
            
            fieldsArray.forEach((field, index) => {
              const [column] = field.split('=').map(f => f.trim());
              updateData[column] = params[index];
            });
            
            // Extract the WHERE condition (assuming it's id = ?)
            const whereColumn = 'id';  // Simplified assumption
            const whereValue = params[params.length - 1];
            
            const { data, error } = await supabase
              .from(tableName)
              .update(updateData)
              .eq(whereColumn, whereValue)
              .select();
              
            result = { data, error };
          }
        }
        break;
        
      case 'insert':
        // Handle INSERT operation here
        break;
        
      case 'delete':
        // Handle DELETE operation here
        break;
        
      default:
        throw new Error(`Unsupported SQL operation: ${operation}`);
    }
    
    if (result?.error) throw result.error;
    
    return { rows: result?.data || [] };
  } catch (error) {
    console.error('Database raw query error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return { rows: [] };
  }
}

module.exports = { executeQuery, executeRawQuery, supabase };