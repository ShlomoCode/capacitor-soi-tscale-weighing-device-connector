import { useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import type { WeightReading, WeighingDeviceConnectionOptions, UseRemoteWeighingDeviceReturn } from "./types";
import { parseWeightReading } from "./utils";
import { useConnection } from "./use-connection";

/**
 * React hook for connecting to and managing a remote T-Scale weighing device
 * through Tibbo DS1101 Serial Over IP Module
 */
export function useRemoteWeighingDevice(options: WeighingDeviceConnectionOptions, enabled: boolean = true): UseRemoteWeighingDeviceReturn {
  if (Capacitor.getPlatform() !== "ios" && Capacitor.getPlatform() !== "android") {
    throw new Error("[capacitor-soi-tscale-weighing-device-connector] This library only works on iOS and Android platforms");
  }

  const [lastWeight, setLastWeight] = useState<WeightReading | null>(null);

  const handleData = useCallback((message: string) => {
    if (!enabled) return;
    const weightReading = parseWeightReading(message);
    if (weightReading) {
      setLastWeight(weightReading);
    }
  }, [enabled]);

  const { isConnected, connectionStatus, lastConnectionError, sendData } = useConnection({
    host: options.host,
    port: options.port,
    onData: handleData,
  }, enabled);

  const sendCommand = useCallback(
    async (command: string) => {
      if (!enabled) {
        throw new Error("The device is disabled");
      }
      if (!isConnected) {
        throw new Error("The device is not connected");
      }

      const data = new TextEncoder().encode(command + "\r\n");
      await sendData(data);
    },
    [enabled, isConnected, sendData],
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
