"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";

export default function MapBoxPainelCriar({ coords, setCoords }) {
    const [loadingRua, setLoadingRua] = useState(false);
    const [status, setStatus] = useState("Vazia");
    const apiUrl = useApiUrl();

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
                console.error("Erro ao buscar endereço:", err);
            }
            setLoadingRua(false);
        };

        fetchStreetName();
    }, [coords.lat, coords.lng, setCoords]);

    const handleCreate = async () => {
        if (!coords.lat || !coords.lng) {
            alert("Clique no mapa primeiro!");
            return;
        }

        try {
            const res = await fetch(`${apiUrl}/lixo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    statusLixo: status,
                    localizacao: {
                        x: coords.lng,
                        y: coords.lat
                    },
                    endereco: coords.rua
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error("Erro ao criar:", data);
                alert("Erro ao criar ponto de coleta");
                return;
            }

            alert("Ponto de coleta criado com sucesso!");
        } catch (err) {
            console.error("Erro ao enviar:", err);
        }
    };


    return (
        <div className="w-[260px] rounded-xl border shadow-sm p-5 flex flex-col items-center gap-4 bg-white">

            <h3 className="text-center text-lg font-semibold">
                Novo Ponto de Coleta
            </h3>

            <div className="w-full">
                <label className="text-sm font-medium">Latitude</label>
                <input type="text" value={coords.lat} readOnly className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm" />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Longitude</label>
                <input type="text" value={coords.lng} readOnly className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm" />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Rua</label>
                <input type="text" value={coords.rua ?? ""} readOnly className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm" />
            </div>

            <div className="w-full">
                <label className="text-sm font-medium">Status do Lixo</label>
                <select
                    className="mt-1 w-full rounded-md border bg-white px-3 py-2 text-sm"
                    onChange={(e) => setStatus(e.target.value)}
                    value={status}
                >
                    <option value="Vazia">Vazia</option>
                    <option value="Quase Cheia">Quase Cheia</option>
                    <option value="Cheia">Cheia</option>
                </select>
            </div>

            <Button
                size="lg"
                className="w-full gap-2 cursor-pointer text-md"
                onClick={handleCreate}
            >
                <PlusCircle className="h-5 w-5" /> Criar Ponto de Coleta
            </Button>
        </div>
    );
}
