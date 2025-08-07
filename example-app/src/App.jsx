import { useRemoteWeighingDevice } from "capacitor-soi-tscale-weighing-device-connector";

function App() {
  const { lastWeight, lastConnectionError, zero, tare, connectionStatus } = useRemoteWeighingDevice({
    host: "192.168.10.95",
    port: 1001,
  });

  return (
    <div className="app">
      <h1>משקל בזמן אמת</h1>

      {connectionStatus}

      {lastConnectionError && <div className="error">{lastConnectionError.message}</div>}

      <div className={`weight-display ${lastWeight?.isStable ? 'stable' : ''}`}>
        {lastWeight ? (
          <>
            <div className="weight-value">{lastWeight.value.toFixed(2)}</div>
            <div className="weight-unit">
              {lastWeight.unit} ({lastWeight.type})
            </div>
          </>
        ) : (
          <div className="weight-value">--.--</div>
        )}
      </div>

      <div className="controls">
        <button onClick={zero}>איפוס</button>
        <button onClick={tare}>קיזוז</button>
      </div>
    </div>
  );
}

export default App;
