import React, { useState } from "react";

import FireDashboard from "./components/FireDashboard";
import Login from "./components/Login";

import TunnelMap from "./components/TunnelMap";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (

        <div>

          {/* Logout Button */}
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              padding: 10,
              background: "red",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              zIndex: 9999
            }}
          >
            Logout
          </button>

          {/* DASHBOARD */}
          <FireDashboard />

          {/* MAP PAGE */}
          <TunnelMap />

        </div>

      ) : (

        <Login onLogin={setIsLoggedIn} />

      )}
    </>
  );
}

export default App;