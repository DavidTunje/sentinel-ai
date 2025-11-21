import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert } from "@/lib/mockData";

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" };
      case "high":
        return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" };
      case "medium":
        return { icon: AlertTriangle, color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" };
      default:
        return { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
    }
  };

  const config = getSeverityConfig(alert.severity);
  const Icon = config.icon;

  return (
    <Card className={`p-4 border-l-4 ${config.border} hover:bg-card/80 transition-colors`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground">{alert.title}</h4>
            <Badge variant={alert.status === "active" ? "destructive" : alert.status === "investigating" ? "default" : "secondary"}>
              {alert.status}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{alert.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{alert.source}</span>
            <span>•</span>
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
