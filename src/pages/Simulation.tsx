import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Play, Square, Activity } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Simulation() {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const startSimulation = () => {
    setIsRunning(true);
    toast({
      title: "Simulation Started",
      description: "AI attacker vs defender scenario is now running",
    });
    
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Simulation Complete",
        description: "Red team scenario finished. Review results below.",
      });
    }, 5000);
  };

  const scenarios = [
    {
      name: "Brute Force Attack",
      status: "completed",
      result: "Defender Win",
      duration: "2m 34s",
      blocked: true
    },
    {
      name: "SQL Injection Chain",
      status: "completed",
      result: "Defender Win",
      duration: "1m 12s",
      blocked: true
    },
    {
      name: "Privilege Escalation",
      status: isRunning ? "running" : "pending",
      result: isRunning ? "In Progress" : "Not Started",
      duration: isRunning ? "0m 45s" : "-",
      blocked: false
    },
    {
      name: "Data Exfiltration",
      status: "pending",
      result: "Not Started",
      duration: "-",
      blocked: false
    }
  ];

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

        <div className="flex gap-3">
          <Button 
            onClick={startSimulation} 
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Start New Simulation
          </Button>
          <Button 
            variant="outline" 
            disabled={!isRunning}
            onClick={() => setIsRunning(false)}
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </Card>

      {/* Scenarios */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Simulation Scenarios</h3>
        <div className="space-y-3">
          {scenarios.map((scenario, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{scenario.name}</h4>
                    <Badge 
                      variant={
                        scenario.status === "completed" ? "secondary" :
                        scenario.status === "running" ? "destructive" :
                        "outline"
                      }
                    >
                      {scenario.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Result: <span className={scenario.blocked ? "text-success" : "text-foreground"}>{scenario.result}</span></span>
                    <span>Duration: {scenario.duration}</span>
                    {scenario.blocked && (
                      <span className="text-success">✓ Blocked by AI Defender</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Simulation Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Live Simulation Log</h3>
        <div className="bg-secondary rounded-lg p-4 font-mono text-sm space-y-1">
          <p className="text-success">[INFO] Simulation engine initialized</p>
          <p className="text-primary">[SIM] Red team AI agent spawned</p>
          <p className="text-primary">[SIM] Blue team defender active</p>
          <p className="text-warning">[ATTACK] Brute force attempt on /admin/login</p>
          <p className="text-accent">[DEFENSE] Rate limiting triggered</p>
          <p className="text-success">[BLOCKED] Attack neutralized - IP blacklisted</p>
          {isRunning && (
            <>
              <p className="text-warning animate-pulse">[ATTACK] Privilege escalation in progress...</p>
              <p className="text-accent animate-pulse">[DEFENSE] Analyzing attack pattern...</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
