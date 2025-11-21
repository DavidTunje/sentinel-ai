import { AlertCard } from "@/components/AlertCard";
import { mockAlerts } from "@/lib/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Alerts() {
  const activeAlerts = mockAlerts.filter(a => a.status === "active");
  const investigatingAlerts = mockAlerts.filter(a => a.status === "investigating");
  const resolvedAlerts = mockAlerts.filter(a => a.status === "resolved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Security Alerts</h1>
        <p className="text-muted-foreground">Monitor and respond to security threats</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({mockAlerts.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="investigating">Investigating ({investigatingAlerts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {mockAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-6">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No active alerts</p>
          )}
        </TabsContent>

        <TabsContent value="investigating" className="space-y-3 mt-6">
          {investigatingAlerts.length > 0 ? (
            investigatingAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No alerts under investigation</p>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3 mt-6">
          {resolvedAlerts.length > 0 ? (
            resolvedAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No resolved alerts</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
