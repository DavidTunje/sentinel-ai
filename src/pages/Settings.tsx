import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockSystemStatus } from "@/lib/mockData";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure PrediGuard AI system parameters</p>
      </div>

      {/* Module Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Active Modules</h3>
        <div className="space-y-4">
          {mockSystemStatus.map((system) => (
            <div key={system.name} className="flex items-center justify-between">
              <Label htmlFor={system.name} className="text-foreground">{system.name}</Label>
              <Switch id={system.name} defaultChecked={system.status !== "down"} />
            </div>
          ))}
        </div>
      </Card>

      {/* Alert Thresholds */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Alert Thresholds</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="critical">Critical Threat Score</Label>
            <Input id="critical" type="number" defaultValue="90" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="high">High Threat Score</Label>
            <Input id="high" type="number" defaultValue="70" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="medium">Medium Threat Score</Label>
            <Input id="medium" type="number" defaultValue="50" />
          </div>
        </div>
      </Card>

      {/* Data Sources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Sources</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="network">Network Logs</Label>
            <Switch id="network" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="honeypot">Honeypot Events</Label>
            <Switch id="honeypot" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="threat">Threat Intelligence Feeds</Label>
            <Switch id="threat" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="user">User Behavior Analytics</Label>
            <Switch id="user" defaultChecked />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button className="bg-primary hover:bg-primary/90">Save Settings</Button>
      </div>
    </div>
  );
}
