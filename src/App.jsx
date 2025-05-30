import React, { useState, useEffect } from 'react';
import {
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const FIREBASE_URL = 'https://flood-detector-f5cae-default-rtdb.firebaseio.com';

function timestampToTime(ts) {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const DEVICE_LIST = ['esp-12e', 'esp-32a', 'sensor-node-01']; // Example device IDs

function App() {
  const [deviceId, setDeviceId] = useState('esp-12e');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when device changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`${FIREBASE_URL}/devices/${deviceId}/readings.json`);
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();

        const readings = Object.values(json || {}).map(({ timestamp, value }) => ({
          time: timestampToTime(timestamp),
          level: value / 100,
        }));

        readings.sort((a, b) => new Date(`1970-01-01T${a.time}:00`) - new Date(`1970-01-01T${b.time}:00`));

        setData(readings);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [deviceId]);

  const latestLevel = data.length ? data[data.length - 1].level : 0;

  return (
    <div style={{ backgroundColor: '#121212', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <h2>🌊 Flood Detector Dashboard</h2>

      {/* Device Selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Select Device: </label>
        <select value={deviceId} onChange={e => setDeviceId(e.target.value)}>
          {DEVICE_LIST.map(device => (
            <option key={device} value={device}>{device}</option>
          ))}
        </select>
      </div>

      {loading && <div>Loading data...</div>}
      {!loading && !data.length && <div>No sensor data available.</div>}

      {!loading && data.length > 0 && (
        <>
          <LineGraph data={data} />
          <SensorTable data={data} />
          {latestLevel >= 4 && <AlertBanner level={latestLevel} />}
        </>
      )}
    </div>
  );
}

function LineGraph({ data }) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Water turbidity',
        data: data.map(d => d.level),
        borderColor: 'blue',
        backgroundColor: 'lightblue',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#000' }
      },
      title: {
        display: true,
        text: 'Water Turbidity Over Time',
        color: '#000'
      }
    },
    scales: {
      x: {
        ticks: { color: '#000' },
        grid: { color: '#ccc' }
      },
      y: {
        ticks: { color: '#000' },
        grid: { color: '#ccc' }
      }
    }
  };

  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      padding: '1rem',
      borderRadius: '8px',
      height: '300px',
      marginBottom: '2rem'
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

function SensorTable({ data }) {
  return (
    <table style={{ width: '100%', color: 'white', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #555' }}>Time</th>
          <th style={{ borderBottom: '1px solid #555' }}>Water Turbidity</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td>{entry.time}</td>
            <td>{entry.level.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AlertBanner({ level }) {
  return (
    <div style={{
      backgroundColor: '#ff4444',
      color: '#fff',
      padding: '1rem',
      marginTop: '1rem',
      borderRadius: '5px',
      fontWeight: 'bold'
    }}>
      ⚠️ ALERT: Water particulate/silt quantity is high ({level.toFixed(2)} m)!
    </div>
  );
}

export default App;

