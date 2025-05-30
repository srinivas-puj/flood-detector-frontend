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

function App() {
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);

  return (
    <div className="App" style={{ padding: 24, maxWidth: 400, margin: '0 auto' }}>
      <h2>Flood Detector Dashboard</h2>
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
      <LineGraph data={dummyData[selectedDevice]} />
      <p style={{ marginTop: 24, color: '#555', fontSize: 13 }}>
        This is a demo graph showing water level readings for the selected ESP device.
      </p>
      <p style={{ marginTop: 16, color: '#0074D9', fontWeight: 'bold' }}>
        Contact: 9391****50
      </p>
    </div>
  );
}

export default App;