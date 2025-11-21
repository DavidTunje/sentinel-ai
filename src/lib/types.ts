export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  source: string;
  ip_address?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  recommended_action?: string;
  created_at: string;
}

export interface HoneypotEvent {
  id: string;
  ip_address: string;
  endpoint: string;
  method: string;
  headers?: Record<string, any>;
  body?: Record<string, any>;
  pattern?: string;
  threat_score: number;
  timestamp: string;
  created_at: string;
}

export interface Prediction {
  id: string;
  step: string;
  confidence: number;
  impact: string;
  prevention: string;
  explanation?: string;
  recommended_action?: string;
  timestamp: string;
  created_at: string;
}

export interface Simulation {
  id: string;
  name: string;
  attack_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  duration?: string;
  logs?: string[];
  blocked: boolean;
  timestamp: string;
  created_at: string;
}

export interface SystemStatus {
  id: string;
  module: string;
  status: 'active' | 'inactive' | 'error';
  last_updated: string;
}
