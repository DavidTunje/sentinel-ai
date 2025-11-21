import { AlertCard } from "@/components/AlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { api, subscribeToAlerts } from "@/lib/api";
import { Alert } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();

    const channel = subscribeToAlerts((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      toast({
        title: `New Alert: ${newAlert.severity.toUpperCase()}`,
        description: newAlert.title,
        variant: newAlert.severity === 'critical' ? 'destructive' : 'default',
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === "active");
  const investigatingAlerts = alerts.filter(a => a.status === "investigating");
  const resolvedAlerts = alerts.filter(a => a.status === "resolved");

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Loading alerts...</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Security Alerts</h1>
        <p className="text-muted-foreground">Monitor and respond to security threats</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="investigating">Investigating ({investigatingAlerts.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-6">
          {alerts.length > 0 ? (
            alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
          ) : (
            <p className="text-muted-foreground text-center py-8">No alerts found</p>
          )}
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
