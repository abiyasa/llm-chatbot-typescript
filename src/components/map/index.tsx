"use client";

// IMPORTANT: the order matters!
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { Point } from "@/pages/api/chat";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Props = {
  center: Point;
}

// create a React Map component using React-Leaflet
export default function Map({ center }: Props) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: "400px", width: "600px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        <Popup>
          This Marker icon is displayed correctly with <i>leaflet-defaulticon-compatibility</i>.
        </Popup>
      </Marker>
    </MapContainer>
  );
}