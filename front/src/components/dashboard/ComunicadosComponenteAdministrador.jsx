// src/components/dashboard/ComunicadosComponenteAdministrador.jsx (VERSÃO FINAL)
"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function ComunicadoCompletoDialog({ comunicado, isOpen, onOpenChange }) {
  if (!comunicado) return null;
  const isEdited = !!comunicado.data_edicao;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{comunicado.titulo}</DialogTitle>
          <CardDescription>
            {isEdited ? 'Editado' : 'Postado'} por {comunicado.autor_nome} • {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </CardDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{comunicado.conteudo}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ComunicadosComponenteAdministrador({ user }) {
  const [todosComunicados, setTodosComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limiteExibicao, setLimiteExibicao] = useState(3);
  const [comunicadoSelecionado, setComunicadoSelecionado] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [unseenIds, setUnseenIds] = useState(new Set());
  const [editedUnseenIds, setEditedUnseenIds] = useState(new Set());

  const fetchData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const comunicadosRes = await fetch('http://localhost:3001/comunicados');
      if (!comunicadosRes.ok) throw new Error('Falha ao buscar comunicados');
      const comunicadosData = await comunicadosRes.json();
      setTodosComunicados(comunicadosData);

      try {
        const unseenIdsRes = await fetch('http://localhost:3001/comunicados/unseen-ids-detailed', {
          headers: { 'x-user-id': user.id.toString() }
        });
        if (unseenIdsRes.ok) {
          const unseenData = await unseenIdsRes.json();
          setUnseenIds(new Set(unseenData.new_ids));
          setEditedUnseenIds(new Set(unseenData.edited_ids));
        }
      } catch (error) { console.error("Falha ao buscar IDs não vistos:", error); }
    } catch (error) { console.error("Erro ao buscar dados do mural:", error); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('comunicados_atualizados', fetchData);
    return () => { socket.off('comunicados_atualizados', fetchData); socket.disconnect(); };
  }, [fetchData]);

  const truncarTexto = (texto, limite) => (texto.length > limite ? { texto: texto.substring(0, limite) + "...", truncado: true } : { texto, truncado: false });

  const handleExibirCompleto = async (comunicado) => {
    setComunicadoSelecionado(comunicado);
    setIsDialogOpen(true);
    const isUnseen = unseenIds.has(comunicado.id) || editedUnseenIds.has(comunicado.id);
    if (isUnseen && user?.id) {
      try {
        await fetch(`http://localhost:3001/comunicados/mark-one-seen/${comunicado.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() } });
        setUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
        setEditedUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
      } catch (error) { console.error("Erro ao marcar como visto:", error); }
    }
  };
  
  const comunicadosVisiveis = todosComunicados.slice(0, limiteExibicao);
  const mostrarBotaoExibirMais = todosComunicados.length > limiteExibicao;

  // Lógica para calcular quantos comunicados não vistos estão "escondidos"
  let unseenHiddenCount = 0;
  if (mostrarBotaoExibirMais) {
      const hiddenComunicados = todosComunicados.slice(limiteExibicao);
      hiddenComunicados.forEach(comunicado => {
          if (unseenIds.has(comunicado.id) || editedUnseenIds.has(comunicado.id)) {
              unseenHiddenCount++;
          }
      });
  }

  if (loading) return <p className="text-center text-muted-foreground">Carregando...</p>;
  if (todosComunicados.length === 0) return <p className="text-center text-muted-foreground">Nenhum comunicado no mural.</p>;

  return (
    <>
      <div className="space-y-4 overflow-y-auto h-[calc(100vh-12rem)] pr-2">
        {comunicadosVisiveis.map((comunicado) => {
          const { texto: conteudoTruncado } = truncarTexto(comunicado.conteudo, 150);
          const isNew = unseenIds.has(comunicado.id);
          const isEditedAndUnseen = editedUnseenIds.has(comunicado.id);
          const isEdited = !!comunicado.data_edicao;

          return (
            <Card key={comunicado.id} className="relative">
              {isNew ? (
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Novo</span>
              ) : isEditedAndUnseen && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Editado</span>
              )}
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="h-10 w-10 border"><AvatarFallback>{comunicado.autor_nome.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <CardTitle>{comunicado.titulo}</CardTitle>
                  <CardDescription>{isEdited ? 'Editado' : 'Postado'} por {comunicado.autor_nome} • {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{conteudoTruncado}</p>
                <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={() => handleExibirCompleto(comunicado)}>
                  Exibir mais...
                </Button>
              </CardContent>
            </Card>
          );
        })}

        {mostrarBotaoExibirMais && (
          <div className="flex justify-center py-4">
            {/* O botão agora é relativo para posicionar a notificação */}
            <Button variant="outline" onClick={() => setLimiteExibicao(todosComunicados.length)} className="relative">
              Exibir Todos os Comunicados
              {/* Notificação que só aparece se houver comunicados não vistos escondidos */}
              {unseenHiddenCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
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