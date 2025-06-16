import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { AlertTriangle, Droplets, Wifi, WifiOff, Activity } from "lucide-react";
import './App.css';
// --- Animated Water Background CSS ---
const waterBgStyle = {
  position: 'fixed',
  zIndex: 0,
  left: 0,
  top: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  pointerEvents: 'none',
};

const waveStyle = (delay, opacity, bottom, color) => ({
  position: 'absolute',
  left: 0,
  width: '200%',
  height: '180px',
  bottom,
  background: color,
  opacity,
  borderRadius: '43%',
  animation: `waveMove 8s cubic-bezier(.36,.45,.63,.53) infinite`,
  animationDelay: delay,
  filter: 'blur(1px)',
});

const styleSheet = `
@keyframes waveMove {
  0% { transform: translateX(0) scaleY(1);}
  50% { transform: translateX(-25%) scaleY(1.04);}
  100% { transform: translateX(0) scaleY(1);}
}
`;

const FIREBASE_URL = "https://flood-detector-f5cae-default-rtdb.firebaseio.com";

function timestampToTime(ts) {
  const date = new Date(ts * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const DEVICE_LIST = [
  { id: "esp-12e", name: "ESP-12E Main Sensor", location: "River Junction A" },
  { id: "esp-32a", name: "ESP-32A Secondary", location: "Bridge Monitoring Point" },
  { id: "sensor-node-01", name: "Sensor Node Alpha", location: "Upstream Station" },
];

// UpdatedTable Component
function UpdatedTable({ data }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-700 p-6 shadow-2xl mt-12">
      <h3 className="text-xl font-semibold text-gray-100 mb-4">
        Recent Readings
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                Time
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                Turbidity (NTU)
              </th>
              <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                Safety
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(-10).reverse().map((entry, index) => {
              const entryAlert = entry.level >= 4 ? "critical" : entry.level >= 2.5 ? "warning" : "normal";

              return (
                <tr
                    key={index}
                    className="border-b border-gray-700 last:border-none hover:bg-gray-800/20 transition-colors duration-300">
                    <td className="py-3 px-4 text-gray-300">
                    {entry.time}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-50">
                    {entry.level.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        entryAlert === "critical"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : entryAlert === "warning"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-green-500/20 text-green-300 border border-green-500/30"
                        }`}
                    >
                        {entryAlert.toUpperCase()}
                    </span>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  const [deviceId, setDeviceId] = useState("esp-12e");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Inject animation style once
  useEffect(() => {
    if (!document.getElementById('water-anim-style')) {
      const style = document.createElement('style');
      style.id = 'water-anim-style';
      style.innerHTML = styleSheet;
      document.head.appendChild(style);
    }
  }, []);

  // Simulating Connection
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1);
      setLastUpdate(new Date()); // Update timestamp
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Loading data from Firebase
  useEffect(() => {
    async function fetchData(id) {
      setLoading(true);
      try {
        const res = await fetch(
          `${FIREBASE_URL}/devices/${id}/readings.json`
        );
        if (!res.ok) throw new Error("Network response was not ok");

        const json = await res.json();

        const readings = Object.values(json || {}).map(
          ({ timestamp, value }) => ({
            time: timestampToTime(timestamp),
            level: value / 100,
            timestamp,
          })
        );

        readings.sort((a, b) => a.timestamp - b.timestamp);
        setData(readings);
      } catch (error) {
        console.error(error);
        setData([]);
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData(deviceId);
  }, [deviceId]);

  const latestLevel = data.length ? data[data.length - 1].level : 0;

  const selectedDevice = DEVICE_LIST.find((d) => d.id === deviceId);
  const alertLevel = latestLevel >= 4 ? "critical" : latestLevel >= 2.5 ? "warning" : "normal";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4 relative">
      {/* Animated Water Background */}
      <div style={waterBgStyle} aria-hidden="true">
        <div style={waveStyle('0s', 0.18, 0, 'linear-gradient(90deg,#60a5fa 0%,#38bdf8 100%)')} />
        <div style={waveStyle('-2s', 0.13, 40, 'linear-gradient(90deg,#2563eb 0%,#0ea5e9 100%)')} />
        <div style={waveStyle('-4s', 0.10, 80, 'linear-gradient(90deg,#1e3a8a 0%,#0ea5e9 100%)')} />
      </div>

      {/* Background radial gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.2),transparent)] z-0" />

      {/* SVG texture background*/}
      <div
        className='fixed inset-0 pointer-events-none z-0'
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>
      <div className="flex items-center justify-center">
  <div className="w-full max-w-7xl relative z-10">
    {/* App content here */}
  </div>
</div>


      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section*/}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full shadow-lg">
              <Droplets className="w-8 h-8 text-gray-50" />
            </div>
            <h1 className="text-5xl font-semibold bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              FloodGuard Pro
            </h1>
          </div>
          <p className="text-gray-300">Advanced IoT Flood Detection & Early Warning System</p>
        </header>

        {/* Connection & Device Section*/}
        <section className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl mb-12">
          <div className="flex items-center gap-4">
            {/* Connection Indicator*/}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}

              <span
                className={`text-sm font-semibold ${
                    isOnline ? "text-green-400" : "text-red-500"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Last Update*/}
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>

            {/* Alert Indicator*/}
            <div
              className={`px-3 py-1 rounded-full font-semibold ${
                alertLevel === "critical"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : alertLevel === "warning"
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-green-500/20 text-green-300 border border-green-500/30"
              }`}
            >
              {alertLevel.toUpperCase()}
            </div>
          </div>

          {/* Device Buttons*/}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {DEVICE_LIST.map((item) => (
              <button
                key={item.id}
                onClick={() => setDeviceId(item.id)}
                disabled={loading}
                className={`p-4 rounded-xl transition transform ${
                    item.id === deviceId
                        ? "bg-blue-500/30 border-blue-400/50 shadow-blue-500/25 translate-y-[-2px]"
                        : "bg-gray-900/60 border-gray-700 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-gray-900/30"
                } border`}
              >
                <h4 className="text-gray-100 font-semibold">
                    {item.name}
                </h4>
                <p className="text-gray-400 mt-1">
                    Location: {item.location}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Chart Section*/}
        <section className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl">
          <h3 className="text-2xl font-semibold text-gray-100 mb-6">
            Water Turbidity Analysis
          </h3>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mr-4"></div>
              <span className="text-gray-300">Fetching data...</span>
            </div>
          ) : data.length == 0 ? (
            <div className="flex items-center justify-center p-20">
              <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
              <span className="text-gray-400">
                No sensor data available.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={data}>
                <defs>
                    <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "1px solid #3B82F6" }}
                />
                <Area
                    type="monotone"
                    dataKey="level"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#gradFill)"
                    fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

        </section>

        {/* Currently Alert Section*/}
        <section className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl mt-12">
          <h4 className="text-gray-100 font-semibold">Current Turbidity</h4>
          <div className="text-4xl font-semibold mt-2">
            {latestLevel.toFixed(2)} NTU
          </div>
          <p className="text-gray-400 mt-1">
            Location: {selectedDevice?.location}
          </p>
        </section>

        {/* UpdatedTable Section*/}
        <UpdatedTable data={data} />

        {/* Contact Section*/}
        <section className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-gray-700 shadow-2xl mt-12">
          <h4 className="text-gray-100 font-semibold">Emergency Contact</h4>
          <div className="text-2xl font-semibold mt-2">
            9391****50
          </div>
          <p className="text-gray-400 mt-1">
            24/7 Emergency Response
          </p>
        </section>

        {/* Footer Section*/}
        <footer className="text-center mt-12 text-gray-500">
          &copy; {new Date().getFullYear()} FloodGuard Pro
        </footer>

      </div>
    </div>
  );
}

export default App;