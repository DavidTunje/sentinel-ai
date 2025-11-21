import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, AlertCircle } from "lucide-react";

interface RiskMeterProps {
  score: number;
}

export function RiskMeter({ score }: RiskMeterProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: "Critical", color: "text-destructive", bg: "bg-destructive/10" };
    if (score >= 60) return { level: "High", color: "text-warning", bg: "bg-warning/10" };
    if (score >= 40) return { level: "Medium", color: "text-accent", bg: "bg-accent/10" };
    return { level: "Low", color: "text-success", bg: "bg-success/10" };
  };

  const risk = getRiskLevel(score);

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Current Risk Level</h3>
          {score >= 80 ? (
            <AlertCircle className={`h-5 w-5 ${risk.color}`} />
          ) : score >= 60 ? (
            <AlertTriangle className={`h-5 w-5 ${risk.color}`} />
          ) : (
            <Shield className={`h-5 w-5 ${risk.color}`} />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className={`text-5xl font-bold ${risk.color}`}>{score}</span>
            <span className="text-2xl text-muted-foreground mb-1">/100</span>
          </div>
          
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                score >= 80 ? 'bg-destructive' :
                score >= 60 ? 'bg-warning' :
                score >= 40 ? 'bg-accent' :
                'bg-success'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${risk.bg} ${risk.color}`}>
            {risk.level} Risk
          </div>
        </div>
      </div>
    </Card>
  );
}
