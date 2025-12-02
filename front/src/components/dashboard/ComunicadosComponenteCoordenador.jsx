// =================================================================================
// Arquivo: src/components/dashboard/ComunicadosComponenteCoordenador.jsx
// =================================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Pencil, Trash2, Megaphone, User, CalendarDays, Clock, ChevronDown, Loader2 } from "lucide-react";
import { useApiUrl } from "../../app/context/ApiContext"; 
import { cn } from "@/lib/utils";

const inputStyles = "rounded-xl bg-muted/50 border-input text-foreground focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 placeholder:text-muted-foreground";
const primaryButtonStyles = "rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-medium transition-all hover:-translate-y-0.5";


function ComunicadoCompletoDialog({ comunicado, isOpen, onOpenChange }) {
  if (!comunicado) return null;
  const isEdited = !!comunicado.data_edicao;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 gap-0 border border-border bg-card shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-card border-b border-border">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Megaphone className="h-5 w-5" />
                </div>
                <div>
                    <DialogTitle className="text-xl font-bold text-foreground leading-tight">
                        {comunicado.titulo}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {comunicado.autor_nome}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-muted/20">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words">{comunicado.conteudo}</p>
        </div>
        <DialogFooter className="p-4 bg-card border-t border-border">
            <Button onClick={() => onOpenChange(false)} className={primaryButtonStyles}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComunicadoForm({ onSubmit, initialData = null, onClose }) {
    const [titulo, setTitulo] = useState(initialData?.titulo || "");
    const [conteudo, setConteudo] = useState(initialData?.conteudo || "");
    
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ titulo, conteudo }); };
    
    return (
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="p-6 space-y-5 bg-card">
            <div className="space-y-2">
                <Label htmlFor="titulo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Título do Comunicado</Label>
                <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required className={`h-11 ${inputStyles}`} placeholder="Ex: Manutenção programada..." />
            </div>
            <div className="space-y-2">
                <Label htmlFor="conteudo" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conteúdo</Label>
                <Textarea id="conteudo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} required rows={6} className={`resize-none ${inputStyles}`} placeholder="Digite os detalhes do comunicado aqui..." />
            </div>
        </div>
        <DialogFooter className="p-4 bg-muted/20 border-t border-border mt-auto">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive">Cancelar</Button>
            <Button type="submit" className={primaryButtonStyles}>
                {initialData ? 'Salvar Alterações' : 'Publicar Comunicado'}
            </Button>
        </DialogFooter>
      </form>
    );
}


export function ComunicadosComponenteCoordenador({ user, token }) {
    const apiUrl = useApiUrl();
    
    const [todosComunicados, setTodosComunicados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [editingComunicado, setEditingComunicado] = useState(null);
    const [viewingComunicado, setViewingComunicado] = useState(null);
    const [unseenIds, setUnseenIds] = useState(new Set());
    const [editedUnseenIds, setEditedUnseenIds] = useState(new Set());
    const [limiteExibicao, setLimiteExibicao] = useState(3);

    const canManage = user?.cargo === 'coordenador' || user?.cargo === 'administrador';

    const fetchData = useCallback(async () => {
        if (!user?.id || !apiUrl || !token) { 
            setLoading(false); 
            return; 
        }
        
        const headers = { 
            'Content-Type': 'application/json',
            'x-user-id': user.id.toString(),
            'Authorization': `Bearer ${token}` 
        };

        try {
            const [comunicadosRes, unseenIdsRes] = await Promise.all([
                fetch(`${apiUrl}/comunicados`, { headers }),
                fetch(`${apiUrl}/comunicados/unseen-ids-detailed`, { headers })
            ]);
            
            if (comunicadosRes.ok) setTodosComunicados(await comunicadosRes.json());
            if (unseenIdsRes.ok) {
                const data = await unseenIdsRes.json();
                setUnseenIds(new Set(data.new_ids));
                setEditedUnseenIds(new Set(data.edited_ids));
            }
        } catch (err) { 
            console.error("Erro ao buscar dados:", err); 
            setError("Não foi possível carregar os comunicados.");
        } 
        finally { setLoading(false); }
    }, [user, apiUrl, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!apiUrl) return;
        const socket = io(apiUrl);
        socket.on('comunicados_atualizados', fetchData);
        return () => { socket.off('comunicados_atualizados', fetchData); socket.disconnect(); };
    }, [fetchData, apiUrl]);

    const handleOpenForm = (comunicado = null) => { setEditingComunicado(comunicado); setIsFormOpen(true); };
    const handleCloseForm = () => { setIsFormOpen(false); setEditingComunicado(null); };

    const handleExibirCompleto = async (comunicado) => {
        if (!apiUrl || !token) return;
        setViewingComunicado(comunicado);
        setIsViewOpen(true);
        
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

    const handleSubmit = async (formData) => {
        if (!apiUrl || !token) return;
        const isEditing = !!editingComunicado;
        const url = isEditing ? `${apiUrl}/comunicados/${editingComunicado.id}` : `${apiUrl}/comunicados`;
        const method = isEditing ? 'PUT' : 'POST';
        const body = { ...formData, ...(!isEditing && { autor_id: user.id }) };
        
        try {
            const res = await fetch(url, { 
                method, 
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-user-id': user.id.toString(),
                    'Authorization': `Bearer ${token}`
                }, 
                body: JSON.stringify(body) 
            });
            if (!res.ok) throw new Error('Falha ao salvar');
            handleCloseForm();
        } catch (error) { console.error("Erro ao salvar:", error); }
    };

    const handleDelete = async (id) => {
        if (!apiUrl || !token) return;
        try { 
            await fetch(`${apiUrl}/comunicados/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }); 
        }
        catch (error) { console.error("Erro ao deletar:", error); }
    };

    const truncarTexto = (texto, limite) => (texto.length > limite ? { texto: texto.substring(0, limite) + "...", truncado: true } : { texto, truncado: false });
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
                <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {canManage && (
                <div className="flex justify-end">
                    <Button onClick={() => handleOpenForm()} className={`${primaryButtonStyles} px-5 h-11`}>
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        Novo Comunicado
                    </Button>
                </div>
            )}
            
            {todosComunicados.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center flex flex-col items-center bg-muted/20">
                    <div className="h-12 w-12 bg-card rounded-full flex items-center justify-center mb-3 border border-border shadow-sm">
                        <Megaphone className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Mural vazio</p>
                    <p className="text-sm text-muted-foreground">Nenhum comunicado publicado ainda.</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto h-[calc(100vh-16rem)] pr-2 scrollbar-thin scrollbar-thumb-muted pb-4">
                    {comunicadosVisiveis.map((comunicado) => {
                        const { texto: conteudoTruncado } = truncarTexto(comunicado.conteudo, 200);
                        const isNew = unseenIds.has(comunicado.id);
                        const isEditedAndUnseen = editedUnseenIds.has(comunicado.id);
                        const isEdited = !!comunicado.data_edicao;

                        return (
                            <Card 
                                key={comunicado.id} 
                                className={cn(
                                    "group relative overflow-hidden rounded-xl border transition-all duration-300 bg-card",
                                    isNew 
                                        ? "border-l-[4px] border-l-primary border-y-primary/20 border-r-primary/20 bg-primary/5 shadow-md shadow-primary/10" 
                                        : "border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
                                )}
                            >
                                <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2">
                                    <Avatar className={cn("h-11 w-11 border-2", isNew ? "border-primary/30" : "border-border")}>
                                        <AvatarFallback className={cn("text-sm font-bold", isNew ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                            {comunicado.autor_nome.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {isNew && <Badge className="h-5 px-1.5 bg-green-500 hover:bg-green-600 text-white border-0 text-[10px] font-bold">NOVO</Badge>}
                                                {isEditedAndUnseen && <Badge className="h-5 px-1.5 bg-orange-500 hover:bg-orange-600 text-white border-0 text-[10px] font-bold">EDITADO</Badge>}
                                                <span className="text-xs font-medium text-primary/80">{comunicado.autor_nome}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                                                <Clock className="h-3 w-3" />
                                                {new Date(isEdited ? comunicado.data_edicao : comunicado.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                        <CardTitle className="text-base font-bold text-foreground leading-tight mb-0.5">{comunicado.titulo}</CardTitle>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-5 pt-2">
                                    <p className="text-sm text-muted-foreground whitespace-pre-line break-words leading-relaxed">{conteudoTruncado}</p>
                                    <Button variant="link" className="p-0 h-auto mt-2 text-xs font-semibold text-primary" onClick={() => handleExibirCompleto(comunicado)}>Exibir mais...</Button>
                                </CardContent>
                                
                                {canManage && (
                                    <CardFooter className="p-4 pt-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenForm(comunicado)} className="h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10">
                                            <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Excluir
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-2xl border-border bg-card shadow-xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-foreground">Excluir Comunicado?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-muted-foreground">
                                                        Esta ação removerá o comunicado permanentemente do mural de todos os usuários.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl border-border bg-card text-foreground hover:bg-muted">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(comunicado.id)} className="rounded-xl bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20 border-none">Sim, excluir</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardFooter>
                                )}
                            </Card>
                        );
                    })}
                    
                    {mostrarBotaoExibirMais && (
                      <div className="flex justify-center py-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setLimiteExibicao(todosComunicados.length)} 
                            className="relative rounded-xl border-border bg-card hover:bg-muted text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm h-10 px-6 text-xs uppercase tracking-wide font-semibold"
                        >
                          <ChevronDown className="mr-2 h-3 w-3" />
                          Ver todos os comunicados
                          {unseenHiddenCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-md border-2 border-card">
                              {unseenHiddenCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                </div>
            )}
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 gap-0 border border-border bg-card shadow-2xl overflow-hidden">
                    <DialogHeader className="p-6 pb-4 bg-card border-b border-border">
                        <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                {editingComunicado ? <Pencil className="h-5 w-5 text-primary" /> : <PlusCircle className="h-5 w-5 text-primary" />}
                            </div>
                            {editingComunicado ? 'Editar Comunicado' : 'Novo Comunicado'}
                        </DialogTitle>
                    </DialogHeader>
                    <ComunicadoForm onSubmit={handleSubmit} initialData={editingComunicado} onClose={handleCloseForm} />
                </DialogContent>
            </Dialog>
            
            <ComunicadoCompletoDialog comunicado={viewingComunicado} isOpen={isViewOpen} onOpenChange={setIsViewOpen} />
        </div>
    );
}