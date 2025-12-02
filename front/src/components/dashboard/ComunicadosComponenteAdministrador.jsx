// =================================================================================
// Arquivo: src/components/dashboard/ComunicadosComponenteAdministrador.jsx
// =================================================================================
"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useApiUrl } from "@/app/context/ApiContext";
import { CalendarDays, User, Edit3, Megaphone, Loader2, Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ComunicadoCompletoDialog({ comunicado, isOpen, onOpenChange }) {
  if (!comunicado) return null;
  const isEdited = !!comunicado.data_edicao;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 gap-0 border border-gray-100 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-50">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                        <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                            {comunicado.titulo}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 mt-1 flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {comunicado.autor_nome}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            {isEdited && (
                                <Badge variant="outline" className="ml-2 text-[10px] h-5 px-1.5 border-orange-200 text-orange-600 bg-orange-50">
                                    Editado
                                </Badge>
                            )}
                        </DialogDescription>
                    </div>
                </div>
            </div>
        </DialogHeader>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/30">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
            {comunicado.conteudo}
          </p>
        </div>

        <DialogFooter className="p-4 bg-white border-t border-gray-50 sm:justify-between items-center">
             <span className="text-xs text-gray-400 italic hidden sm:block">
                EcoFlow - Comunicação Interna
             </span>
             <Button onClick={() => onOpenChange(false)} className="rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                Fechar
             </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ComunicadosComponenteAdministrador({ user, token }) {
  const apiUrl = useApiUrl();
  
  const [todosComunicados, setTodosComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limiteExibicao, setLimiteExibicao] = useState(3);
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unseenIds, setUnseenIds] = useState(new Set());
  const [editedUnseenIds, setEditedUnseenIds] = useState(new Set());

  const fetchData = useCallback(async () => {
    if (!apiUrl || !user?.id || !token) { 
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError("");
    
    const headers = {
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'Authorization': `Bearer ${token}`
    };

    try {
      const comunicadosRes = await fetch(`${apiUrl}/comunicados`, { headers });
      if (!comunicadosRes.ok) throw new Error('Falha ao buscar comunicados');
      const comunicadosData = await comunicadosRes.json();
      setTodosComunicados(comunicadosData);

      const unseenIdsRes = await fetch(`${apiUrl}/comunicados/unseen-ids-detailed`, { headers });
      if (unseenIdsRes.ok) {
        const unseenData = await unseenIdsRes.json();
        setUnseenIds(new Set(unseenData.new_ids));
        setEditedUnseenIds(new Set(unseenData.edited_ids));
      }
    } catch (err) { 
      console.error("Erro ao buscar dados do mural:", err);
      setError("Não foi possível carregar o mural.");
    }
    finally { setLoading(false); }
  }, [user, apiUrl, token]);

  useEffect(() => { 
    if (apiUrl) {
      fetchData();
    }
  }, [fetchData, apiUrl]);

  useEffect(() => {
    if (!apiUrl) return;
    const socket = io(apiUrl);
    socket.on('comunicados_atualizados', fetchData);
    return () => { 
      socket.off('comunicados_atualizados', fetchData); 
      socket.disconnect(); 
    };
  }, [fetchData, apiUrl]);

  const truncarTexto = (texto, limite) => (texto.length > limite ? { texto: texto.substring(0, limite) + "...", truncado: true } : { texto, truncado: false });

  const handleExibirCompleto = async (comunicado) => {
    if (!apiUrl || !token) {
        setError("Não foi possível conectar ao servidor.");
        return;
    }

    setComunicadoSelecionado(comunicado);
    setIsDialogOpen(true);
    const isUnseen = unseenIds.has(comunicado.id) || editedUnseenIds.has(comunicado.id);
    
    if (isUnseen && user?.id) {
      try {
        await fetch(`${apiUrl}/comunicados/mark-one-seen/${comunicado.id}`, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'x-user-id': user.id.toString(),
                'Authorization': `Bearer ${token}` 
            } 
        });
        setUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
        setEditedUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
      } catch (error) { console.error("Erro ao marcar como visto:", error); }
    }
  };
  
  const comunicadosVisiveis = todosComunicados.slice(0, limiteExibicao);
  const mostrarBotaoExibirMais = todosComunicados.length > limiteExibicao;

  let unseenHiddenCount = 0;
  if (mostrarBotaoExibirMais) {
      todosComunicados.slice(limiteExibicao).forEach(comunicado => {
          if (unseenIds.has(comunicado.id) || editedUnseenIds.has(comunicado.id)) {
              unseenHiddenCount++;
          }
      });
  }

  if (!apiUrl || loading) {
      return (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-sm text-gray-500 font-medium">Atualizando mural...</p>
          </div>
      );
  }

  if (error) {
    return (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-6 text-center">
            <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="border-red-200 text-red-700 hover:bg-red-50">
                Tentar novamente
            </Button>
        </div>
    );
  }

  if (todosComunicados.length === 0) {
      return (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Megaphone className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">Nenhum comunicado</p>
              <p className="text-sm text-gray-500">O mural está vazio no momento.</p>
          </div>
      );
  }

  return (
    <>
      <div className="space-y-4 overflow-y-auto h-[calc(100vh-14rem)] pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pb-4">
        {comunicadosVisiveis.map((comunicado) => {
          const { texto: conteudoTruncado } = truncarTexto(comunicado.conteudo, 150);
          const isNew = unseenIds.has(comunicado.id);
          const isEditedAndUnseen = editedUnseenIds.has(comunicado.id);
          const isEdited = !!comunicado.data_edicao;

          return (
            <Card 
                key={comunicado.id} 
                className={cn(
                    "group relative overflow-hidden rounded-xl border transition-all duration-300",
                    isNew 
                        ? "border-l-[4px] border-l-green-500 border-y-green-100 border-r-green-100 bg-green-50/10 shadow-md shadow-green-100/50" 
                        : "border-gray-100 hover:border-green-200 hover:shadow-md hover:-translate-y-0.5"
                )}
            >
              <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                <Avatar className={cn("h-11 w-11 border-2", isNew ? "border-green-200" : "border-gray-100")}>
                    <AvatarFallback className={cn("text-sm font-bold", isNew ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                        {comunicado.autor_nome.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isNew && (
                            <Badge className="h-5 px-1.5 bg-blue-500 hover:bg-green-600 text-white border-0 text-[10px] font-bold shadow-sm">
                                NOVO
                            </Badge>
                        )}
                        {isEditedAndUnseen && (
                            <Badge className="h-5 px-1.5 bg-orange-500 hover:bg-orange-600 text-white border-0 text-[10px] font-bold shadow-sm">
                                EDITADO
                            </Badge>
                        )}
                        <span className="text-xs font-medium text-green-700/80 flex items-center gap-1">
                            {comunicado.autor_nome}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3" />
                          {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                  </div>
                  
                  <CardTitle className="text-base font-bold text-gray-900 leading-tight mb-0.5 line-clamp-1">
                      {comunicado.titulo}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="p-5 pt-2">
                <p className="text-sm text-gray-500 whitespace-pre-line break-words leading-relaxed mb-3">
                    {conteudoTruncado}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                        {isEdited ? 'Editado recentemente' : 'Publicado no mural'}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-xs font-semibold text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all cursor-pointer" 
                        onClick={() => handleExibirCompleto(comunicado)}
                    >
                        Ler completo
                    </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {mostrarBotaoExibirMais && (
          <div className="flex justify-center pt-2 pb-6">
            <Button 
                variant="outline" 
                onClick={() => setLimiteExibicao(todosComunicados.length)} 
                className="relative rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-green-700 hover:border-green-200 transition-all shadow-sm h-10 px-6 text-xs uppercase tracking-wide font-semibold"
            >
              <ChevronDown className="mr-2 h-3 w-3" />
              Carregar mais comunicados
              {unseenHiddenCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border-2 border-white">
                  {unseenHiddenCount}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      <ComunicadoCompletoDialog comunicado={comunicadoSelecionado} isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}