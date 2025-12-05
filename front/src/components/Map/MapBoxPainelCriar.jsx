"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Search } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";

export default function MapBoxPainelCriar({ coords, setCoords, onCreate, token }) {
    const [loadingRua, setLoadingRua] = useState(false);
    const [status, setStatus] = useState("Vazia");
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [cepInput, setCepInput] = useState("");
    const [loadingCep, setLoadingCep] = useState(false);

    const apiUrl = useApiUrl();

    useEffect(() => {
        if (!coords.lat || !coords.lng) return;

        if (coords.rua && !loadingRua) return;

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

    
    const handleBuscarCep = async () => {
        const cepLimpo = cepInput.replace(/\D/g, "");
        if (cepLimpo.length !== 8) {
            setMensagem({ tipo: "erro", texto: "CEP inválido (8 dígitos)" });
            return;
        }

        setLoadingCep(true);
        setMensagem({ tipo: "", texto: "" });

        try {
            const viaCepRes = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const viaCepData = await viaCepRes.json();

            if (viaCepData.erro) {
                setMensagem({ tipo: "erro", texto: "CEP não encontrado." });
                setLoadingCep(false);
                return;
            }

            const enderecoCompleto = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}, Brasil`;

            const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(enderecoCompleto)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`;
            
            const mapboxRes = await fetch(mapboxUrl);
            const mapboxData = await mapboxRes.json();

            if (mapboxData.features && mapboxData.features.length > 0) {
                const [lng, lat] = mapboxData.features[0].center;
                const nomeFormatado = mapboxData.features[0].place_name;

                setCoords({
                    lat: lat,
                    lng: lng,
                    rua: nomeFormatado 
                });
                
                setMensagem({ tipo: "sucesso", texto: "Local encontrado via CEP!" });
            } else {
                setMensagem({ tipo: "erro", texto: "Coordenadas não encontradas para este CEP." });
            }

        } catch (error) {
            console.error("Erro na busca de CEP:", error);
            setMensagem({ tipo: "erro", texto: "Erro ao buscar CEP." });
        } finally {
            setLoadingCep(false);
        }
    };

   
    const handleCreate = async () => {
        setMensagem({ tipo: "", texto: "" });

        if (!coords.lat || !coords.lng) {
            setMensagem({ tipo: "erro", texto: "Defina um local (Mapa ou CEP)!" });
            return;
        }

        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const finalToken = token || storedToken;

        if (!finalToken) {
            setMensagem({ tipo: "erro", texto: "Erro de autenticação. Faça login novamente." });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${apiUrl}/lixo`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${finalToken}` 
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
                setMensagem({ tipo: "erro", texto: data.mensagem || "Erro ao criar ponto." });
                return;
            }

            setMensagem({ tipo: "sucesso", texto: "Criado com sucesso!" });
            onCreate?.();

            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("sensorCreated"));
            }


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
                    className={`text-xs font-bold text-center px-3 py-1 rounded-full ${mensagem.tipo === "erro"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        }`}
                >
                    {mensagem.texto}
                </div>
            )}

            <div className="w-full space-y-3">
                
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Buscar por CEP</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="00000-000"
                            value={cepInput}
                            onChange={(e) => setCepInput(e.target.value)}
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            maxLength={9}
                        />
                        <Button 
                            size="icon" 
                            className="h-[34px] w-[34px] bg-muted hover:bg-muted/80 text-foreground"
                            onClick={handleBuscarCep}
                            disabled={loadingCep}
                        >
                            {loadingCep ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-border my-1" />

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Latitude</label>
                    <input
                        type="text"
                        value={coords.lat}
                        readOnly
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground font-mono focus:outline-none cursor-not-allowed"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Longitude</label>
                    <input
                        type="text"
                        value={coords.lng}
                        readOnly
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground font-mono focus:outline-none cursor-not-allowed"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
                        Endereço Automático
                        {loadingRua && <Loader2 className="h-3 w-3 animate-spin text-primary"/>}
                    </label>
                    <input 
                        type="text" 
                        value={coords.rua ?? ""} 
                        readOnly 
                        placeholder={loadingRua ? "Buscando..." : "Selecione no mapa ou digite o CEP"}
                        className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-xs text-foreground focus:outline-none truncate cursor-not-allowed" 
                        title={coords.rua}
                    />
                </div>

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