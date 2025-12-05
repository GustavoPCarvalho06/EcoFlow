"use client";
import { useState, useRef } from "react";
import MapboxMap from "./MapboxMap";
import MapBoxPainelCriar from "./MapBoxPainelCriar";

export default function MapBoxCriarWrapper({ token }) {
    const [coords, setCoords] = useState({ lat: "", lng: "", rua: "" });
    const refreshPointsRef = useRef(null);

    return (
        <div className="flex flex-1 gap-6">

            <div className="flex-1 rounded-lg overflow-hidden border shadow-md">
                <MapboxMap
                    onMapClick={(clicked) =>
                        setCoords({ lat: clicked.lat, lng: clicked.lng, rua: "" })
                    }
                    onRefreshReady={(fn) => (refreshPointsRef.current = fn)}
                />
            </div>

            <div className="flex items-center justify-center">
                <MapBoxPainelCriar
                    coords={coords}
                    setCoords={setCoords}
                    onCreate={() => refreshPointsRef.current?.()}
                />
            </div>

        </div>
    );
}