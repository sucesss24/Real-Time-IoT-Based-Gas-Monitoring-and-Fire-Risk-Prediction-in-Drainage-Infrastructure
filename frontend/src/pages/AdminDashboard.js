import React, { useEffect, useState } from "react";
import { listenSensorData } from "../services/firebaseService";
import { predictFire } from "../services/api";
import GasChart from "../components/GasChart";

const AdminDashboard = () => {
  const [sensor, setSensor] = useState({});
  const [fireStatus, setFireStatus] = useState("");
  const [toxicLevel, setToxicLevel] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    listenSensorData(async (data) => {
      setSensor(data);

      const backendData = {
        Temperature: data.temp ?? 0,
        Humidity: data.hum ?? 0,
        Methane: data.mq2 ?? 0,
        CO: data.mq7 ?? 0,
        Ethylene: data.mq135 ?? 0,
        H2S: 0,
        NH3: 0,
        Oxygen: 20.9
      };

      const res = await predictFire(backendData);

      setFireStatus(res.data.fire_status);
      setToxicLevel(res.data.toxic_level);

      setHistory(prev => [
        ...prev.slice(-20),
        { time: new Date().toLocaleTimeString(), ...backendData }
      ]);
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>🔥 Drainage Tunnel Admin Dashboard</h1>

      <div className="status-box">
        <h2>Fire Status: {fireStatus}</h2>
        <h2>Toxic Level: {toxicLevel}</h2>
      </div>

      <pre>{JSON.stringify(sensor, null, 2)}</pre>

      <GasChart data={history} />
    </div>
  );
};

export default AdminDashboard;