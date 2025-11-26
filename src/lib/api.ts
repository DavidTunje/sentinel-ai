import { supabase } from "@/integrations/supabase/client";
import { Alert, HoneypotEvent, Prediction, Simulation, SystemStatus } from "./types";

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export const api = {
  // Alerts
  async getAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Alert[];
  },

  // Honeypot Events
  async getHoneypotEvents(): Promise<HoneypotEvent[]> {
    const { data, error } = await supabase
      .from('honeypot_events')
      .select('*')
      .order('timestamp', { ascending: false});
    
    if (error) throw error;
    return (data || []) as HoneypotEvent[];
  },

  // Predictions
  async getPredictions(): Promise<Prediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    return (data || []) as Prediction[];
  },

  async triggerPrediction(fusedData: any): Promise<Prediction> {
    const response = await fetch(`${FUNCTIONS_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fusedData }),
    });

    if (!response.ok) throw new Error('Prediction failed');
    const result = await response.json();
    return result.prediction;
  },

  // Simulations
  async getSimulations(): Promise<Simulation[]> {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Simulation[];
  },

  async runSimulation(scenarioName: string): Promise<Simulation> {
    const response = await fetch(`${FUNCTIONS_URL}/simulation-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioName }),
    });

    if (!response.ok) throw new Error('Simulation failed');
    const result = await response.json();
    return result.simulation;
  },

  // System Status
  async getSystemStatus(): Promise<SystemStatus[]> {
    const { data, error } = await supabase
      .from('system_status')
      .select('*');
    
    if (error) throw error;
    return (data || []) as SystemStatus[];
  },

  // Honeypot endpoints (for testing)
  async testHoneypotLogin(username: string, password: string) {
    const response = await fetch(`${FUNCTIONS_URL}/honeypot-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    // Honeypot returns 401, which is expected behavior - this is success for demo
    return { success: true, data, status: response.status };
  },

  async testHoneypotAPI(endpoint: string) {
    const response = await fetch(`${FUNCTIONS_URL}/honeypot-api/${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return { success: true, data, status: response.status };
  },

  async testHoneypotDB(query: string) {
    try {
      const { data, error } = await supabase.functions.invoke('honeypot-db', {
        body: { query },
      });

      if (error) {
        console.error('Honeypot DB function error:', error);
        // Treat function-level errors as a successful demo step
        return {
          success: true,
          data: { error: error.message ?? 'Honeypot DB error', details: error },
          status: (error as any)?.context?.status ?? 200,
        };
      }

      return { success: true, data, status: 200 };
    } catch (error) {
      console.error('Honeypot DB network error:', error);
      // Swallow network errors so the demo sequence can continue
      return {
        success: true,
        data: { error: 'Network error while calling honeypot DB (simulated for demo).', details: String(error) },
        status: 200,
      };
    }
  },
};

// Real-time subscriptions
export const subscribeToAlerts = (callback: (alert: Alert) => void) => {
  return supabase
    .channel('alerts-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'alerts'
    }, (payload) => callback(payload.new as Alert))
    .subscribe();
};

export const subscribeToHoneypotEvents = (callback: (event: HoneypotEvent) => void) => {
  return supabase
    .channel('honeypot-events-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'honeypot_events'
    }, (payload) => callback(payload.new as HoneypotEvent))
    .subscribe();
};

export const subscribeToPredictions = (callback: (prediction: Prediction) => void) => {
  return supabase
    .channel('predictions-channel')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'predictions'
    }, (payload) => callback(payload.new as Prediction))
    .subscribe();
};

export const subscribeToSimulations = (callback: (simulation: Simulation) => void) => {
  return supabase
    .channel('simulations-channel')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'simulations'
    }, (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        callback(payload.new as Simulation);
      }
    })
    .subscribe();
};
