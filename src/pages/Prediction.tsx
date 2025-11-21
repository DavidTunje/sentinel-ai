import { Card } from "@/components/ui/card";
import { GitBranch, Zap, Shield, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { api, subscribeToPredictions } from "@/lib/api";
import type { Prediction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function Prediction() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictions();

    const channel = subscribeToPredictions((newPrediction) => {
      setPredictions(prev => [newPrediction, ...prev]);
      toast({
        title: 'New Prediction',
        description: newPrediction.step,
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const loadPredictions = async () => {
    try {
      const data = await api.getPredictions();
      setPredictions(data);
    } catch (error) {
      console.error('Error loading predictions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load predictions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <p className="text-muted-foreground">Loading predictions...</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Attack Path Prediction</h1>
        <p className="text-muted-foreground">AI-powered next-step attack prediction using graph neural networks</p>
      </div>

      {/* Attack Graph Visualization */}
      <Card className="p-8 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Predicted Attack Path</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <p className="text-sm font-medium text-foreground">Initial Breach</p>
            <p className="text-xs text-muted-foreground">Honeypot Login</p>
          </div>

          <div className="hidden md:block">
            <div className="w-16 h-0.5 bg-gradient-to-r from-destructive to-warning" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-warning/20 border-2 border-warning flex items-center justify-center animate-pulse-glow">
              <Zap className="h-10 w-10 text-warning" />
            </div>
            <p className="text-sm font-medium text-foreground">Current</p>
            <p className="text-xs text-muted-foreground">Reconnaissance</p>
          </div>

          <div className="hidden md:block">
            <div className="w-16 h-0.5 bg-gradient-to-r from-warning to-accent" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center">
              <GitBranch className="h-10 w-10 text-accent" />
            </div>
            <p className="text-sm font-medium text-accent">Predicted Next</p>
            <p className="text-xs text-muted-foreground">
              {predictions[0]?.step.substring(0, 20) || 'Analyzing...'}
            </p>
          </div>

          <div className="hidden md:block">
            <div className="w-16 h-0.5 bg-gradient-to-r from-accent to-primary opacity-50" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center opacity-50">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground opacity-50">Prevented</p>
            <p className="text-xs text-muted-foreground opacity-50">Data Breach</p>
          </div>
        </div>
      </Card>

      {/* Prediction Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Detailed Predictions</h3>
        {predictions.length > 0 ? (
          predictions.map((prediction) => (
            <Card key={prediction.id} className="p-6 border-l-4 border-l-accent">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">{prediction.step}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Confidence Level</p>
                        <div className="flex items-center gap-3">
                          <Progress value={prediction.confidence} className="flex-1" />
                          <span className="text-sm font-bold text-accent">{prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Impact Assessment</p>
                    <p className="text-sm text-foreground">{prediction.impact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Prevention</p>
                    <p className="text-sm text-foreground">{prediction.prevention}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No predictions available yet</p>
          </Card>
        )}
      </div>
    </div>
  );
}
