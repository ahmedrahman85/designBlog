import { supabase } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { commentId } = req.query;

      // Validate input
      if (!commentId || isNaN(parseInt(commentId))) {
        return res.status(400).json({ error: 'Valid comment ID is required' });
      }

      // Increment the likes count directly with Supabase
      const { data, error } = await supabase
        .from('comments')
        .update({ likes: supabase.raw('likes + 1') })
        .eq('id', parseInt(commentId))
        .select()
        .single();

      if (error) {
        console.error('Supabase error in like-comment API:', error);
        return res.status(500).json({ error: 'Database operation failed' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Return the updated comment
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error in like-comment API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}