export type WeightUnit = "KG" | "LB";

export type WeightType = "gross" | "net";

export interface WeightReading {
  value: number;
  unit: WeightUnit;
  type: WeightType;
  isStable: boolean;
  timestamp: Date;
}

export interface WeighingDeviceConnectionOptions {
  host: string;
  port: number;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface UseRemoteWeighingDeviceReturn {
  lastConnectionError: Error | null;
  lastWeight: WeightReading | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  zero: () => Promise<void>;
  tare: () => Promise<void>;
}
