// src/components/dashboard/ComunicadosComponenteCoordenador.jsx (VERSÃO FINAL)
"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";

function ComunicadoCompletoDialog({ comunicado, isOpen, onOpenChange }) {
  if (!comunicado) return null;
  const isEdited = !!comunicado.data_edicao;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{comunicado.titulo}</DialogTitle><CardDescription>{isEdited ? 'Editado' : 'Postado'} por {comunicado.autor_nome} • {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</CardDescription></DialogHeader><div className="mt-4 max-h-[60vh] overflow-y-auto pr-4"><p className="text-sm text-muted-foreground whitespace-pre-line break-words">{comunicado.conteudo}</p></div></DialogContent></Dialog>
  );
}

function ComunicadoForm({ onSubmit, initialData = null, onClose }) {
    const [titulo, setTitulo] = useState(initialData?.titulo || "");
    const [conteudo, setConteudo] = useState(initialData?.conteudo || "");
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ titulo, conteudo }); };
    return (<form onSubmit={handleSubmit} className="grid gap-4 py-4"><div className="grid gap-2"><Label htmlFor="titulo">Título</Label><Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required /></div><div className="grid gap-2"><Label htmlFor="conteudo">Conteúdo</Label><Textarea id="conteudo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required rows={8} /></div><DialogFooter><DialogClose asChild><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button></DialogClose><Button type="submit">Salvar Comunicado</Button></DialogFooter></form>);
}

export function ComunicadosComponenteCoordenador({ user }) {
    const [todosComunicados, setTodosComunicados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingComunicado, setEditingComunicado] = useState(null);
    const [viewingComunicado, setViewingComunicado] = useState(null);
    const [unseenIds, setUnseenIds] = useState(new Set());
    const [editedUnseenIds, setEditedUnseenIds] = useState(new Set());
    const [limiteExibicao, setLimiteExibicao] = useState(3);

    const canManage = user?.cargo === 'coordenador' || user?.cargo === 'administrador';

    const fetchData = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }
        try {
            const [comunicadosRes, unseenIdsRes] = await Promise.all([
                fetch('http://localhost:3001/comunicados'),
                fetch('http://localhost:3001/comunicados/unseen-ids-detailed', { headers: { 'x-user-id': user.id.toString() } })
            ]);
            if (comunicadosRes.ok) setTodosComunicados(await comunicadosRes.json());
            if (unseenIdsRes.ok) {
                const data = await unseenIdsRes.json();
                setUnseenIds(new Set(data.new_ids));
                setEditedUnseenIds(new Set(data.edited_ids));
            }
        } catch (error) { console.error("Erro ao buscar dados:", error); } 
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const socket = io('http://localhost:3001');
        socket.on('comunicados_atualizados', fetchData);
        return () => { socket.off('comunicados_atualizados', fetchData); socket.disconnect(); };
    }, [fetchData]);

    const handleOpenForm = (comunicado = null) => { setEditingComunicado(comunicado); setIsFormOpen(true); };
    const handleCloseForm = () => { setIsFormOpen(false); setEditingComunicado(null); };

    const handleExibirCompleto = async (comunicado) => {
        setViewingComunicado(comunicado);
        setIsViewOpen(true);
        const isUnseen = unseenIds.has(comunicado.id) || editedUnseenIds.has(comunicado.id);
        if (isUnseen && user?.id) {
            try {
                await fetch(`http://localhost:3001/comunicados/mark-one-seen/${comunicado.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': user.id.toString() } });
                setUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
                setEditedUnseenIds(prev => { const next = new Set(prev); next.delete(comunicado.id); return next; });
            } catch (error) { console.error("Erro ao marcar como visto:", error); }
        }
    };

    const handleSubmit = async (formData) => {
        const isEditing = !!editingComunicado;
        const url = isEditing ? `http://localhost:3001/comunicados/${editingComunicado.id}` : 'http://localhost:3001/comunicados';
        const method = isEditing ? 'PUT' : 'POST';
        const body = { ...formData, ...(!isEditing && { autor_id: user.id }) };
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(isEditing && { 'x-user-id': user.id.toString() }) }, body: JSON.stringify(body) });
            if (!res.ok) throw new Error('Falha ao salvar');
            handleCloseForm();
        } catch (error) { console.error("Erro ao salvar:", error); }
    };

    const handleDelete = async (id) => {
        try { await fetch(`http://localhost:3001/comunicados/${id}`, { method: 'DELETE' }); }
        catch (error) { console.error("Erro ao deletar:", error); }
    };

    const truncarTexto = (texto, limite) => (texto.length > limite ? { texto: texto.substring(0, limite) + "...", truncado: true } : { texto, truncado: false });

    const comunicadosVisiveis = todosComunicados.slice(0, limiteExibicao);
    const mostrarBotaoExibirMais = todosComunicados.length > limiteExibicao;

    // [NOVO] Lógica para calcular quantos comunicados não vistos estão "escondidos"
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

    return (
        <div className="space-y-4">
            {canManage && <div className="flex justify-end"><Button onClick={() => handleOpenForm()}><IconPlus className="mr-2 h-4 w-4" /> Novo Comunicado</Button></div>}
            
            {todosComunicados.length === 0 ? <p className="text-center text-muted-foreground pt-8">Nenhum comunicado no mural.</p> : (
                <div className="overflow-y-auto h-[calc(100vh-15rem)] pr-2 space-y-4">
                    {comunicadosVisiveis.map((comunicado) => {
                        const { texto: conteudoTruncado } = truncarTexto(comunicado.conteudo, 200);
                        const isNew = unseenIds.has(comunicado.id);
                        const isEditedAndUnseen = editedUnseenIds.has(comunicado.id);
                        const isEdited = !!comunicado.data_edicao;

                        return (
                            <Card key={comunicado.id} className="relative">
                                {isNew ? (<span className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Novo</span>)
                                 : isEditedAndUnseen && (<span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Editado</span>)}
                                
                                <CardHeader className="flex flex-row items-start gap-4">
                                    <Avatar className="h-10 w-10 border"><AvatarFallback>{comunicado.autor_nome.charAt(0)}</AvatarFallback></Avatar>
                                    <div className="flex-1">
                                        <CardTitle>{comunicado.titulo}</CardTitle>
                                        <CardDescription>{isEdited ? 'Editado' : 'Postado'} por {comunicado.autor_nome} • {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR')}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{conteudoTruncado}</p>
                                    <Button variant="link" className="p-0 h-auto mt-2 text-sm" onClick={() => handleExibirCompleto(comunicado)}>Exibir mais...</Button>
                                </CardContent>
                                {canManage && (
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenForm(comunicado)}><IconPencil className="mr-2 h-4 w-4" /> Editar</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><IconTrash className="mr-2 h-4 w-4" /> Excluir</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(comunicado.id)}>Continuar</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                )}
                            </Card>
                        );
                    })}
                    
                    {mostrarBotaoExibirMais && (
                      <div className="flex justify-center py-4">
                        {/* [MODIFICADO] O botão agora é relativo para posicionar a notificação */}
                        <Button variant="outline" onClick={() => setLimiteExibicao(todosComunicados.length)} className="relative">
                          Exibir Todos os Comunicados
                          {/* [NOVO] Notificação que só aparece se houver comunicados não vistos escondidos */}
                          {unseenHiddenCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                              {unseenHiddenCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                </div>
            )}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}><DialogContent><DialogHeader><DialogTitle>{editingComunicado ? 'Editar' : 'Criar'} Comunicado</DialogTitle></DialogHeader><ComunicadoForm onSubmit={handleSubmit} initialData={editingComunicado} onClose={handleCloseForm} /></DialogContent></Dialog>
            <ComunicadoCompletoDialog comunicado={viewingComunicado} isOpen={isViewOpen} onOpenChange={setIsViewOpen} />
        </div>
    );
}