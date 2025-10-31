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

// Conectar ao servidor. O ideal é que a URL venha de uma variável de ambiente.
const socket = io('http://localhost:3001');

// 1. O componente agora recebe 'user' e 'token' como propriedades
export function ChatComponent({ user, token }) {
  // === ESTADO DO COMPONENTE ===
  
  // 2. O ID do usuário logado agora vem da propriedade 'user'
  const [meuUserId, setMeuUserId] = useState(user?.id);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messageEndRef = useRef(null); // Referência para scrollar para a última mensagem

  // === EFEITOS (LÓGICA PRINCIPAL) ===

  // Roda uma vez para buscar a lista de usuários e configurar o WebSocket
  useEffect(() => {
    if (!meuUserId || !token) return; // Não faz nada se não tiver os dados do usuário

    // A) Buscar todos os usuários para a lista de contatos
    async function fetchUsers() {
      try {
        const response = await fetch('http://localhost:3001/user/get', {
          headers: {
            // 3. Usa o token real recebido via props
            'Authorization': `Bearer ${token}`
          }
        });
        const allUsers = await response.json();
        setUsers(allUsers.filter(u => u.id !== meuUserId));
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }

    fetchUsers();

    // B) Conectar ao WebSocket e se identificar
    socket.emit('join', meuUserId);

    // C) Ouvir por novas mensagens em tempo real
    const handleNewMessage = (novaMensagem) => {
      if (novaMensagem.remetente_id === selectedUser?.id || novaMensagem.destinatario_id === selectedUser?.id) {
          setMessages(mensagensAtuais => [...mensagensAtuais, novaMensagem]);
      }
    };
    socket.on('new_message', handleNewMessage);
    
    // D) Função de limpeza ao sair do componente
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [meuUserId, token, selectedUser]); // Re-executa se o usuário logado ou o token mudar

  // Roda toda vez que o usuário selecionado muda, para buscar o histórico da conversa
  useEffect(() => {
    if (!selectedUser || !token) return;

    async function fetchHistory() {
      try {
        const response = await fetch(`http://localhost:3001/msg/historico/${selectedUser.id}`, {
          headers: { 
            // 4. Usa o token real aqui também
            'Authorization': `Bearer ${token}` 
          }
        });
        const history = await response.json();
        setMessages(history);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        setMessages([]);
      }
    }

    fetchHistory();
  }, [selectedUser, token]);

  // Efeito para scrollar para o final da conversa quando uma nova mensagem chega
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // === FUNÇÕES DE MANIPULAÇÃO ===

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser) return;

    const mensagemData = {
      destinatarioId: selectedUser.id,
      conteudo: replyText
    };

    socket.emit('private_message', mensagemData);
    setReplyText("");
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setMessages([]);
  };

  const filteredUsers = users.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === RENDERIZAÇÃO (JSX) ===

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Coluna da Lista de Usuários */}
      <Card className="md:col-span-1 flex flex-col">
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
        <CardContent className="p-0 flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={cn(
                  "flex flex-col items-start gap-1 border-b p-3 text-left text-sm transition-all hover:bg-accent",
                  selectedUser?.id === user.id && "bg-muted"
                )}
              >
                <span className="font-semibold">{user.nome}</span>
                <p className="text-xs font-medium text-muted-foreground capitalize">{user.cargo}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coluna do Chat Ativo */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedUser ? (
          <>
            <CardHeader className="flex flex-row items-center gap-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedUser.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{selectedUser.nome}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{selectedUser.cargo}</p>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex items-end gap-2", msg.remetente_id === meuUserId ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-xs rounded-lg px-3 py-2 md:max-w-md", msg.remetente_id === meuUserId ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    <p className="text-sm">{msg.conteudo}</p>
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