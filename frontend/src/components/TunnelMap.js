import React, { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

// ==============================
// FIX LEAFLET MARKER ISSUE
// ==============================
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TunnelMap = () => {

  const [sensors, setSensors] = useState({});

  // ==============================
  // FETCH FIREBASE DATA
  // ==============================
  useEffect(() => {

    const predictionRef = ref(db, "prediction");

    onValue(predictionRef, (snapshot) => {

      const data = snapshot.val();

      if (data) {
        setSensors(data);
      }

    });

  }, []);

  // ==============================
  // TUNNEL PATH
  // ==============================
  const tunnelPath = [
    [13.0827, 80.2707],
    [13.0835, 80.2718]
  ];

  return (

    <div
      style={{
        padding: 20,
        background: "#0f172a",
        color: "#fff",
      }}
    >

      <h2
        style={{
          color: "#facc15",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        🚇 Tunnel GPS Monitoring Map
      </h2>

      <div
        style={{
          borderRadius: 15,
          overflow: "hidden",
          border: "3px solid #1f2937",
        }}
      >

        <MapContainer
          center={[13.0830, 80.2710]}
          zoom={17}
          style={{
            height: "500px",
            width: "100%",
          }}
        >

          {/* MAP LAYER */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* TUNNEL ROUTE */}
          <Polyline positions={tunnelPath} />

          {/* SENSOR MARKERS */}
          {Object.entries(sensors).map(([id, sensor]) => {

            const lat = sensor.latitude;
            const lng = sensor.longitude;

            if (!lat || !lng) return null;

            return (

              <Marker
                key={id}
                position={[lat, lng]}
              >

                <Popup>

                  <div>

                    {/* TUNNEL NAME */}
                    <h3>
                      {id === "sensor1"
                        ? "North Tunnel Entrance"
                        : "South Tunnel Exit"}
                    </h3>

                    {/* LOCATION */}
                    <p>
                      {sensor.location}
                    </p>

                    {/* FIRE STATUS */}
                    <p>
                      Fire:
                      {" "}
                      {sensor.fire_status}
                    </p>

                    {/* TOXIC LEVEL */}
                    <p>
                      Toxic:
                      {" "}
                      {sensor.toxic_level}
                    </p>

                    {/* ALERT MESSAGE */}
                    {
                      sensor.fire_status !== "SAFE" && (
                        <h2
                          style={{
                            color: "red",
                            background: "#ffe5e5",
                            padding: 10,
                            borderRadius: 10,
                            textAlign: "center",
                          }}
                        >
                          FIRE ALERT DETECTED
                        </h2>
                      )
                    }

                    {
                      sensor.toxic_level === "HIGH" ||
                      sensor.toxic_level === "CRITICAL" ? (
                        <h2
                          style={{
                            color: "orange",
                            background: "#fff4e5",
                            padding: 10,
                            borderRadius: 10,
                            textAlign: "center",
                          }}
                        >
                          TOXIC GAS ALERT
                        </h2>
                      ) : null
                    }

                    {/* TEMPERATURE */}
                    <p>
                      Temp:
                      {" "}
                      {sensor.temperature} °C
                    </p>

                    {/* HUMIDITY */}
                    <p>
                       Humidity:
                      {" "}
                      {sensor.humidity}%
                    </p>

                    {/* GPS */}
                    <p>
                       GPS:
                      {" "}
                      {lat}, {lng}
                    </p>

                  </div>

                </Popup>

              </Marker>

            );

          })}

        </MapContainer>

      </div>

    </div>

  );

};

export default TunnelMap;