"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, UserSearch } from "lucide-react";
import { useUnreadCount } from "@/app/context/UnreadCountContext";
import { useApiUrl } from "@/app/context/ApiContext";

export function ChatComponent({ user }) {
  const apiUrl = useApiUrl();
  const meuUserId = user?.id;

  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  
  const messageEndRef = useRef(null);
  const selectedUserRef = useRef(null);
  const { fetchTotalUnreadCount } = useUnreadCount();

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (!meuUserId || !apiUrl) return;

    const newSocket = io(apiUrl);
    setSocket(newSocket);
    newSocket.on('connect', () => newSocket.emit('join', meuUserId));

    const handleNewMessage = (novaMensagem) => {
      const currentUser = selectedUserRef.current; 

      const isForCurrentChat = 
        (novaMensagem.remetente_id === currentUser?.id && novaMensagem.destinatario_id === meuUserId) ||
        (novaMensagem.remetente_id === meuUserId && novaMensagem.destinatario_id === currentUser?.id);

      if (isForCurrentChat) {
        setMessages(mensagensAtuais => [...mensagensAtuais, novaMensagem]);
      } else {
        if (novaMensagem.remetente_id !== meuUserId) {
          // Apenas atualiza a contagem LOCAL para a lista de contatos.
          setUnreadCounts(prevCounts => ({
            ...prevCounts,
            [novaMensagem.remetente_id]: (prevCounts[novaMensagem.remetente_id] || 0) + 1,
          }));
          // A linha que chamava 'fetchTotalUnreadCount' foi REMOVIDA daqui
          // para evitar conflitos com o UnreadCountContext.
        }
      }
    };
    newSocket.on('new_message', handleNewMessage);

    async function initializeChat() {
      try {
        const usersResponse = await fetch(`${apiUrl}/user/paginated?statusConta=ativo&limit=9999999`);
        if (!usersResponse.ok) throw new Error('Falha ao buscar usuários');
        const data = await usersResponse.json();
        const activeUsers = data.users;
        setUsers(activeUsers.filter(u => u.id !== meuUserId));

        const countsResponse = await fetch(`${apiUrl}/msg/unread-counts`, {
          headers: { 'x-user-id': meuUserId.toString() }
        });
        const initialCounts = await countsResponse.json();
        setUnreadCounts(initialCounts);
      } catch (error) {
        console.error("Erro ao inicializar o chat:", error);
      }
    }
    initializeChat();

    return () => {
      newSocket.off('new_message', handleNewMessage);
      newSocket.disconnect();
    };
    // A dependência 'fetchTotalUnreadCount' foi removida, pois não é mais usada diretamente aqui.
  }, [meuUserId, apiUrl]);

  useEffect(() => {
    if (!selectedUser || !meuUserId || !apiUrl) return;
    async function fetchHistory() {
      try {
        const response = await fetch(`${apiUrl}/msg/historico/${selectedUser.id}`, {
          headers: { 'x-user-id': meuUserId.toString() }
        });
        const history = await response.json();
        setMessages(history);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      }
    }
    fetchHistory();
  }, [selectedUser, meuUserId, apiUrl]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser || !socket) return;
    const mensagemData = { remetenteId: meuUserId, destinatarioId: selectedUser.id, conteudo: replyText };
    socket.emit('private_message', mensagemData);
    setReplyText("");
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    if (unreadCounts[user.id] > 0) {
      if (!apiUrl) return;
      try {
        await fetch(`${apiUrl}/msg/mark-as-read/${user.id}`, {
          method: 'PUT',
          headers: { 'x-user-id': meuUserId.toString() }
        });
        // A chamada aqui é correta, pois é uma ação do usuário que afeta a contagem global.
        if (fetchTotalUnreadCount) fetchTotalUnreadCount();
      } catch (error) {
        console.error("Falha ao marcar mensagens como lidas:", error);
      }
    }
    setUnreadCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      delete newCounts[user.id];
      return newCounts;
    });
  };

  const filteredUsers = users.filter(user => user.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!apiUrl) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground">
        Conectando ao servidor de chat...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      <Card className="md:col-span-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
          <div className="relative mt-2">
            <UserSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar por nome..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="flex flex-col">
            {filteredUsers.map((user) => {
              const unreadCount = unreadCounts[user.id] || 0;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={cn("flex flex-col items-start gap-1 border-b p-3 text-left text-sm transition-all hover:bg-accent", selectedUser?.id === user.id && "bg-muted")}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold">{user.nome}</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-auto min-w-[1.25rem] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '+99' : unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground capitalize">{user.cargo}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <CardHeader className="flex flex-row items-center gap-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedUser.nome.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{selectedUser.nome}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{selectedUser.cargo}</p>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={msg.id || index} className={cn("flex items-end gap-2", msg.remetente_id === meuUserId ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-xs rounded-lg px-3 py-2 md:max-w-md", msg.remetente_id === meuUserId ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-sm break-words">{msg.conteudo}</p>
                    <p className="text-right text-xs text-muted-foreground mt-1">{new Date(msg.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
               <div ref={messageEndRef} />
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Textarea
                  placeholder={`Mensagem para ${selectedUser.nome}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[40px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button type="submit" size="icon" disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Selecione um contato para iniciar uma conversa.
          </div>
        )}
      </Card>
    </div>
  );
}