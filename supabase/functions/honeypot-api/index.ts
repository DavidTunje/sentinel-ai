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
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log(`Honeypot API access from IP: ${ip}, Path: ${path}`);

    let body = null;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Detect attack patterns
    let pattern = 'API Reconnaissance';
    let threatScore = 70;

    if (path.includes('..') || path.includes('etc')) {
      pattern = 'Directory Traversal Attempt';
      threatScore = 90;
    } else if (JSON.stringify(body).includes('<script>')) {
      pattern = 'XSS Injection Attempt';
      threatScore = 85;
    } else if (req.headers.get('user-agent')?.includes('sqlmap')) {
      pattern = 'Automated Attack Tool Detected';
      threatScore = 95;
    }

    // Log honeypot event
    await supabase.from('honeypot_events').insert({
      ip_address: ip,
      endpoint: `/honeypot/api${path}`,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      body: body,
      pattern: pattern,
      threat_score: threatScore,
    });

    // Create alert
    if (threatScore > 80) {
      await supabase.from('alerts').insert({
        severity: 'high',
        title: `Honeypot Alert: ${pattern}`,
        description: `Detected ${pattern} from IP ${ip} on path ${path}`,
        source: 'Honeypot API',
        ip_address: ip,
        recommended_action: 'Block IP and investigate further',
      });
    }

    // Return fake API response
    return new Response(
      JSON.stringify({ 
        status: 'ok',
        data: [],
        message: 'No data available' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in honeypot-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
