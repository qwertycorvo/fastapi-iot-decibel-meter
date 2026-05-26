import React, { useEffect, useState } from 'react';
import '../styles/dashboard.css';
import * as api from '../api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


const Dashboard = ({ stats, violations, devices = [], updateStats }) => {
  const [alert] = useState(false);
  const [dbValue, setDbValue] = useState(48);
  const [loadLevel, setLoadLevel] = useState('Low');
  const [history, setHistory] = useState([]); // keep last 50 points for chart
  const [prediction, setPrediction] = useState(null);
  const mapPositions = [
  { x: 14, y: 26 },
  { x: 38, y: 18 },
  { x: 62, y: 28 },
  { x: 78, y: 46 },
  { x: 52, y: 62 },
  { x: 26, y: 64 },
];
const fallbackSensors = [
  { id: 'SEN-01', location: 'Centrio Mall' },
  { id: 'SEN-02', location: 'Divisoria Plaza' },
  { id: 'SEN-03', location: 'Cogon Market' },
  { id: 'SEN-04', location: 'Limketkai Center' },
  { id: 'SEN-05', location: 'Xavier University' },
  { id: 'SEN-06', location: 'City Hall' },
];

  useEffect(() => {
    const id = setInterval(async () => {
      const next = Math.max(35, Math.min(110, Math.round(dbValue + (Math.random() * 16 - 8))));
      setDbValue(next);

      // Fetch AI Prediction
      try {
        const hour = new Date().getHours();
        const pred = await api.getPrediction(next, hour);
        setPrediction(pred);
      } catch (e) {
        console.error("AI Prediction failed", e);
      }

      // update stats in parent if provided (e.g. highest db)
      if (updateStats && next > stats.highestDb) {
        updateStats({ highestDb: next });
      }

      // push new reading into history, keep only last 50 entries
      setHistory((h) => {
        const time = new Date().toLocaleTimeString();
        const newData = [...h, { time, value: next }];
        return newData.slice(-50);
      });

      const pct = Math.min(100, Math.max(0, Math.round((next - 35) / 75 * 100)));
      if (pct < 35) setLoadLevel('Low');
      else if (pct < 70) setLoadLevel('Moderate');
      else setLoadLevel('High');
    }, 1200);
    return () => clearInterval(id);
  }, [dbValue, stats.highestDb, updateStats]);

  // Count violations for today
  const getTodayCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return violations.filter(v => v.time.startsWith(today)).length;
  };

  // Count active devices (with status 'online')
  const getActiveSensors = () => {
    return devices.filter(d => d.status === 'online').length;
  };

  const getSensorLevel = (id, index) => {
    const hash = id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const offset = (hash % 21) - 10 + (index % 3) * 2;
    return Math.max(40, Math.min(110, dbValue + offset));
  };

  const sensorPoints = (devices.length ? devices : fallbackSensors).map((sensor, index) => {
    const pos = mapPositions[index % mapPositions.length];
    return {
      id: sensor.id || `SEN-${index + 1}`,
      label: sensor.location || `Sensor ${index + 1}`,
      x: pos.x,
      y: pos.y,
      level: getSensorLevel(sensor.id || `SEN-${index + 1}`, index),
    };
  });

  return (
    <div className="dashboard-container">
      <section className="content">
          <div className="hero-band">
            <div className="hero-left">
              <div className="brand-badge"><span className="badge-dot" /> Smart IoT</div>
              <h1 className="hero-title">Cagayan De Oro City Streets</h1>
              <p className="hero-subtitle">Real‑time noise insights across Cagayan de Oro City streets.</p>
              <div className="hero-metrics">
                <div className="metric">
                  <span className="metric-label">Live</span>
                  <span className="metric-value">{dbValue} dB</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Highest</span>
                  <span className="metric-value">{stats.highestDb.toFixed(1)} dB</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Load</span>
                  <span className={`metric-value ${loadLevel.toLowerCase()}`}>{loadLevel}</span>
                </div>
                {prediction && (
                  <div className="metric ai-prediction">
                    <span className="metric-label">AI Impact</span>
                    <span className={`metric-value category-${prediction.category.toLowerCase()}`}>
                      {prediction.category}
                      <small>({(prediction.confidence * 100).toFixed(0)}%)</small>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="hero-right" aria-hidden="true">
              <div className="mini-eq">
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
            </div>
          </div>
          {alert && <div className="alert-banner">{alert}</div>}
          <div className="stats-cards">
            <div className="card">
              <h3>Active Sensors</h3>
              <p>{getActiveSensors()}</p>
            </div>
            <div className="card">
              <h3>Highest dB</h3>
              <p>{stats.highestDb.toFixed(1)}</p>
            </div>
            <div className="card">
              <h3>Violations Today</h3>
              <p>{getTodayCount()}</p>
            </div>
          </div>
          <div className="chart-section">
            <h2>Decibel Levels (Last Minute)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={[35, 110]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="map-section">
            <div className="map-header">
              <div>
                <h2>Sensor Location Map</h2>
                <p className="map-subtitle">Cagayan De Oro City View with live noise pins.</p>
              </div>
              <div className="map-legend">
                <span className="legend-item"><span className="legend-dot" /> Normal</span>
                <span className="legend-item"><span className="legend-dot high" /> High Noise</span>
              </div>
            </div>
            <div className="campus-map" role="img" aria-label="Cagayan de Oro city view with sensor markers">
              <div className="map-tag">Mini Map</div>
              <div className="map-block block-a" />
              <div className="map-block block-b" />
              <div className="map-block block-c" />
              <div className="map-block block-d" />
              <div className="map-path path-a" />
              <div className="map-path path-b" />
              <div className="map-label" style={{ left: '36%', top: '34%' }}>Divisoria Plaza</div>
              <div className="map-label" style={{ left: '60%', top: '30%' }}>Cogon Market</div>
              <div className="map-label" style={{ left: '70%', top: '52%' }}>Limketkai Center</div>
              <div className="map-label" style={{ left: '52%', top: '44%' }}>Centrio Mall</div>
              <div className="map-label" style={{ left: '42%', top: '58%' }}>Xavier University</div>
              <div className="map-label" style={{ left: '26%', top: '62%' }}>City Hall</div>
              {sensorPoints.map((point, index) => (
                <div
                  key={`${point.id}-${index}`}
                  className={`map-pin ${point.level >= 85 ? 'high' : ''}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span className="pin-dot" />
                  <span className="pin-label">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="violations-list">
            <h2>Recent Violations</h2>
            <ul>
              {violations.slice(-1).map((v) => (
                <li key={v.id}>
                  {v.time} - {v.sensor} ({v.level} dB)
                </li>
              ))}
            </ul>
          </div>
        </section>
    </div>
  );
};

export default Dashboard;
