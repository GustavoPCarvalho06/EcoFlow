// =================================================================================
// Arquivo: src/components/Map/MapBoxPainelCriar.jsx
// =================================================================================

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";

export default function MapBoxPainelCriar({ coords, setCoords, onCreate }) {
    const [loadingRua, setLoadingRua] = useState(false);
    const [status, setStatus] = useState("Vazia");
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const apiUrl = useApiUrl();

    // Busca o endereço reverso (Geocoding) quando as coordenadas mudam
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

    // Envia os dados para o backend
    const handleCreate = async () => {
        setMensagem({ tipo: "", texto: "" });

        if (!coords.lat || !coords.lng) {
            setMensagem({ tipo: "erro", texto: "Clique no mapa primeiro!" });
            return;
        }

        setIsSubmitting(true);

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
                setMensagem({ tipo: "erro", texto: "Erro ao criar ponto." });
                return;
            }

            setMensagem({ tipo: "sucesso", texto: "Criado com sucesso!" });
            onCreate();


        } catch (err) {
            console.error("Erro ao enviar:", err);
            setMensagem({ tipo: "erro", texto: "Erro de conexão." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[280px] rounded-xl border border-border shadow-lg p-5 flex flex-col items-center gap-4 bg-card text-foreground transition-colors duration-300">

            <h3 className="text-center text-lg font-bold tracking-tight">
                Novo Ponto
            </h3>

            {mensagem.texto && (
                <div
                    className={`text-xs font-bold text-center px-3 py-1 rounded-full ${
                        mensagem.tipo === "erro" 
                            ? "bg-destructive/10 text-destructive" 
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                    }`}
                >
                    {mensagem.texto}
                </div>
            )}

            <div className="w-full space-y-3">
                {/* Latitude */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Latitude</label>
                    <input 
                        type="text" 
                        value={coords.lat} 
                        readOnly 
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground font-mono focus:outline-none cursor-not-allowed" 
                    />
                </div>

                {/* Longitude */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Longitude</label>
                    <input 
                        type="text" 
                        value={coords.lng} 
                        readOnly 
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground font-mono focus:outline-none cursor-not-allowed" 
                    />
                </div>

                {/* Endereço */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
                        Endereço
                        {loadingRua && <Loader2 className="h-3 w-3 animate-spin text-primary"/>}
                    </label>
                    <input 
                        type="text" 
                        value={coords.rua ?? ""} 
                        readOnly 
                        placeholder={loadingRua ? "Buscando..." : "Clique no mapa"}
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground focus:outline-none truncate cursor-not-allowed" 
                    />
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Status Inicial</label>
                    <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                        onChange={(e) => setStatus(e.target.value)}
                        value={status}
                    >
                        <option value="Vazia">Vazia (Verde)</option>
                        <option value="Quase Cheia">Quase Cheia (Amarelo)</option>
                        <option value="Cheia">Cheia (Vermelho)</option>
                    </select>
                </div>
            </div>

            <Button
                size="lg"
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/10 mt-2"
                onClick={handleCreate}
                disabled={isSubmitting || !coords.lat}
            >
                {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <>
                        <PlusCircle className="h-5 w-5" /> Criar Ponto
                    </>
                )}
            </Button>
        </div>
    );
}