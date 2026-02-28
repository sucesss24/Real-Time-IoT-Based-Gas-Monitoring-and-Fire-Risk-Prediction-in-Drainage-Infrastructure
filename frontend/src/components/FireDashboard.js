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

  // -----------------------------
  // Listen to Firebase
  // -----------------------------
  useEffect(() => {
    const sensorRef = ref(db, "readings");
    const predictionRef = ref(db, "prediction");

    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllSensors(data);
        if (!selectedSensor) setSelectedSensor(Object.keys(data)[0]);
      }
    });

    onValue(predictionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllPredictions(data);

        let fire = false;
        let toxic = false;
        Object.values(data).forEach((sensor) => {
          if (sensor.fire_status === "FIRE ALERT") fire = true;
          if (["HIGH", "CRITICAL"].includes(sensor.toxic_level)) toxic = true;
        });

        setGlobalStatus(fire || toxic ? "NOT SAFE" : "SAFE");
      }
    });
  }, [selectedSensor]);

  // -----------------------------
  // Update history
  // -----------------------------
  useEffect(() => {
    if (!selectedSensor) return;
    const sensorPred = allPredictions[selectedSensor] || allSensors[selectedSensor];
    if (!sensorPred) return;

    setHistory((prev) => {
      const updated = { ...prev };
      if (!updated[selectedSensor]) updated[selectedSensor] = [];
      updated[selectedSensor] = [
        ...updated[selectedSensor],
        { ...sensorPred, time: new Date().toLocaleTimeString() },
      ].slice(-30);
      return updated;
    });
  }, [allPredictions, allSensors, selectedSensor]);

  // -----------------------------
  // Helper colors
  // -----------------------------
  const getFireColor = (status) => {
    if (status === "FIRE ALERT") return "#ff3b3b";
    if (status === "WARNING") return "#ffae42";
    return "#2ecc71";
  };

  const getToxicColor = (level) => {
    if (level === "CRITICAL") return "#ff0000";
    if (level === "HIGH") return "#ff7300";
    if (level === "MODERATE") return "#f1c40f";
    return "#2ecc71";
  };

  const prediction = allPredictions[selectedSensor] || {};
  const sensorData = allSensors[selectedSensor] || {};
  const sensorHistory = history[selectedSensor] || [];

  // Determine sidebar alert
  const isAlert =
    (prediction.fire_status === "FIRE ALERT") ||
    ["HIGH", "CRITICAL"].includes(prediction.toxic_level);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Times, 'Times New Roman', serif",
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
        <h2 style={{ marginBottom: 20, fontWeight: "bold" }}>Sensors</h2>
        {Object.keys(allSensors).map((id) => {
          const pred = allPredictions[id] || {};
          const alert = (pred.fire_status === "FIRE ALERT") ||
                        ["HIGH", "CRITICAL"].includes(pred.toxic_level);
          return (
            <button
              key={id}
              onClick={() => setSelectedSensor(id)}
              style={{
                width: "100%",
                padding: 12,
                marginBottom: 10,
                background: id === selectedSensor ? "#333" : "#222",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                fontWeight: "normal",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontFamily: "Times, 'Times New Roman', serif",
              }}
            >
              {id}
              {alert && <span style={{ color: "#ff3b3b", fontWeight: "bold" }}>ALERT</span>}
            </button>
          );
        })}
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, padding: 20 }}>
        {/* Global Status */}
        <div
          style={{
            padding: 20,
            background: "#111",
            borderRadius: 12,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              color: globalStatus === "SAFE" ? "#2ecc71" : "#ff3b3b",
              fontWeight: "bold",
            }}
          >
            HUMAN ENTRY: {globalStatus}
          </h2>
        </div>

        {/* Sensor Status */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div style={{ background: "#111", borderRadius: 12, padding: 20 }}>
            <h3
              style={{
                color: getFireColor(prediction.fire_status),
                fontWeight: "bold",
              }}
            >
              Fire: {prediction.fire_status || "SAFE"} ({prediction.probability || sensorData.mq2 || 0})
            </h3>

            <h3
              style={{
                color: getToxicColor(prediction.toxic_level),
                fontWeight: "bold",
              }}
            >
              Toxic Level: {prediction.toxic_level || "SAFE"} (Avg: {prediction.gas_average || sensorData.mq135 || 0})
            </h3>

            <p>Temp: {prediction.temperature || sensorData.temp || 0} °C</p>
            <p>Humidity: {prediction.humidity || sensorData.hum || 0} %</p>
            <p>Sensor Contact: {prediction.sensor_phone || sensorData.phone || "N/A"}</p>
            <p>Last Update: {prediction.time || new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
          <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
            <h3 style={{ fontWeight: "bold" }}>Gas Sensors History</h3>
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
            <h3 style={{ fontWeight: "bold" }}>Temperature & Humidity History</h3>
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
      </div>
    </div>
  );
};

export default FireDashboard;