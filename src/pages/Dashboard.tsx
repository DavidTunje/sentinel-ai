import { Card } from "@/components/ui/card";
import { RiskMeter } from "@/components/RiskMeter";
import { AlertCard } from "@/components/AlertCard";
import { mockAlerts, mockHoneypotLogs, mockPredictions, mockSystemStatus, threatTimelineData, attackTypesData } from "@/lib/mockData";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, Shield, Target, Zap } from "lucide-react";

const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--muted))'];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Command Center</h1>
        <p className="text-muted-foreground">Real-time threat intelligence and predictive analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Threats</p>
              <p className="text-3xl font-bold text-destructive mt-1">
                {mockAlerts.filter(a => a.status === "active").length}
              </p>
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
              <p className="text-3xl font-bold text-warning mt-1">{mockHoneypotLogs.length}</p>
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
              <p className="text-3xl font-bold text-primary mt-1">{mockPredictions.length}</p>
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
        {/* Risk Meter */}
        <div className="lg:col-span-1">
          <RiskMeter score={73} />
        </div>

        {/* Threat Timeline */}
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
      <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-foreground">AI Predicted Next Attack Step</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">{mockPredictions[0].step}</span>
            <span className="text-accent font-bold">{mockPredictions[0].confidence}% confidence</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Impact: </span>
              <span className="text-foreground">{mockPredictions[0].impact}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Prevention: </span>
              <span className="text-foreground">{mockPredictions[0].prevention}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Attack Types & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Types Distribution */}
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

        {/* System Status */}
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
        <div className="space-y-3">
          {mockAlerts.slice(0, 3).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );
}
