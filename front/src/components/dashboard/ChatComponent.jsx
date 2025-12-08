"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, UserSearch, WifiOff } from "lucide-react"; // Adicionei ícone de offline
import { useUnreadCount } from "@/app/context/UnreadCountContext";
import { useApiUrl } from "@/app/context/ApiContext";

export function ChatComponent({ user, token }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  // Pegamos o socket do Contexto
  const { socket, fetchTotalMsgUnread } = useUnreadCount();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Novo estado para controlar visualmente se o socket está conectado
  const [isSocketConnected, setIsSocketConnected] = useState(socket?.connected || false);

  const messageEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  // Atualiza referência do usuário selecionado para uso dentro dos listeners
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // 1. Monitora o status da conexão do Socket em tempo real
  useEffect(() => {
    if (!socket) return;

    // Atualiza estado inicial
    setIsSocketConnected(socket.connected);

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  // 2. Listener de Mensagens (Lógica Principal)
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (novaMensagem) => {
      const currentUser = selectedUserRef.current;

      const isFromSelectedUser = novaMensagem.remetente_id === currentUser?.id;
      const isToMe = novaMensagem.destinatario_id === meuUserId;
      const isFromMe = novaMensagem.remetente_id === meuUserId;

      // Se a mensagem é da pessoa com quem estou falando agora
      if (isFromSelectedUser && isToMe) {
        setMessages(prev => [...prev, novaMensagem]);
        // Marca como lida imediatamente
        if (currentUser) markMessagesAsRead(currentUser.id);
      } 
      // Se a mensagem é minha (enviada por outro dispositivo ou aba)
      else if (isFromMe && novaMensagem.destinatario_id === currentUser?.id) {
        setMessages(prev => {
          const exists = prev.some(msg =>
            msg.id === novaMensagem.id ||
            (msg.conteudo === novaMensagem.conteudo && msg.remetente_id === meuUserId)
          );
          return exists ? prev : [...prev, novaMensagem];
        });
      } 
      // Se é mensagem de outra pessoa (notificação)
      else if (isToMe && !isFromSelectedUser) {
        setUnreadCounts(prev => ({
          ...prev,
          [novaMensagem.remetente_id]: (prev[novaMensagem.remetente_id] || 0) + 1
        }));
        fetchTotalMsgUnread();
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, meuUserId, fetchTotalMsgUnread]);

  // 3. Inicialização de Dados (Lista de Usuários e Contagens)
  useEffect(() => {
    if (!meuUserId || !apiUrl || !token) return;

    async function initializeChat() {
      try {
        setIsLoading(true);

        const usersResponse = await fetch(`${apiUrl}/user/paginated?statusConta=ativo&limit=9999999`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (usersResponse.ok) {
          const data = await usersResponse.json();
          setUsers(data.users.filter(u => u.id !== meuUserId));
        }

        const countsResponse = await fetch(`${apiUrl}/msg/unread-counts`, {
          headers: {
            "x-user-id": meuUserId.toString(),
            "Authorization": `Bearer ${token}`
          }
        });

        if (countsResponse.ok) {
          setUnreadCounts(await countsResponse.json());
        }
      } catch (error) {
        console.error("Erro ao carregar chat:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeChat();
  }, [meuUserId, apiUrl, token]);

  // 4. Carregar Histórico
  useEffect(() => {
    if (!selectedUser || !meuUserId || !apiUrl || !token) return;

    async function fetchHistory() {
      try {
        const response = await fetch(`${apiUrl}/msg/historico/${selectedUser.id}`, {
          headers: {
            "x-user-id": meuUserId.toString(),
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const historico = await response.json();
          setMessages(historico);

          if (unreadCounts[selectedUser.id] > 0) {
            await markMessagesAsRead(selectedUser.id);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }

    fetchHistory();
  }, [selectedUser, apiUrl, token, meuUserId]);

  // Scroll automático
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markMessagesAsRead = async (remetenteId) => {
    if (!apiUrl || !meuUserId || !token) return;
    try {
      await fetch(`${apiUrl}/msg/mark-as-read/${remetenteId}`, {
        method: "PUT",
        headers: {
          "x-user-id": meuUserId.toString(),
          "Authorization": `Bearer ${token}`
        }
      });
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[remetenteId];
        return newCounts;
      });
      fetchTotalMsgUnread();
    } catch (error) {
      console.error("Falha ao marcar como lida:", error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // Verificação rigorosa do socket
    if (!socket || !socket.connected) {
      console.warn("Tentativa de envio sem conexão socket.");
      alert("Conexão perdida. Aguarde a reconexão...");
      return;
    }

    if (!replyText.trim() || !selectedUser) return;

    // Mensagem otimista (local)
    const localMessage = {
      id: "local_" + Date.now(),
      remetente_id: meuUserId,
      destinatario_id: selectedUser.id,
      conteudo: replyText.trim(),
      data_envio: new Date().toISOString()
    };

    setMessages(prev => [...prev, localMessage]);

    // Envio real
    socket.emit("private_message", {
      remetenteId: meuUserId,
      destinatarioId: selectedUser.id,
      conteudo: replyText.trim(),
    });

    setReplyText("");
  };

  const filteredUsers = users.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-2 border-muted border-t-primary rounded-full" />
          Carregando conversas...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:grid md:grid-cols-3 gap-4">
      {/* --- LISTA DE CONTATOS --- */}
      <Card className={cn("flex flex-col overflow-hidden rounded-2xl border shadow-md bg-card transition-all", "md:col-span-1", selectedUser ? "hidden md:flex" : "flex")}>
        <CardHeader className="border-b border-border pb-4 bg-card">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-foreground">Contatos</CardTitle>
            {!isSocketConnected && (
              <span className="text-xs text-destructive flex items-center gap-1 font-bold animate-pulse">
                <WifiOff className="h-3 w-3" /> Offline
              </span>
            )}
          </div>
          <div className="relative mt-3">
            <UserSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 rounded-lg border-input bg-background focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Nenhum contato encontrado</div>
          ) : (
            filteredUsers.map((u) => {
              const unread = unreadCounts[u.id] || 0;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "w-full px-4 py-3 border-b border-border text-left flex items-center justify-between",
                    "hover:bg-muted/50 active:bg-muted cursor-pointer transition-all duration-150",
                    selectedUser?.id === u.id && "bg-muted/50 shadow-inner"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm bg-muted text-foreground">{u.nome[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{u.nome}</p>
                        <p className="text-xs text-muted-foreground capitalize">{u.cargo}</p>
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-semibold rounded-full px-2 py-0.5">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* --- ÁREA DE CHAT --- */}
      <Card className={cn("flex flex-col overflow-hidden rounded-2xl border shadow-md bg-card transition-all", "md:col-span-2", selectedUser ? "flex" : "hidden md:flex")}>
        {selectedUser ? (
          <>
            <div className="md:hidden border-b border-border p-3 flex items-center gap-3 bg-card">
              <button onClick={() => setSelectedUser(null)} className="text-primary font-medium">← Voltar</button>
              <span className="font-semibold text-foreground">{selectedUser.nome}</span>
            </div>

            <CardHeader className="hidden md:flex flex-row items-center gap-4 border-b border-border py-4 bg-card">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-foreground">{selectedUser.nome[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">{selectedUser.nome}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{selectedUser.cargo}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50 dark:bg-muted/20 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie a primeira mensagem</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.remetente_id === meuUserId;
                  return (
                    <div key={msg.id || i} className={cn("flex items-end gap-2 mb-4", isMe ? "justify-end" : "justify-start")}>
                      {!isMe && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{selectedUser.nome[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("max-w-[90%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm", isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground")}>
                        <p className="text-sm break-words">{msg.conteudo}</p>
                        <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {new Date(msg.data_envio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {isMe && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user.nome?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </CardContent>

            <CardFooter className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
                <Textarea
                  className="min-h-[42px] resize-none rounded-lg border-input bg-background text-foreground focus:ring-primary/20"
                  placeholder={isSocketConnected ? `Mensagem para ${selectedUser.nome}...` : "Reconectando..."}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={!isSocketConnected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!replyText.trim() || !isSocketConnected}
                  className={cn("h-10 w-10 rounded-lg shadow-sm text-primary-foreground", isSocketConnected ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground")}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-muted-foreground p-8">
            <UserSearch className="h-12 w-12 opacity-40 mb-4" />
            <h3 className="font-semibold text-lg text-foreground">Selecione um contato</h3>
            <p className="text-sm mt-1">Clique em alguém na lista ao lado para iniciar uma conversa.</p>
          </div>
        )}
      </Card>
    </div>
  );
}