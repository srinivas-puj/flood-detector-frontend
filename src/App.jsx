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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbfc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="App"
        style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 32px #b6d6f6',
          padding: '2.5rem 2rem',
          maxWidth: 600,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <h2 style={{ color: "#0057b8", marginBottom: 8, fontWeight: 700, fontSize: 32, letterSpacing: 1 }}>
          Flood Detector Dashboard
        </h2>
        <p style={{ color: "#444", marginBottom: 24, fontSize: 16 }}>
          IoT-based early warning system for real-time flood monitoring.
        </p>

        {/* Device Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ color: "#0057b8", fontWeight: 600, fontSize: 16, marginRight: 8 }}>
            Select Device:
          </label>
          <select
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            style={{
              background: "#f4f8fb",
              border: "1px solid #0057b8",
              borderRadius: 6,
              color: "#0057b8",
              padding: "0.5em 1.2em",
              fontSize: 16,
              fontWeight: 500
            }}
          >
            {DEVICE_LIST.map(device => (
              <option key={device} value={device}>{device}</option>
            ))}
          </select>
        </div>

        {loading && <div style={{ fontSize: 18, color: "#0057b8", margin: "2rem 0" }}>Loading data...</div>}
        {!loading && !data.length && <div style={{ fontSize: 18, color: "#b30000", margin: "2rem 0" }}>No sensor data available.</div>}

        {!loading && data.length > 0 && (
          <>
            <LineGraph data={data} />
            <SensorTable data={data} />
            {latestLevel >= 4 && <AlertBanner level={latestLevel} />}
          </>
        )}

        <div style={{
          marginTop: 28,
          padding: "0.9em 1.2em",
          background: "#eafbe7",
          borderRadius: 8,
          color: "#1a7f37",
          fontWeight: "bold",
          fontSize: 16
        }}>
          Emergency Contact: 9391****50
        </div>
        <footer style={{ marginTop: 32, fontSize: 13, color: "#0057b8" }}>
          &copy; {new Date().getFullYear()} IoT Flood Detection Mini Project
        </footer>
      </div>
    </div>
  );
}

function LineGraph({ data }) {
  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        label: 'Water Turbidity',
        data: data.map(d => d.level),
        borderColor: '#0074D9',
        backgroundColor: 'rgba(0, 116, 217, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#0057b8', font: { size: 16, weight: 600 } }
      },
      title: {
        display: true,
        text: 'Water Turbidity Over Time',
        color: '#0057b8',
        font: { size: 20, weight: 700 }
      }
    },
    scales: {
      x: {
        ticks: { color: '#0057b8', font: { size: 14 } },
        grid: { color: '#e3e8ee' }
      },
      y: {
        ticks: { color: '#0057b8', font: { size: 14 } },
        grid: { color: '#e3e8ee' }
      }
    }
  };

  return (
    <div style={{
      backgroundColor: '#f4f8fb',
      padding: '1.5rem 1rem',
      borderRadius: '12px',
      height: '400px',
      marginBottom: '2.5rem',
      boxShadow: '0 2px 12px #e3e8ee'
    }}>
      <Line data={chartData} options={options} height={350} />
    </div>
  );
}

function SensorTable({ data }) {
  return (
    <table style={{
      width: '100%',
      marginTop: '1em',
      borderCollapse: 'collapse',
      fontSize: 15,
      background: "#f9fbfc",
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: '0 1px 6px #e3e8ee'
    }}>
      <thead>
        <tr style={{ background: "#e3e8ee" }}>
          <th style={{ padding: "0.7em", border: "1px solid #e3e8ee", color: "#0057b8", fontWeight: 700 }}>Time</th>
          <th style={{ padding: "0.7em", border: "1px solid #e3e8ee", color: "#0057b8", fontWeight: 700 }}>Water Turbidity</th>
        </tr>
      </thead>
      <tbody>
        {data.map((entry, index) => (
          <tr key={index}>
            <td style={{ padding: "0.7em", border: "1px solid #e3e8ee", color: "#222" }}>{entry.time}</td>
            <td style={{ padding: "0.7em", border: "1px solid #e3e8ee", color: "#222" }}>{entry.level.toFixed(2)}</td>
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
      padding: '1.2rem',
      marginTop: '1.5rem',
      borderRadius: '8px',
      fontWeight: 'bold',
      fontSize: 18,
      boxShadow: '0 2px 8px #ffcccc'
    }}>
      ⚠️ ALERT: Water particulate/silt quantity is high ({level.toFixed(2)} m)!
    </div>
  );
}

export default App;