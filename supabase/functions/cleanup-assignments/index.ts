
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../_shared/database.types.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client initialization
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Starting cleanup of old completed assignments');
    
    // Get current date
    const now = new Date();
    
    // Calculate date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);
    
    // Format the date for comparison with Supabase
    const compareDate = twoDaysAgo.toISOString();
    
    console.log(`Deleting completed assignments with deadline before ${compareDate}`);
    
    // Delete completed assignments with deadline older than 2 days
    const { data, error, count } = await supabase
      .from('assignments')
      .delete()
      .lt('deadline', compareDate)
      .eq('completed', true)
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log(`Successfully deleted ${count} completed assignments`);
    
    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: count,
        deletedAssignments: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error during assignment cleanup:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
