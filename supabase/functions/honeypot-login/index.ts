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

    const body = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    console.log(`Honeypot login attempt from IP: ${ip}`, body);

    // Detect attack patterns
    let pattern = 'Unknown';
    let threatScore = 50;

    if (body.username?.toLowerCase().includes('admin')) {
      pattern = 'Admin Account Probing';
      threatScore = 85;
    } else if (body.password?.includes("'") || body.password?.includes('--')) {
      pattern = 'SQL Injection Attempt';
      threatScore = 95;
    } else if (body.username?.length > 50 || body.password?.length > 50) {
      pattern = 'Buffer Overflow Attempt';
      threatScore = 90;
    }

    // Log honeypot event
    const { data: event } = await supabase
      .from('honeypot_events')
      .insert({
        ip_address: ip,
        endpoint: '/honeypot/login',
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        body: body,
        pattern: pattern,
        threat_score: threatScore,
      })
      .select()
      .single();

    console.log('Honeypot event logged:', event);

    // Create alert for high-threat events
    if (threatScore > 80) {
      await supabase.from('alerts').insert({
        severity: threatScore > 90 ? 'critical' : 'high',
        title: `Honeypot Alert: ${pattern}`,
        description: `Detected ${pattern} from IP ${ip}`,
        source: 'Honeypot System',
        ip_address: ip,
        recommended_action: 'Block IP and monitor for related activity',
      });
    }

    // Trigger prediction with fused data
    const fusedData = {
      event_type: 'honeypot_login',
      ip_address: ip,
      pattern: pattern,
      threat_score: threatScore,
      timestamp: new Date().toISOString(),
    };

    // Call prediction engine
    fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({ fusedData }),
    }).catch(err => console.error('Prediction call failed:', err));

    // Return fake error to attacker
    return new Response(
      JSON.stringify({ error: 'Invalid credentials' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in honeypot-login:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
