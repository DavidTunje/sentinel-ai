import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskMeter } from "@/components/RiskMeter";
import { AlertCard } from "@/components/AlertCard";
import { mockSystemStatus, threatTimelineData, attackTypesData } from "@/lib/mockData";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Shield, Target, Zap, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { api, subscribeToAlerts, subscribeToHoneypotEvents, subscribeToPredictions } from "@/lib/api";
import { Alert, HoneypotEvent, Prediction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--muted))'];

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [honeypotEvents, setHoneypotEvents] = useState<HoneypotEvent[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const alertsChannel = subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      toast({
        title: `New Alert: ${newAlert.severity.toUpperCase()}`,
        description: newAlert.title,
        variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
      });
    });

    const honeypotChannel = subscribeToHoneypotEvents((newEvent) => {
      setHoneypotEvents(prev => [newEvent, ...prev]);
    });

    const predictionsChannel = subscribeToPredictions((newPrediction) => {
      setPredictions(prev => [newPrediction, ...prev.slice(0, 4)]);
      toast({
        title: 'New Prediction',
        description: newPrediction.step,
      });
    });

    return () => {
      alertsChannel.unsubscribe();
      honeypotChannel.unsubscribe();
      predictionsChannel.unsubscribe();
    };
  }, [toast]);

  const loadData = async () => {
    try {
      const [alertsData, eventsData, predictionsData] = await Promise.all([
        api.getAlerts(),
        api.getHoneypotEvents(),
        api.getPredictions(),
      ]);
      setAlerts(alertsData);
      setHoneypotEvents(eventsData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runDemoAttack = async () => {
    setDemoRunning(true);
    toast({
      title: 'Demo Attack Sequence Started',
      description: 'Simulating attack progression through all honeypot endpoints...',
    });

    try {
      // Attack 1: Brute force login attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: '🎯 Step 1: Login Attack',
        description: 'Simulating brute force login attempts...',
      });
      const loginResult = await api.testHoneypotLogin('admin', 'password123');
      console.log('Login honeypot triggered:', loginResult);

      // Attack 2: SQL Injection on API
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: '🎯 Step 2: API Attack',
        description: 'Simulating SQL injection on API endpoint...',
      });
      const apiResult = await api.testHoneypotAPI('users');
      console.log('API honeypot triggered:', apiResult);

      // Attack 3: Database exploit
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: '🎯 Step 3: Database Attack',
        description: 'Simulating database exploitation attempt...',
      });
      const dbResult = await api.testHoneypotDB('SELECT * FROM users; DROP TABLE users;');
      console.log('DB honeypot triggered:', dbResult);

      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: '✅ Demo Complete',
        description: 'Attack sequence completed. Check alerts and predictions!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Demo attack error:', error);
      toast({
        title: 'Demo Error',
        description: 'Failed to complete demo sequence',
        variant: 'destructive',
      });
    } finally {
      setDemoRunning(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const avgThreatScore = honeypotEvents.length > 0
    ? Math.round(honeypotEvents.reduce((acc, e) => acc + e.threat_score, 0) / honeypotEvents.length)
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Command Center</h1>
          <p className="text-muted-foreground">Real-time threat intelligence and predictive analytics</p>
        </div>
        <Button 
          onClick={runDemoAttack} 
          disabled={demoRunning}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          {demoRunning ? 'Running Demo...' : 'Run Demo Attack'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Threats</p>
              <p className="text-3xl font-bold text-destructive mt-1">{activeAlerts.length}</p>
            </div>
            <div className="p-3 bg-destructive/20 rounded-lg">
              <Activity className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warning/10 to-transparent border-warning/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Honeypot Hits</p>
              <p className="text-3xl font-bold text-warning mt-1">{honeypotEvents.length}</p>
            </div>
            <div className="p-3 bg-warning/20 rounded-lg">
              <Target className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Predictions</p>
              <p className="text-3xl font-bold text-primary mt-1">{predictions.length}</p>
            </div>
            <div className="p-3 bg-primary/20 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/10 to-transparent border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Systems Online</p>
              <p className="text-3xl font-bold text-success mt-1">
                {mockSystemStatus.filter(s => s.status === "operational").length}/{mockSystemStatus.length}
              </p>
            </div>
            <div className="p-3 bg-success/20 rounded-lg">
              <Shield className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskMeter score={avgThreatScore} />
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">24-Hour Threat Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={threatTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="threats" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* Predicted Next Attack Step */}
      {predictions.length > 0 && (
        <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">AI Predicted Next Attack Step</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{predictions[0].step}</span>
              <span className="text-accent font-bold">{predictions[0].confidence}% confidence</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Impact: </span>
                <span className="text-foreground">{predictions[0].impact}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Prevention: </span>
                <span className="text-foreground">{predictions[0].prevention}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Attack Types & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Attack Type Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={attackTypesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attackTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
          <div className="space-y-4">
            {mockSystemStatus.map((system) => (
              <div key={system.name} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{system.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{system.uptime}% uptime</span>
                  <div className={`w-3 h-3 rounded-full ${
                    system.status === 'operational' ? 'bg-success' :
                    system.status === 'degraded' ? 'bg-warning' :
                    'bg-destructive'
                  } ${system.status === 'operational' ? 'animate-pulse-glow' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Alerts</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No alerts yet. System is secure.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
