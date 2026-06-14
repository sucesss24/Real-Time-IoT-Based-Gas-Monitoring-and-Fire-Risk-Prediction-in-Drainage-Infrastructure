import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

import logo from "../assets/logo.png";

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

  // ==============================
  // FETCH SENSOR READINGS
  // ==============================
  useEffect(() => {

    const sensorRef = ref(db, "readings");

    onValue(sensorRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([id]) => id !== "sensor3")
        );

        setAllSensors(filteredData);

      }

    });

  }, []);

  // ==============================
  // FETCH PREDICTIONS
  // ==============================
  useEffect(() => {

    const predictionRef = ref(db, "prediction");

    onValue(predictionRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {

        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([id]) => id !== "sensor3")
        );

        setAllPredictions(filteredData);

      }

    });

  }, []);

  // ==============================
  // DEFAULT SENSOR
  // ==============================
  useEffect(() => {

    if (!selectedSensor && Object.keys(allSensors).length > 0) {

      setSelectedSensor(Object.keys(allSensors)[0]);

    }

  }, [allSensors, selectedSensor]);

  // ==============================
  // HISTORY DATA
  // ==============================
  useEffect(() => {

    if (!selectedSensor) return;

    const sensor = allSensors[selectedSensor];

    const predictionData =
      allPredictions[selectedSensor] || {};

    if (!sensor) return;

    setHistory((prev) => {

      const updated = { ...prev };

      if (!updated[selectedSensor]) {
        updated[selectedSensor] = [];
      }

      updated[selectedSensor] = [

        ...updated[selectedSensor],

        {
          ...sensor,
          fire_status: predictionData?.fire_status,
          toxic_level: predictionData?.toxic_level,
          location: predictionData?.location,
          probability: predictionData?.probability,
          gas_average: predictionData?.gas_average,
          temperature: predictionData?.temperature,
          humidity: predictionData?.humidity,
          latitude: predictionData?.latitude,
          longitude: predictionData?.longitude,
          time: new Date().toLocaleTimeString(),
        },

      ].slice(-30);

      return updated;

    });

  }, [allSensors, allPredictions, selectedSensor]);

  const prediction =
    allPredictions[selectedSensor] || {};

  const sensorHistory =
    history[selectedSensor] || [];

  // ==============================
  // FIRE COLOR
  // ==============================
  const getFireColor = (status) => {

    if (status === "FIRE ALERT")
      return "#ff3b3b";

    if (status === "WARNING")
      return "#ffae42";

    return "#2ecc71";
  };

  // ==============================
  // TOXIC COLOR
  // ==============================
  const getToxicColor = (level) => {

    if (level === "CRITICAL")
      return "#ff0000";

    if (level === "HIGH")
      return "#ff7300";

    if (level === "MODERATE")
      return "#facc15";

    return "#2ecc71";
  };

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        fontFamily: "Arial",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(to right, #111827, #1f2937)",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow:
            "0px 4px 10px rgba(0,0,0,0.5)",
        }}
      >

        {/* LEFT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >

          <img
            src={logo}
            alt="Logo"
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#fff",
              padding: 5,
              objectFit: "contain",
            }}
          />

          <div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              SafeTunnel AI
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#d1d5db",
              }}
            >
              Real-Time IoT Gas Monitoring &
              Fire Prediction System
            </p>

          </div>

        </div>

      </div>

      {/* MAIN */}
      <div style={{ display: "flex" }}>

        {/* SIDEBAR */}
        <div
          style={{
            width: 240,
            background: "#111827",
            padding: 20,
            borderRight:
              "2px solid #1f2937",
          }}
        >

          <h2
            style={{
              color: "#facc15",
              marginBottom: 20,
            }}
          >
            Tunnel Sensors
          </h2>

          {Object.keys(allSensors).map((id) => (

            <button
              key={id}
              onClick={() =>
                setSelectedSensor(id)
              }
              style={{
                width: "100%",
                padding: 15,
                marginBottom: 15,
                background:
                  id === selectedSensor
                    ? "#dc2626"
                    : "#1f2937",

                color: "#fff",
                border: "none",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "left",
              }}
            >
              {id.toUpperCase()}
            </button>

          ))}

        </div>

        {/* DASHBOARD */}
        <div style={{ flex: 1, padding: 25 }}>

          {/* PREDICTION CARD */}
          <div
            style={{
              background: "#111827",
              borderRadius: 15,
              padding: 25,
              marginBottom: 30,
            }}
          >

            <h2
              style={{
                color: "#facc15",
                marginTop: 0,
              }}
            >
              Live Tunnel Prediction
            </h2>

            <h3
              style={{
                color: getFireColor(
                  prediction?.fire_status
                ),
              }}
            >
              Fire Status :
              {" "}
              {prediction?.fire_status || "-"}
            </h3>

            <h3
              style={{
                color: getToxicColor(
                  prediction?.toxic_level
                ),
              }}
            >
              Toxic Level :
              {" "}
              {prediction?.toxic_level || "-"}
            </h3>

            <p>
              Tunnel Location :
              {" "}
              {prediction?.location || "-"}
            </p>

            <p>
              Latitude :
              {" "}
              {prediction?.latitude || 0}
            </p>

            <p>
              Longitude :
              {" "}
              {prediction?.longitude || 0}
            </p>

            <p>
              Fire Probability :
              {" "}
              {prediction?.probability || "-"}
            </p>

            <p>
              Gas Average :
              {" "}
              {prediction?.gas_average || "-"}
            </p>

            <p>
              Temperature :
              {" "}
              {prediction?.temperature || "-"} °C
            </p>

            <p>
              Humidity :
              {" "}
              {prediction?.humidity || "-"} %
            </p>

            <p>
               Last Update :
              {" "}
              {prediction?.time || "-"}
            </p>

          </div>

          {/* CHARTS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 25,
            }}
          >

            {/* GAS CHART */}
            <div
              style={{
                background: "#111827",
                padding: 20,
                borderRadius: 15,
              }}
            >

              <h3 style={{ color: "#facc15" }}>
                Gas Sensor Analysis
              </h3>

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={sensorHistory}
                >

                  <CartesianGrid
                    stroke="#374151"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#ccc"
                  />

                  <YAxis stroke="#ccc" />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="mq2"
                    stroke="#8b5cf6"
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="mq135"
                    stroke="#22c55e"
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="mq7"
                    stroke="#f97316"
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

            {/* TEMP CHART */}
            <div
              style={{
                background: "#111827",
                padding: 20,
                borderRadius: 15,
              }}
            >

              <h3 style={{ color: "#facc15" }}>
                Temperature & Humidity
              </h3>

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <LineChart
                  data={sensorHistory}
                >

                  <CartesianGrid
                    stroke="#374151"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#ccc"
                  />

                  <YAxis stroke="#ccc" />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#ef4444"
                    dot={false}
                  />

                  <Line
                    type="monotone"
                    dataKey="hum"
                    stroke="#3b82f6"
                    dot={false}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
};

export default FireDashboard;