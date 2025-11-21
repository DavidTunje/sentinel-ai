import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockHoneypotLogs } from "@/lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Honeypot() {
  const getThreatColor = (score: number) => {
    if (score >= 90) return "text-destructive";
    if (score >= 70) return "text-warning";
    return "text-accent";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Honeypot Logs</h1>
        <p className="text-muted-foreground">Track attacker interactions with decoy systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Total Interactions</p>
          <p className="text-3xl font-bold text-primary mt-1">{mockHoneypotLogs.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Unique IPs</p>
          <p className="text-3xl font-bold text-accent mt-1">
            {new Set(mockHoneypotLogs.map(log => log.ip)).size}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Avg Threat Score</p>
          <p className="text-3xl font-bold text-warning mt-1">
            {Math.round(mockHoneypotLogs.reduce((acc, log) => acc + log.threat_score, 0) / mockHoneypotLogs.length)}
          </p>
        </Card>
      </div>

      <Card>
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
            {mockHoneypotLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                <TableCell className="font-mono text-sm text-primary">{log.endpoint}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.method}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">{log.pattern}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-bold ${getThreatColor(log.threat_score)}`}>
                    {log.threat_score}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
