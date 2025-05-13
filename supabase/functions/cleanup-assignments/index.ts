
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { differenceInDays } from 'https://esm.sh/date-fns@3.0.0';

// Define CORS headers for browser interaction
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all assignments
    const { data: assignments, error: fetchError } = await supabase
      .from('assignments')
      .select('*');

    if (fetchError) throw fetchError;

    // Track IDs of assignments to delete
    const assignmentsToDelete: string[] = [];

    // Current date
    const today = new Date();

    // Check each assignment to see if it should be deleted
    assignments.forEach((assignment) => {
      const deadline = new Date(assignment.deadline);
      const daysPastDeadline = differenceInDays(today, deadline);
      
      // Delete assignments (whether completed or not) that are more than 2 days past deadline
      if (daysPastDeadline > 2) {
        assignmentsToDelete.push(assignment.id);
      }
    });

    // Delete identified assignments if any exist
    let deleteResult = null;
    if (assignmentsToDelete.length > 0) {
      const { data, error: deleteError } = await supabase
        .from('assignments')
        .delete()
        .in('id', assignmentsToDelete)
        .select();

      if (deleteError) throw deleteError;
      deleteResult = data;
    }

    return new Response(
      JSON.stringify({
        message: 'Cleanup process completed successfully',
        deleted: assignmentsToDelete.length,
        deletedAssignments: deleteResult
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in cleanup function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred during cleanup',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
