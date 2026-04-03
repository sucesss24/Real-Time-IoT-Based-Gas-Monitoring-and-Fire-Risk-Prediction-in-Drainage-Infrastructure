import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      onLogin(true);
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* ✅ BACKGROUND IMAGE */}
      <img
        src="/drain.jpg"   // 👉 put drain.jpg inside public folder
        alt="Drainage Tunnel"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
        }}
      />

      {/* ✅ DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          top: 0,
          left: 0,
        }}
      />

      {/* ✅ LOGIN CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          background: "rgba(17, 24, 39, 0.95)",
          padding: 35,
          borderRadius: 16,
          width: 350,
          boxShadow: "0 0 25px rgba(0,0,0,0.8)",
          color: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 5 }}>
          🚧 Drainage Tunnel
        </h2>

        <p style={{ textAlign: "center", fontSize: 13, color: "#aaa" }}>
          IoT Gas Monitoring & Fire Prediction
        </p>

        <hr style={{ margin: "15px 0", borderColor: "#333" }} />

        {/* Username */}
        <label>👤 Username</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            margin: "5px 0 15px",
            borderRadius: 8,
            border: "none",
            outline: "none",
          }}
        />

        {/* Password */}
        <label>🔒 Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            margin: "5px 0 20px",
            borderRadius: 8,
            border: "none",
            outline: "none",
          }}
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "linear-gradient(to right, #16a34a, #22c55e)",
            border: "none",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          🚀 Login
        </button>

        {/* Footer */}
        <p
          style={{
            marginTop: 15,
            fontSize: 12,
            textAlign: "center",
            color: "#777",
          }}
        >
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;