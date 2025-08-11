# Capacitor T-Scale Weighing Device Connector (Serial over IP)

React hooks for connecting to T-Scale weighing devices through the Tibbo DS1101 Serial Over IP module in Capacitor applications.

## Usage

```javascript
import { useRemoteWeighingDevice } from "capacitor-soi-tscale-weighing-device-connector";

function WeighingComponent() {
  const { lastWeight, connectionStatus, isConnected, zero, tare } = useRemoteWeighingDevice({
    host: "192.168.10.95",
    port: 1001,
  });

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>
        Weight: {lastWeight?.value} {lastWeight?.unit}
      </p>
      <button onClick={zero} disabled={!isConnected}>
        Zero
      </button>
      <button onClick={tare} disabled={!isConnected}>
        Tare
      </button>
    </div>
  );
}
```

## Configuration

[Configure](../../wiki) your Tibbo DS1101 and connect your T-Scale device to the tibbo module via a serial connection. Test the connectivity with:
 
```bash
telnet 192.168.10.95 1001
```

## Run Example App

Update the IP address and port in the example app, then run:

```bash
cd example-app && npm install && npm run build && npm run run:ios
```
