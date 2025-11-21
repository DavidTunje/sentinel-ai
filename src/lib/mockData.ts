export interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  status: "active" | "investigating" | "resolved";
}

export interface HoneypotLog {
  id: string;
  ip: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  pattern: string;
  threat_score: number;
}

export interface Prediction {
  step: string;
  confidence: number;
  impact: string;
  prevention: string;
}

export interface SystemStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
}

export const mockAlerts: Alert[] = [
  {
    id: "1",
    severity: "critical",
    title: "Brute Force Attack Detected",
    description: "Multiple failed login attempts from IP 192.168.1.45",
    timestamp: new Date(Date.now() - 5 * 60000),
    source: "Honeypot Login Portal",
    status: "active"
  },
  {
    id: "2",
    severity: "high",
    title: "SQL Injection Attempt",
    description: "Malicious SQL query detected on /api/users endpoint",
    timestamp: new Date(Date.now() - 15 * 60000),
    source: "Honeypot API",
    status: "investigating"
  },
  {
    id: "3",
    severity: "medium",
    title: "Suspicious Port Scan",
    description: "Sequential port scanning detected from 10.0.0.23",
    timestamp: new Date(Date.now() - 30 * 60000),
    source: "Network Monitor",
    status: "investigating"
  },
  {
    id: "4",
    severity: "high",
    title: "Privilege Escalation Attempt",
    description: "Unauthorized access to admin endpoints",
    timestamp: new Date(Date.now() - 45 * 60000),
    source: "Honeypot Admin Panel",
    status: "resolved"
  }
];

export const mockHoneypotLogs: HoneypotLog[] = [
  {
    id: "1",
    ip: "192.168.1.45",
    endpoint: "/admin/login",
    method: "POST",
    timestamp: new Date(Date.now() - 2 * 60000),
    pattern: "Brute Force",
    threat_score: 95
  },
  {
    id: "2",
    ip: "10.0.0.23",
    endpoint: "/api/users?id=1 OR 1=1",
    method: "GET",
    timestamp: new Date(Date.now() - 10 * 60000),
    pattern: "SQL Injection",
    threat_score: 88
  },
  {
    id: "3",
    ip: "172.16.0.5",
    endpoint: "/api/admin/delete",
    method: "DELETE",
    timestamp: new Date(Date.now() - 20 * 60000),
    pattern: "Privilege Escalation",
    threat_score: 92
  },
  {
    id: "4",
    ip: "192.168.1.45",
    endpoint: "/db/dump",
    method: "GET",
    timestamp: new Date(Date.now() - 35 * 60000),
    pattern: "Data Exfiltration",
    threat_score: 85
  }
];

export const mockPredictions: Prediction[] = [
  {
    step: "Lateral Movement to Database Server",
    confidence: 87,
    impact: "Critical - Potential data breach",
    prevention: "Isolate database server, revoke suspicious credentials"
  },
  {
    step: "Privilege Escalation via Admin Panel",
    confidence: 72,
    impact: "High - System compromise",
    prevention: "Enable MFA on admin accounts, audit user permissions"
  },
  {
    step: "Data Exfiltration through API",
    confidence: 65,
    impact: "Critical - Sensitive data leak",
    prevention: "Rate limit API endpoints, enable DLP monitoring"
  }
];

export const mockSystemStatus: SystemStatus[] = [
  { name: "Honeypot Network", status: "operational", uptime: 99.9 },
  { name: "Prediction Engine", status: "operational", uptime: 99.7 },
  { name: "Data Fusion", status: "operational", uptime: 99.5 },
  { name: "Prevention System", status: "degraded", uptime: 97.2 }
];

export const threatTimelineData = [
  { time: "00:00", threats: 12 },
  { time: "04:00", threats: 8 },
  { time: "08:00", threats: 23 },
  { time: "12:00", threats: 45 },
  { time: "16:00", threats: 67 },
  { time: "20:00", threats: 34 },
  { time: "23:59", threats: 28 }
];

export const attackTypesData = [
  { name: "Brute Force", value: 35 },
  { name: "SQL Injection", value: 25 },
  { name: "XSS", value: 15 },
  { name: "DDoS", value: 12 },
  { name: "Phishing", value: 8 },
  { name: "Other", value: 5 }
];
