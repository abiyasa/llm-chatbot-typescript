"use client";

// IMPORTANT: the order matters!
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css";
import "leaflet-defaulticon-compatibility";

import { useState } from "react";
import { Point } from "@/pages/api/chat";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet";

type Props = {
  center: Point;
  routes: Point[];
}

// create a React Map component using React-Leaflet
export default function Map({ center, routes }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const handleClick = (point: Point) => {
    setPoints([...points, point]);

    // console.log(points);
  };
  const lineOptions = { color: "red", weight: 7 };
  const bounds = getBounds(routes);

  return (
    <MapContainer style={{ height: "400px", width: "600px" }} bounds={bounds}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline pathOptions={lineOptions} positions={routes} />
      <LocationMarker onClick={handleClick} />
      {routes.length > 0 && (<>
        <Marker position={routes[0]}>
          <Popup>
            Start
          </Popup>
        </Marker>
        <Marker position={routes[routes.length - 1]}>
          <Popup>
            End
          </Popup>
        </Marker>
      </>)}
    </MapContainer>
  );
}

function LocationMarker(props: { onClick?: (p: Point) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      props.onClick?.({ lat, lng });
    },
  })

  return null;
}

function getBounds(points: Point[]): [[number, number], [number, number]] {
  // use loop to find min and max
  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  points.forEach((point) => {
    if (point.lat < minLat) {
      minLat = point.lat;
    }
    if (point.lat > maxLat) {
      maxLat = point.lat;
    }
    if (point.lng < minLng) {
      minLng = point.lng;
    }
    if (point.lng > maxLng) {
      maxLng = point.lng;
    }
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
}