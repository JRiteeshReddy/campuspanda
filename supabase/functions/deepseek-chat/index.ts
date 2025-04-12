
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from '../_shared/database.types.ts';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function processes chat requests to the DeepSeek API
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY') || 'sk-fbc3b5c654e5473dbd97994f86f63fa4';
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not found');
    }
    
    // Parse the request body
    const { messages, systemPrompt } = await req.json();
    
    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }
    
    // Define a more conversational and friendly system prompt
    const friendlySystemPrompt = 
      "You are PandaChat, a friendly and enthusiastic AI companion for college students. " + 
      "Talk to the user as if you're their friend - be warm, empathetic, and even a bit humorous. " +
      "Use a conversational tone, occasional emojis, and show genuine interest in their campus life. " +
      "Ask follow-up questions when appropriate. Keep your answers conversational and friendly. " +
      "If they ask about campus topics, classes, or student life, provide helpful advice while maintaining a friendly tone. " +
      "Always be supportive and encouraging.";
    
    // Use the provided system prompt or the default friendly one
    const completeMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : [{ role: 'system', content: friendlySystemPrompt }, ...messages];
    
    console.log('Sending request to DeepSeek API');
    
    try {
      // Call DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: completeMessages,
          temperature: 0.85, // Increased for more personality
          max_tokens: 800,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error:', errorText);
        
        // If we get a payment required error (402), provide a helpful fallback response
        if (response.status === 402) {
          return new Response(
            JSON.stringify({
              success: true,
              answer: "Hey there! I'm really sorry, but I'm having some technical difficulties at the moment. Our AI service seems to be having some account balance issues. Could you try again a bit later? Thanks for understanding! 😊",
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
        
        throw new Error(`DeepSeek API returned an error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('DeepSeek API response received');
      
      return new Response(
        JSON.stringify({
          success: true,
          answer: data.choices[0].message.content,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (apiError) {
      console.error('API call error:', apiError.message);
      
      // Provide a more friendly fallback response when the API call fails
      return new Response(
        JSON.stringify({
          success: true,
          answer: "Hey friend! 👋 I'm having a bit of trouble connecting right now. Would you mind trying again in a minute? My digital brain might need a quick restart! 😅",
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error in deepseek-chat function:', error.message);
    
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
