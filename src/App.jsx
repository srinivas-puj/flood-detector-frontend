import { useState } from 'react';
import './App.css';

// Dummy ESP device list
const devices = [
  { id: 'esp1', name: 'ESP Device 1' },
  { id: 'esp2', name: 'ESP Device 2' },
  { id: 'esp3', name: 'ESP Device 3' },
];

// Dummy sensor data for each device (timestamp, water level)
const dummyData = {
  esp1: [
    { time: '10:00', level: 2 },
    { time: '10:10', level: 3 },
    { time: '10:20', level: 4 },
    { time: '10:30', level: 3.5 },
  ],
  esp2: [
    { time: '10:00', level: 1 },
    { time: '10:10', level: 1.5 },
    { time: '10:20', level: 2 },
    { time: '10:30', level: 2.2 },
  ],
  esp3: [
    { time: '10:00', level: 4 },
    { time: '10:10', level: 4.2 },
    { time: '10:20', level: 4.5 },
    { time: '10:30', level: 5 },
  ],
};

// Simple line graph component using SVG
function LineGraph({ data }) {
  if (!data || data.length === 0) return <div>No data</div>;

  // Normalize data for SVG
  const width = 300;
  const height = 150;
  const maxLevel = Math.max(...data.map(d => d.level));
  const minLevel = Math.min(...data.map(d => d.level));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 40) + 20;
    const y = height - 20 - ((d.level - minLevel) / (maxLevel - minLevel || 1)) * (height - 40);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ background: '#f4f8fb', borderRadius: 8 }}>
      {/* X and Y axis */}
      <line x1="20" y1={height - 20} x2={width - 20} y2={height - 20} stroke="#aaa" />
      <line x1="20" y1="20" x2="20" y2={height - 20} stroke="#aaa" />
      {/* Graph line */}
      <polyline
        fill="none"
        stroke="#0074D9"
        strokeWidth="3"
        points={points}
      />
      {/* Dots */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        const y = height - 20 - ((d.level - minLevel) / (maxLevel - minLevel || 1)) * (height - 40);
        return (
          <circle key={i} cx={x} cy={y} r="4" fill="#0074D9" />
        );
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 40) + 20;
        return (
          <text key={i} x={x} y={height - 5} fontSize="10" textAnchor="middle">{d.time}</text>
        );
      })}
      <text x="5" y="30" fontSize="10" textAnchor="start" fill="#333">Level</text>
    </svg>
  );
}

function DeviceInfo({ deviceId }) {
  // You can expand this with more info per device if needed
  const info = {
    esp1: "Located at Riverbank A. Monitors upstream water levels.",
    esp2: "Located at Bridge B. Monitors midstream water levels.",
    esp3: "Located at Village C. Monitors downstream water levels.",
  };
  return (
    <div style={{
      background: "#eaf2fb",
      borderRadius: 8,
      padding: "0.8em 1em",
      margin: "1em 0",
      fontSize: 14,
      color: "#333",
      textAlign: "left"
    }}>
      <strong>Device Info:</strong> {info[deviceId]}
    </div>
  );
}

function SensorTable({ data }) {
  return (
    <table style={{
      width: "100%",
      marginTop: "1em",
      borderCollapse: "collapse",
      fontSize: 13,
      background: "#f9fbfc",
      borderRadius: 8,
      overflow: "hidden"
    }}>
      <thead>
        <tr style={{ background: "#e3e8ee" }}>
          <th style={{ padding: "0.5em", border: "1px solid #e3e8ee" }}>Time</th>
          <th style={{ padding: "0.5em", border: "1px solid #e3e8ee" }}>Water Level</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i}>
            <td style={{ padding: "0.5em", border: "1px solid #e3e8ee" }}>{d.time}</td>
            <td style={{ padding: "0.5em", border: "1px solid #e3e8ee" }}>{d.level} m</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AlertBanner({ level }) {
  if (level >= 4.5) {
    return (
      <div style={{
        background: "#ffcccc",
        color: "#b30000",
        padding: "0.7em 1em",
        borderRadius: 8,
        margin: "1em 0",
        fontWeight: "bold"
      }}>
        ⚠️ Flood Warning: Water level is critically high!
      </div>
    );
  }
  if (level >= 4) {
    return (
      <div style={{
        background: "#fff3cd",
        color: "#856404",
        padding: "0.7em 1em",
        borderRadius: 8,
        margin: "1em 0",
        fontWeight: "bold"
      }}>
        ⚠️ Alert: Water level is rising. Stay alert!
      </div>
    );
  }
  return null;
}

function App() {
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);
  const currentData = dummyData[selectedDevice];
  const latestLevel = currentData[currentData.length - 1].level;

  return (
    <div className="App" style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h2>Flood Detector Dashboard</h2>
      <p style={{ color: "#444", marginBottom: 12 }}>
        IoT-based early warning system for real-time flood monitoring.
      </p>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="device-select">Select ESP Device: </label>
        <select
          id="device-select"
          value={selectedDevice}
          onChange={e => setSelectedDevice(e.target.value)}
        >
          {devices.map(device => (
            <option key={device.id} value={device.id}>{device.name}</option>
          ))}
        </select>
      </div>
      <DeviceInfo deviceId={selectedDevice} />
      <AlertBanner level={latestLevel} />
      <LineGraph data={currentData} />
      <SensorTable data={currentData} />
      <p style={{ marginTop: 24, color: '#555', fontSize: 13 }}>
        This is a demo graph showing water level readings for the selected ESP device.
      </p>
      <div style={{
        marginTop: 20,
        padding: "0.7em 1em",
        background: "#eafbe7",
        borderRadius: 8,
        color: "#1a7f37",
        fontWeight: "bold"
      }}>
        Emergency Contact: 9391****50
      </div>
      <footer style={{ marginTop: 32, fontSize: 12, color: "#aaa" }}>
        &copy; {new Date().getFullYear()} IoT Flood Detection Mini Project
      </footer>
    </div>
  );
}

export default App;