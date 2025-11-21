import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ATTACK_SCENARIOS = [
  { 
    name: 'Brute Force Attack', 
    endpoint: '/honeypot/login',
    attacks: 10,
    pattern: 'Credential Stuffing'
  },
  { 
    name: 'SQL Injection Chain', 
    endpoint: '/honeypot/db',
    attacks: 5,
    pattern: 'SQL Injection'
  },
  { 
    name: 'Privilege Escalation', 
    endpoint: '/honeypot/api',
    attacks: 7,
    pattern: 'Unauthorized Access'
  },
  { 
    name: 'Data Exfiltration', 
    endpoint: '/honeypot/api',
    attacks: 8,
    pattern: 'Data Theft Attempt'
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { scenarioName } = await req.json();
    console.log('Starting simulation:', scenarioName);

    const scenario = ATTACK_SCENARIOS.find(s => s.name === scenarioName) || ATTACK_SCENARIOS[0];
    
    // Create simulation record
    const { data: simulation, error: simError } = await supabase
      .from('simulations')
      .insert({
        name: scenario.name,
        attack_type: scenario.pattern,
        status: 'running',
      })
      .select()
      .single();

    if (simError) throw simError;

    const logs: string[] = [];
    const startTime = Date.now();

    logs.push(`[INFO] Starting ${scenario.name} simulation`);
    logs.push(`[SIM] Red team AI spawned - Target: ${scenario.endpoint}`);
    logs.push(`[SIM] Blue team defender active`);

    // Simulate attacks
    for (let i = 0; i < scenario.attacks; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      logs.push(`[ATTACK] Attempt ${i + 1}/${scenario.attacks} - ${scenario.pattern}`);

      // Simulate honeypot call
      try {
        const honeypotUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1${scenario.endpoint.replace('/honeypot', '/honeypot-')}`;
        
        const attackData = scenario.endpoint === '/honeypot/login' 
          ? { username: `admin${i}`, password: `password${i}` }
          : scenario.endpoint === '/honeypot/db'
          ? { query: `SELECT * FROM users WHERE id=${i}` }
          : { endpoint: `/api/data/${i}` };

        await fetch(honeypotUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify(attackData),
        });

        logs.push(`[DEFENSE] Attack pattern detected and logged`);
      } catch (err) {
        console.error('Honeypot call failed:', err);
      }
    }

    const duration = Math.floor((Date.now() - startTime) / 1000);
    logs.push(`[BLOCKED] All attacks neutralized by AI defender`);
    logs.push(`[SUCCESS] Simulation completed in ${duration}s`);

    // Update simulation
    await supabase
      .from('simulations')
      .update({
        status: 'completed',
        result: 'Defender Win',
        duration: `${duration}s`,
        blocked: true,
        logs: logs,
      })
      .eq('id', simulation.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        simulation: {
          ...simulation,
          status: 'completed',
          result: 'Defender Win',
          duration: `${duration}s`,
          logs,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in simulation-run:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
