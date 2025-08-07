import { useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import type { WeightReading, WeighingDeviceConnectionOptions, UseRemoteWeighingDeviceReturn } from "./types";
import { parseWeightReading } from "./utils";
import { useConnection } from "./use-connection";

/**
 * React hook for connecting to and managing a remote T-Scale weighing device
 * through Tibbo DS1101 Serial Over IP Module
 */
export function useRemoteWeighingDevice(options: WeighingDeviceConnectionOptions): UseRemoteWeighingDeviceReturn {
  if (Capacitor.getPlatform() === "web") {
    throw new Error("Web platform not supported");
  }

  const [lastWeight, setLastWeight] = useState<WeightReading | null>(null);

  const handleData = useCallback((message: string) => {
    const weightReading = parseWeightReading(message);
    if (weightReading) {
      setLastWeight(weightReading);
    }
  }, []);

  const { isConnected, connectionStatus, lastConnectionError, sendData } = useConnection({
    host: options.host,
    port: options.port,
    onData: handleData,
  });

  const sendCommand = useCallback(
    async (command: string) => {
      if (!isConnected) {
        throw new Error("The device is not connected");
      }

      const data = new TextEncoder().encode(command + "\r\n");
      await sendData(data);
    },
    [isConnected, sendData],
  );

  const zero = useCallback(() => sendCommand("Z"), [sendCommand]);
  const tare = useCallback(() => sendCommand("T"), [sendCommand]);

  return {
    isConnected,
    connectionStatus,
    lastConnectionError,
    lastWeight,
    zero,
    tare,
  };
}
