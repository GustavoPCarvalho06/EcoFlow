"use client";
import { useState } from "react";
import MapboxMap from "./MapboxMap";
import MapBoxPainelCriar from "./MapBoxPainelCriar";

export default function MapBoxCriarWrapper() {
    const [coords, setCoords] = useState({ lat: "", lng: "", rua: "" });

    return (
        <div className="flex flex-1 gap-6">

            <div className="flex-1 rounded-lg overflow-hidden border shadow-md">
                <MapboxMap
                    onMapClick={(clicked) =>
                        setCoords({ lat: clicked.lat, lng: clicked.lng, rua: "" })
                    }
                />
            </div>

            <div className="flex items-center justify-center">
                <MapBoxPainelCriar coords={coords} setCoords={setCoords} />
            </div>

        </div>
    );
}
