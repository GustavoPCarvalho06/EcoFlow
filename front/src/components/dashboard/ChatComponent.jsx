// =================================================================================
// Arquivo: src/components/dashboard/ChatComponent.jsx
// =================================================================================

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, UserSearch } from "lucide-react";
import { useUnreadCount } from "@/app/context/UnreadCountContext";
import { useApiUrl } from "@/app/context/ApiContext";

// ----------------------------------------------------------------------------------------------------
// COMPONENTE
// ----------------------------------------------------------------------------------------------------
export function ChatComponent({ user, token }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const { socket, fetchTotalMsgUnread } = useUnreadCount();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const messageEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ----------------------------------------------------------------------------------------------------
  // SOCKET
  // ----------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (novaMensagem) => {
      const currentUser = selectedUserRef.current;

      const isFromSelectedUser = novaMensagem.remetente_id === currentUser?.id;
      const isToMe = novaMensagem.destinatario_id === meuUserId;
      const isFromMe = novaMensagem.remetente_id === meuUserId;

      if (isFromSelectedUser && isToMe) {
        setMessages(prev => [...prev, novaMensagem]);
        if (currentUser) markMessagesAsRead(currentUser.id);

      } else if (isFromMe && novaMensagem.destinatario_id === currentUser?.id) {
        setMessages(prev => {
          const exists = prev.some(msg =>
            msg.id === novaMensagem.id ||
            (msg.conteudo === novaMensagem.conteudo && msg.remetente_id === meuUserId)
          );

          return exists ? prev : [...prev, novaMensagem];
        });

      } else if (isToMe && !isFromMe) {
        setUnreadCounts(prev => ({
          ...prev,
          [novaMensagem.remetente_id]: (prev[novaMensagem.remetente_id] || 0) + 1
        }));

        fetchTotalMsgUnread();
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, meuUserId, fetchTotalMsgUnread]);

  // ----------------------------------------------------------------------------------------------------
  // CARREGAR USUÁRIOS E CONTADORES
  // ----------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!meuUserId || !apiUrl || !token) return;

    async function initializeChat() {
      try {
        setIsLoading(true);

        const usersResponse = await fetch(`${apiUrl}/user/paginated?statusConta=ativo&limit=9999999`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await usersResponse.json();
        setUsers(data.users.filter(u => u.id !== meuUserId));

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

  // ----------------------------------------------------------------------------------------------------
  // HISTÓRICO AO SELECIONAR
  // ----------------------------------------------------------------------------------------------------
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

        const historico = await response.json();
        setMessages(historico);

        if (unreadCounts[selectedUser.id] > 0) {
          await markMessagesAsRead(selectedUser.id);
        }
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }

    fetchHistory();
  }, [selectedUser, unreadCounts, meuUserId, apiUrl, token]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------------------------------------------------------------------------------
  // MARCAR COMO LIDA
  // ----------------------------------------------------------------------------------------------------
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

  // ----------------------------------------------------------------------------------------------------
  // ENVIAR MENSAGEM
  // ----------------------------------------------------------------------------------------------------
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser || !socket) return;

    const localMessage = {
      id: "local_" + Date.now(),
      remetente_id: meuUserId,
      destinatario_id: selectedUser.id,
      conteudo: replyText.trim(),
      data_envio: new Date().toISOString()
    };

    setMessages(prev => [...prev, localMessage]);

    socket.emit("private_message", {
      remetenteId: meuUserId,
      destinatarioId: selectedUser.id,
      conteudo: replyText.trim(),
    });

    setReplyText("");
  };

  // ----------------------------------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------------------------------
  const filteredUsers = users.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-primary rounded-full" />
          Carregando conversas...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:grid md:grid-cols-3 gap-4">

      {/* -------------------------------------------------------------- */}
      {/* CONTATOS (LEFT PANEL)                                         */}
      {/* -------------------------------------------------------------- */}
      <Card
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white transition-all",
          "md:col-span-1",
          selectedUser ? "hidden md:flex" : "flex"
        )}
      >
        <CardHeader className="border-b border-gray-300 pb-4 bg-white">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Contatos
          </CardTitle>

          <div className="relative mt-3">
            <UserSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 rounded-lg border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum contato encontrado
            </div>
          ) : (
            filteredUsers.map((u) => {
              const unread = unreadCounts[u.id] || 0;

              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={cn(
                    "w-full px-4 py-3 border-b border-gray-300 text-left flex items-center justify-between",
                    "hover:bg-gray-100 active:bg-gray-200 cursor-pointer transition-all duration-150",
                    selectedUser?.id === u.id &&
                    "bg-gray-100 shadow-inner"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-sm">{u.nome[0]}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium text-gray-900">{u.nome}</p>
                        <p className="text-xs text-gray-500 capitalize">{u.cargo}</p>
                      </div>
                    </div>

                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
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

      {/* -------------------------------------------------------------- */}
      {/* CHAT AREA (RIGHT PANEL)                                       */}
      {/* -------------------------------------------------------------- */}
      <Card
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white transition-all",
          "md:col-span-2",
          selectedUser ? "flex" : "hidden md:flex"
        )}
      >
        {selectedUser ? (
          <>
            {/* MOBILE BACK BUTTON */}
            <div className="md:hidden border-b border-gray-300 p-3 flex items-center gap-3 bg-white">
              <button
                onClick={() => setSelectedUser(null)}
                className="text-primary font-medium"
              >
                ← Voltar
              </button>
              <span className="font-semibold">{selectedUser.nome}</span>
            </div>

            <CardHeader className="hidden md:flex flex-row items-center gap-4 border-b border-gray-200 py-4 bg-white">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedUser.nome[0]}</AvatarFallback>
              </Avatar>

              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">{selectedUser.nome}</CardTitle>
                <p className="text-sm text-gray-500 capitalize">{selectedUser.cargo}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-100">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie a primeira mensagem</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.remetente_id === meuUserId;

                  return (
                    <div
                      key={msg.id || i}
                      className={cn(
                        "flex items-end gap-2 mb-4",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isMe && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {selectedUser.nome[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "max-w-[90%] sm:max-w-md px-4 py-3 rounded-2xl shadow-md",
                          isMe
                            ? "bg-emerald-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        )}
                      >
                        <p className="text-sm break-words">{msg.conteudo}</p>
                        <p
                          className={cn(
                            "text-[11px] mt-1",
                            isMe ? "text-white/80" : "text-gray-400"
                          )}
                        >
                          {new Date(msg.data_envio).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {isMe && (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{user.nome?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}

              <div ref={messageEndRef} />
            </CardContent>

            <CardFooter className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 w-full">
                <Textarea
                  className="min-h-[42px] resize-none rounded-lg border-gray-300 bg-white"
                  placeholder={`Mensagem para ${selectedUser.nome}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
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
                  disabled={!replyText.trim()}
                  className="h-10 w-10 rounded-lg shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 p-8">
            <UserSearch className="h-12 w-12 opacity-40 mb-4" />
            <h3 className="font-semibold text-lg">Selecione um contato</h3>
            <p className="text-sm mt-1">
              Clique em alguém na lista ao lado para iniciar uma conversa.
            </p>
          </div>
        )}
      </Card>
    </div>
  );

}
