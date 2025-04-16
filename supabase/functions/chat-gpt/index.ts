
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured. Please check your Supabase secrets.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Log masked key version to verify it exists (security practice)
    console.log(`API Key available and starts with: ${OPENAI_API_KEY.substring(0, 5)}...`);

    const { message } = await req.json();

    if (!message) {
      throw new Error('No message provided');
    }

    // Log for debugging
    console.log(`Processing message: ${message.substring(0, 30)}...`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: "You are CampusPanda's helpful AI assistant. You help students with their academic queries, study tips, and general advice about college life. Be friendly, encouraging, and concise.",
            },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      
      console.log(`OpenAI API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} ${errorText}`);
        return new Response(
          JSON.stringify({
            error: `OpenAI API error: ${response.status} ${errorText}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }

      const data = await response.json();
      console.log("Successfully received response from OpenAI");
      
      return new Response(
        JSON.stringify({
          reply: data.choices[0].message.content,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (openaiError) {
      console.error("Error calling OpenAI API:", openaiError);
      return new Response(
        JSON.stringify({
          error: `Error calling OpenAI API: ${openaiError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error('General Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
