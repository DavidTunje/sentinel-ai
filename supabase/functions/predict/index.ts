import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fusedData } = await req.json();
    console.log('Received prediction request with fused data:', fusedData);

    // Get recent honeypot events for context
    const { data: recentEvents } = await supabase
      .from('honeypot_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Build context for AI
    const context = `
You are an advanced cybersecurity AI analyzing attack patterns. Based on the following data, predict the next likely attack step.

Recent Honeypot Events:
${JSON.stringify(recentEvents, null, 2)}

Current Fused Data:
${JSON.stringify(fusedData, null, 2)}

Analyze the attack patterns and predict:
1. The most likely next attack step
2. Confidence level (0-100)
3. Impact assessment
4. Recommended prevention action

Respond in JSON format:
{
  "next_step": "description of predicted attack step",
  "confidence": number (0-100),
  "explanation": "detailed analysis",
  "impact": "impact assessment",
  "prevention": "recommended prevention action"
}
`;

    // Call Lovable AI for prediction
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a cybersecurity threat prediction AI. Always respond with valid JSON.' },
          { role: 'user', content: context }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let aiContent = aiData.choices[0].message.content;
    
    // Remove markdown code block wrappers if present
    aiContent = aiContent.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    
    const prediction = JSON.parse(aiContent);

    console.log('AI Prediction:', prediction);

    // Store prediction in database
    const { data: savedPrediction, error: saveError } = await supabase
      .from('predictions')
      .insert({
        step: prediction.next_step,
        confidence: prediction.confidence,
        explanation: prediction.explanation,
        impact: prediction.impact,
        prevention: prediction.prevention,
        recommended_action: prediction.prevention,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving prediction:', saveError);
      throw saveError;
    }

    // Create alert if confidence is high
    if (prediction.confidence > 75) {
      await supabase.from('alerts').insert({
        severity: prediction.confidence > 90 ? 'critical' : 'high',
        title: `Predicted Attack: ${prediction.next_step}`,
        description: prediction.explanation,
        source: 'AI Prediction Engine',
        recommended_action: prediction.prevention,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction: savedPrediction 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
