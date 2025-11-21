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

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const body = await req.json();
    
    console.log(`Honeypot DB query from IP: ${ip}`, body);

    // Detect SQL injection patterns
    let pattern = 'Database Query Attempt';
    let threatScore = 75;

    const query = body.query || '';
    if (query.toLowerCase().includes('drop table')) {
      pattern = 'SQL Drop Table Attack';
      threatScore = 100;
    } else if (query.toLowerCase().includes('union select')) {
      pattern = 'SQL Union Injection';
      threatScore = 95;
    } else if (query.includes("' or '1'='1")) {
      pattern = 'SQL Authentication Bypass';
      threatScore = 90;
    } else if (query.toLowerCase().includes('select') && query.toLowerCase().includes('from')) {
      pattern = 'SQL Data Extraction Attempt';
      threatScore = 85;
    }

    // Log honeypot event
    await supabase.from('honeypot_events').insert({
      ip_address: ip,
      endpoint: '/honeypot/db',
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      body: body,
      pattern: pattern,
      threat_score: threatScore,
    });

    // Create critical alert
    if (threatScore >= 90) {
      await supabase.from('alerts').insert({
        severity: 'critical',
        title: `Critical Database Attack: ${pattern}`,
        description: `Detected ${pattern} from IP ${ip}. Query: ${query.substring(0, 100)}`,
        source: 'Honeypot Database',
        ip_address: ip,
        recommended_action: 'IMMEDIATE: Block IP, isolate database endpoint, investigate breach scope',
      });
    }

    // Return fake database error
    return new Response(
      JSON.stringify({ 
        error: 'Database connection failed',
        code: 'ECONNREFUSED' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in honeypot-db:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
