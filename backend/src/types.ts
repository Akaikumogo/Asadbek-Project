export type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export type PumpMode = 'Primary' | 'Secondary' | 'Parallel';
export type PumpRole = 'PRIMARY' | 'SECONDARY' | 'PARALLEL';

export interface Device {
  id: string;
  name: string;
  site?: string;
  apiKey?: string;
  connected?: boolean;
  wifiSsid?: string;
  rssi?: number;
  ip?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pump {
  id: string;
  deviceId: string;
  name: string;
  role: PumpRole;
  mode: PumpMode;
  on: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetricSample {
  deviceId: string;
  pumpId?: string;
  ts: number;
  water_flow_lpm?: number;
  power_w?: number;
  energy_kwh?: number;
  runtime_s?: number;
}

export interface ScheduleRule {
  id: string;
  deviceId: string;
  pumpId?: string;
  cron: string;
  enabled: boolean;
  duration_s?: number;
}


