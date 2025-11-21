import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { api, subscribeToHoneypotEvents } from "@/lib/api";
import { HoneypotEvent } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Honeypot() {
  const [events, setEvents] = useState<HoneypotEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();

    const channel = subscribeToHoneypotEvents((newEvent) => {
      setEvents(prev => [newEvent, ...prev]);
      if (newEvent.threat_score > 80) {
        toast({
          title: 'High Threat Detected',
          description: `${newEvent.pattern} from ${newEvent.ip_address}`,
          variant: 'destructive',
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const loadEvents = async () => {
    try {
      const data = await api.getHoneypotEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error loading honeypot events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load honeypot events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (score: number) => {
    if (score >= 90) return "text-destructive";
    if (score >= 70) return "text-warning";
    return "text-accent";
  };

  const uniqueIPs = new Set(events.map(e => e.ip_address)).size;
  const avgThreatScore = events.length > 0
    ? Math.round(events.reduce((acc, e) => acc + e.threat_score, 0) / events.length)
    : 0;

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Loading honeypot data...</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Honeypot Logs</h1>
        <p className="text-muted-foreground">Track attacker interactions with decoy systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Interactions</p>
          <p className="text-3xl font-bold text-primary mt-1">{events.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Unique IPs</p>
          <p className="text-3xl font-bold text-accent mt-1">{uniqueIPs}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg Threat Score</p>
          <p className="text-3xl font-bold text-warning mt-1">{avgThreatScore}</p>
        </Card>
      </div>

      <Card>
        {events.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Pattern</TableHead>
                <TableHead className="text-right">Threat Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{event.ip_address}</TableCell>
                  <TableCell className="font-mono text-sm text-primary">{event.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{event.pattern || 'Unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-bold ${getThreatColor(event.threat_score)}`}>
                      {event.threat_score}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No honeypot interactions yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}
