"use client";

import { useState } from "react";
import BarChart from "@/components/coordenador/BarChart";
import DoughnutChart from "@/components/coordenador/DoughnutChart";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useApiUrl } from "@/app/context/ApiContext";

export default function DashboardCharts({ initialBarData, initialDoughData, token }) {
    const apiUrl = useApiUrl();
    const [barData, setBarData] = useState(initialBarData);
    const [loading, setLoading] = useState(false);
    const [range, setRange] = useState("semanal"); 

    const fetchChartData = async (selectedRange) => {
        if (selectedRange === range) return; 
        
        setLoading(true);
        setRange(selectedRange);

        try {
        
            const res = await fetch(`${apiUrl}/dashboard/coordenador?range=${selectedRange}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                if (data.graficoBarra) {
                    setBarData(data.graficoBarra);
                }
            }
        } catch (error) {
            console.error("Erro ao filtrar gráfico:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Visão Operacional</h3>
                    <p className="text-sm text-muted-foreground">
                        Análise de desempenho e atividade dos sensores.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
                    <Button 
                        variant={range === 'semanal' ? "secondary" : "ghost"} 
                        size="sm"
                        onClick={() => fetchChartData('semanal')}
                        className={`text-xs h-8 ${range === 'semanal' ? 'bg-white dark:bg-muted text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                        Semana
                    </Button>
                    <Button 
                        variant={range === 'mensal' ? "secondary" : "ghost"} 
                        size="sm"
                        onClick={() => fetchChartData('mensal')}
                        className={`text-xs h-8 ${range === 'mensal' ? 'bg-white dark:bg-muted text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                        Mês
                    </Button>
                    <Button 
                        variant={range === 'anual' ? "secondary" : "ghost"} 
                        size="sm"
                        onClick={() => fetchChartData('anual')}
                        className={`text-xs h-8 ${range === 'anual' ? 'bg-white dark:bg-muted text-foreground shadow-sm' : 'text-muted-foreground'}`}
                    >
                        Ano
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[360px]">
                
                <div className="lg:col-span-2 h-[300px] lg:h-full relative">
                    {loading && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <BarChart data={barData} />
                </div>
                
                <div className="lg:col-span-1 h-[300px] lg:h-full border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
                    <DoughnutChart data={initialDoughData} />
                </div>
            </div>
        </div>
    );
}