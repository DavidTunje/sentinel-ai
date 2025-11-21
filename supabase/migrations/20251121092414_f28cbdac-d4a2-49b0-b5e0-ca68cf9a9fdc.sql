-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  ip_address TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create honeypot_events table
CREATE TABLE public.honeypot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  headers JSONB,
  body JSONB,
  pattern TEXT,
  threat_score INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create predictions table
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  impact TEXT NOT NULL,
  prevention TEXT NOT NULL,
  explanation TEXT,
  recommended_action TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create simulations table
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  attack_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result TEXT,
  duration TEXT,
  logs JSONB,
  blocked BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system_status table
CREATE TABLE public.system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial system status
INSERT INTO public.system_status (module, status) VALUES
  ('Honeypots', 'active'),
  ('AI Prediction', 'active'),
  ('Data Fusion', 'active'),
  ('Simulation Engine', 'active'),
  ('Prevention System', 'active');

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honeypot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;

-- Create public read policies (no authentication required for this demo)
CREATE POLICY "Allow public read on alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on alerts" ON public.alerts FOR UPDATE USING (true);

CREATE POLICY "Allow public read on honeypot_events" ON public.honeypot_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert on honeypot_events" ON public.honeypot_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on predictions" ON public.predictions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on simulations" ON public.simulations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on simulations" ON public.simulations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on simulations" ON public.simulations FOR UPDATE USING (true);

CREATE POLICY "Allow public read on system_status" ON public.system_status FOR SELECT USING (true);
CREATE POLICY "Allow public update on system_status" ON public.system_status FOR UPDATE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.honeypot_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.simulations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_status;