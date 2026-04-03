import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const FireDashboard = () => {
  const [allSensors, setAllSensors] = useState({});
  const [allPredictions, setAllPredictions] = useState({});
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [history, setHistory] = useState({});
  const [globalStatus, setGlobalStatus] = useState("SAFE");

  // 🔥 Fetch readings & predictions
  useEffect(() => {
    const sensorRef = ref(db, "readings");
    const predictionRef = ref(db, "prediction");

    // Sensor readings
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllSensors(data);
        if (!selectedSensor) setSelectedSensor(Object.keys(data)[0]);
      }
    });

    // Predictions
    onValue(predictionRef, (snapshot) => {
      const data = snapshot.val();

      console.log("🔥 Firebase prediction:", data);

      if (data) {
        setAllPredictions(data);

        let fire = false;
        let toxic = false;

        Object.values(data).forEach((sensor) => {
          if (sensor.fire_status === "FIRE ALERT") fire = true;

          if (["MODERATE", "HIGH", "CRITICAL"].includes(sensor.toxic_level)) {
            toxic = true;
          }
        });

        setGlobalStatus(fire || toxic ? "NOT SAFE" : "SAFE");
      }
    });
  }, [selectedSensor]);

  // 📊 Maintain history (FIXED HERE)
  useEffect(() => {
    if (!selectedSensor) return;

    const sensor = allSensors[selectedSensor];
    const predictionData = allPredictions[selectedSensor] || {};

    if (!sensor) return;

    console.log("Sensor:", sensor);
    console.log("Prediction:", predictionData);

    setHistory((prev) => {
      const updated = { ...prev };

      if (!updated[selectedSensor]) updated[selectedSensor] = [];

      updated[selectedSensor] = [
        ...updated[selectedSensor],
        {
          ...sensor,
          fire_status: predictionData.fire_status,
          toxic_level: predictionData.toxic_level,
          time: new Date().toLocaleTimeString(),
        },
      ].slice(-30);

      return updated;
    });
  }, [allSensors, allPredictions, selectedSensor]); // ✅ FIXED dependency

  const prediction = allPredictions[selectedSensor] || {};
  const sensorHistory = history[selectedSensor] || [];

  // 🔴 Fire color
  const getFireColor = (status) => {
    if (status === "FIRE ALERT") return "#ff3b3b";
    if (status === "WARNING") return "#ffae42";
    return "#2ecc71";
  };

  // ☣ Toxic color
  const getToxicColor = (level) => {
    if (level === "CRITICAL") return "#ff0000";
    if (level === "HIGH") return "#ff7300";
    if (level === "MODERATE") return "#f1c40f";
    return "#2ecc71";
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          padding: 20,
          background: "#111",
          borderRight: "2px solid #222",
        }}
      >
        <h2>Sensors</h2>

        {Object.keys(allSensors).map((id) => (
          <button
            key={id}
            onClick={() => setSelectedSensor(id)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              background: id === selectedSensor ? "#333" : "#222",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            {id}
          </button>
        ))}
      </div>

      {/* Main Dashboard */}
      <div style={{ flex: 1, padding: 20 }}>
        {/* Global Status */}
        <h2
          style={{
            marginBottom: 20,
            color: globalStatus === "SAFE" ? "#2ecc71" : "#ff3b3b",
          }}
        >
          Tunnel Status: {globalStatus}
        </h2>

        {/* Prediction Card */}
        <div
          style={{
            background: "#111",
            borderRadius: 12,
            padding: 20,
            marginBottom: 30,
          }}
        >
          <h3 style={{ color: getFireColor(prediction.fire_status) }}>
            Fire: {prediction.fire_status || "-"}
          </h3>

          <p>Probability: {prediction.probability || "-"}</p>

          <h3 style={{ color: getToxicColor(prediction.toxic_level) }}>
            Toxic Level: {prediction.toxic_level || "-"}
          </h3>

          <p>Gas Avg: {prediction.gas_average || "-"}</p>
          <p>Temp: {prediction.temperature || "-"} °C</p>
          <p>Humidity: {prediction.humidity || "-"} %</p>
          <p>Last Update: {prediction.time || "-"}</p>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
            <h3>Gas Sensors</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorHistory}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="mq2" stroke="#8884d8" dot={false} />
                <Line type="monotone" dataKey="mq135" stroke="#82ca9d" dot={false} />
                <Line type="monotone" dataKey="mq7" stroke="#ff7300" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
            <h3>Temp & Humidity</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sensorHistory}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="time" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="temp" stroke="#ff6347" dot={false} />
                <Line type="monotone" dataKey="hum" stroke="#1e90ff" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div style={{ marginTop: 30, background: "#111", padding: 20, borderRadius: 12 }}>
          <h3>Recent Sensor Readings</h3>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #444" }}>
                <th>Time</th>
                <th>MQ2</th>
                <th>MQ135</th>
                <th>MQ7</th>
                <th>Temp</th>
                <th>Humidity</th>
                <th>Fire</th>
                <th>Toxic</th>
              </tr>
            </thead>

            <tbody>
              {sensorHistory.slice().reverse().map((row, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #333" }}>
                  <td>{row.time}</td>
                  <td>{row.mq2}</td>
                  <td>{row.mq135}</td>
                  <td>{row.mq7}</td>
                  <td>{row.temp}</td>
                  <td>{row.hum}</td>
                  <td style={{ color: getFireColor(row.fire_status) }}>
                    {row.fire_status || "-"}
                  </td>
                  <td style={{ color: getToxicColor(row.toxic_level) }}>
                    {row.toxic_level || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FireDashboard;