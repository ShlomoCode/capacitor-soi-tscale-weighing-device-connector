import { useCallback, useEffect, useRef, useState } from "react";
import { Socket } from "@spryrocks/capacitor-socket-connection-plugin";
import type { ConnectionStatus, WeighingDeviceConnectionOptions } from "./types";

const RETRY_INTERVAL = 3000;

export interface UseConnectionOptions extends WeighingDeviceConnectionOptions {
  onData?: (message: string) => void;
}

export interface UseConnectionReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastConnectionError: Error | null;
  sendData: (data: Uint8Array) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

/**
 * React hook for managing socket connections to remote devices
 * Handles connection lifecycle, reconnection logic, and data streaming
 */
export function useConnection(options: UseConnectionOptions): UseConnectionReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [lastConnectionError, setLastConnectionError] = useState<Error | null>(null);

  const isConnected = connectionStatus === "connected";

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataBufferRef = useRef<string>("");

  const connect = useCallback(async () => {
    if (socketRef.current) {
      await socketRef.current.close();
    }

    const socket = new Socket();
    socketRef.current = socket;

    socket.onData = (data: Uint8Array) => {
      const decoder = new TextDecoder("utf-8");
      const chunk = decoder.decode(data, { stream: true });

      dataBufferRef.current += chunk;

      const lines = dataBufferRef.current.split("\r\n");
      dataBufferRef.current = lines.pop() || "";

      lines.forEach((line) => {
        if (line.trim()) {
          options.onData?.(line);
        }
      });
    };

    socket.onClose = () => {
      handleUnexpectedDisconnection();
    };

    socket.onError = (error) => {
      handleConnectionError(error as Error);
    };

    try {
      setConnectionStatus("connecting");
      await socket.open(options.host, options.port);
      setConnectionStatus("connected");
      setLastConnectionError(null);
    } catch (err) {
      handleConnectionError(err as Error);
    }
  }, [options.host, options.port, options.onData]);

  const handleConnectionError = useCallback(
    (connectionError: Error) => {
      setLastConnectionError(connectionError);
      setConnectionStatus("reconnecting");
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, RETRY_INTERVAL);
    },
    [connect],
  );

  const handleUnexpectedDisconnection = useCallback(() => {
    setConnectionStatus("reconnecting");
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, RETRY_INTERVAL);
  }, [connect]);

  const sendData = useCallback(
    async (data: Uint8Array) => {
      if (!socketRef.current || !isConnected) {
        throw new Error("Socket is not connected");
      }
      await socketRef.current.write(data);
    },
    [isConnected],
  );

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      await socketRef.current.close();
      socketRef.current = null;
    }

    dataBufferRef.current = "";
    setConnectionStatus("disconnected");
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastConnectionError,
    sendData,
    connect,
    disconnect,
  };
}
