import React, { useState } from "react";
import logo from "../assets/logo.png";

const Login = ({ onLogin }) => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    if (username === "admin" && password === "1234") {

      onLogin(true);

    } else {

      alert("Invalid Credentials");

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
        fontFamily: "Arial, sans-serif",
      }}
    >

      {/* ==============================
          BACKGROUND IMAGE
      ============================== */}

      <img
        src="/drain.jpg"
        alt="Tunnel"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
        }}
      />

      {/* ==============================
          DARK OVERLAY
      ============================== */}

      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.72)",
          top: 0,
          left: 0,
        }}
      />

      {/* ==============================
          TOP HEADER
      ============================== */}

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: "15px 40px",
          background: "rgba(127, 29, 29, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 5,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >

        {/* LEFT SIDE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >

          <img
            src={logo}
            alt="Tamil Nadu Logo"
            style={{
              width: 65,
              height: 65,
              borderRadius: "50%",
              background: "#fff",
              padding: 4,
            }}
          />

          <div>

            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              Government of Tamil Nadu
            </h2>

            <p
              style={{
                margin: 0,
                color: "#fecaca",
                fontSize: 13,
              }}
            >
              Smart Drainage Tunnel Monitoring System
            </p>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            color: "#fff",
            fontSize: 14,
            fontWeight: "bold",
          }}
        >
          Department of Public Safety
        </div>

      </div>

      {/* ==============================
          LOGIN CARD
      ============================== */}

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: 420,
          background: "rgba(17, 24, 39, 0.96)",
          padding: 40,
          borderRadius: 18,
          boxShadow: "0 0 35px rgba(0,0,0,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >

        {/* LOGO */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
          }}
        >

          <img
            src={logo}
            alt="Logo"
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "#fff",
              padding: 5,
              marginBottom: 10,
            }}
          />

          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontSize: 28,
            }}
          >
            Tunnel Monitoring Portal
          </h1>

          <p
            style={{
              color: "#9ca3af",
              fontSize: 14,
              marginTop: 5,
            }}
          >
            IoT Gas Monitoring & Fire Prediction System
          </p>

        </div>

        <hr
          style={{
            borderColor: "#374151",
            marginBottom: 25,
          }}
        />

        {/* USERNAME */}
        <div style={{ marginBottom: 20 }}>

          <label
            style={{
              color: "#d1d5db",
              fontSize: 14,
            }}
          >
            Username
          </label>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              borderRadius: 10,
              border: "1px solid #374151",
              background: "#111827",
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: 25 }}>

          <label
            style={{
              color: "#d1d5db",
              fontSize: 14,
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 14,
              marginTop: 8,
              borderRadius: 10,
              border: "1px solid #374151",
              background: "#111827",
              color: "#fff",
              fontSize: 15,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 14,
            background: "linear-gradient(to right, #991b1b, #dc2626)",
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
            cursor: "pointer",
            transition: "0.3s",
            boxShadow: "0 4px 12px rgba(220,38,38,0.4)",
          }}
        >
          Secure Login
        </button>

        {/* FOOTER */}
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          Authorized Government Personnel Only
        </div>

      </div>

    </div>
  );
};

export default Login;