"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function MapBoxPainelCriar({ coords, setCoords }) {
    const [loadingRua, setLoadingRua] = useState(false);

    useEffect(() => {
        if (!coords.lat || !coords.lng) return;

        const fetchStreetName = async () => {
            setLoadingRua(true);
            try {
                const res = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lng},${coords.lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
                );
                const data = await res.json();
                const rua = data?.features?.[0]?.place_name || "";

                setCoords((prev) => ({ ...prev, rua }));
            } catch (err) {
                console.error("Erro na busca de endereço:", err);
            }
            setLoadingRua(false);
        };

        fetchStreetName();
    }, [coords.lat, coords.lng]);

    return (
        <div className="w-[260px] rounded-xl border shadow-sm p-5 flex flex-col items-center gap-4 bg-white">

            <h3 className="text-center text-lg font-semibold">
                Novo Ponto de Coleta
            </h3>

            <div className="w-full">
                <label className="text-sm font-medium">Latitude</label>
                <input
                    type="text"
                    value={coords.lat}
                    readOnly
                    className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Longitude</label>
                <input
                    type="text"
                    value={coords.lng}
                    readOnly
                    className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Rua / Nome</label>
                <input
                    type="text"
                    value={coords.rua ?? ""}
                    readOnly
                    className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Status do Lixo</label>
                <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm">
                    <option value="Vazia">Vazia</option>
                    <option value="Quase Cheia">Quase Cheia</option>
                    <option value="Cheia">Cheia</option>
                </select>
            </div>

            <Button size="lg" className="w-full gap-2 cursor-pointer text-md">
                <PlusCircle className="h-5 w-5" />Criar Ponto de Coleta</Button>

        </div>
    );
}
