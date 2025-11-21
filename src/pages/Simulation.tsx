import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Play, Square, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, subscribeToSimulations } from "@/lib/api";
import type { Simulation } from "@/lib/types";

const SCENARIOS = [
  { name: 'Brute Force Attack' },
  { name: 'SQL Injection Chain' },
  { name: 'Privilege Escalation' },
  { name: 'Data Exfiltration' },
];

export default function Simulation() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningScenario, setRunningScenario] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSimulations();

    const channel = subscribeToSimulations((simulation) => {
      setSimulations(prev => {
        const index = prev.findIndex(s => s.id === simulation.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = simulation;
          return updated;
        }
        return [simulation, ...prev];
      });

      if (simulation.status === 'completed') {
        setIsRunning(false);
        setRunningScenario(null);
        toast({
          title: 'Simulation Complete',
          description: `${simulation.name} finished. Result: ${simulation.result}`,
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [toast]);

  const loadSimulations = async () => {
    try {
      const data = await api.getSimulations();
      setSimulations(data);
    } catch (error) {
      console.error('Error loading simulations:', error);
    }
  };

  const startSimulation = async (scenarioName: string) => {
    setIsRunning(true);
    setRunningScenario(scenarioName);
    
    toast({
      title: 'Simulation Started',
      description: `Running ${scenarioName} scenario`,
    });

    try {
      await api.runSimulation(scenarioName);
    } catch (error) {
      console.error('Error running simulation:', error);
      setIsRunning(false);
      setRunningScenario(null);
      toast({
        title: 'Simulation Failed',
        description: 'Failed to run simulation',
        variant: 'destructive',
      });
    }
  };

  const getScenarioStatus = (scenarioName: string) => {
    const sim = simulations.find(s => s.name === scenarioName);
    if (!sim) return null;
    return sim;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Attacker Simulation</h1>
        <p className="text-muted-foreground">Red team vs blue team AI-powered scenarios</p>
      </div>

      {/* Control Panel */}
      <Card className="p-6 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crosshair className="h-6 w-6 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Simulation Control</h2>
          </div>
          {isRunning && (
            <Badge variant="destructive" className="animate-pulse-glow">
              <Activity className="h-3 w-3 mr-1" />
              Running
            </Badge>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          {SCENARIOS.map((scenario) => (
            <Button 
              key={scenario.name}
              onClick={() => startSimulation(scenario.name)} 
              disabled={isRunning}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="h-4 w-4 mr-2" />
              Run {scenario.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Scenarios */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Simulation Scenarios</h3>
        <div className="space-y-3">
          {SCENARIOS.map((scenario) => {
            const sim = getScenarioStatus(scenario.name);
            const isCurrentlyRunning = runningScenario === scenario.name;
            
            return (
              <Card key={scenario.name} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">{scenario.name}</h4>
                      <Badge 
                        variant={
                          sim?.status === 'completed' ? 'secondary' :
                          isCurrentlyRunning ? 'destructive' :
                          'outline'
                        }
                      >
                        {isCurrentlyRunning ? 'running' : sim?.status || 'ready'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Result: <span className={sim?.blocked ? 'text-success' : 'text-foreground'}>
                        {sim?.result || 'Not Started'}
                      </span></span>
                      <span>Duration: {sim?.duration || '-'}</span>
                      {sim?.blocked && (
                        <span className="text-success">✓ Blocked by AI Defender</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simulation Logs */}
      {simulations.length > 0 && simulations[0].logs && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Latest Simulation Log</h3>
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
            {simulations[0].logs.map((log, i) => {
              const color = log.includes('[ATTACK]') ? 'text-warning' :
                           log.includes('[DEFENSE]') || log.includes('[BLOCKED]') ? 'text-accent' :
                           log.includes('[SUCCESS]') ? 'text-success' :
                           log.includes('[INFO]') || log.includes('[SIM]') ? 'text-primary' :
                           'text-foreground';
              return (
                <p key={i} className={color}>{log}</p>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
