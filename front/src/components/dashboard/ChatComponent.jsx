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

export function ChatComponent({ user }) {
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

  // Atualiza ref do usuário selecionado
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // Efeito para configurar listeners do socket para o CHAT
  useEffect(() => {
    if (!socket) {
      console.log('❌ Socket não disponível no chat');
      return;
    }

    console.log('🎯 Configurando listeners do chat');

    const handleNewMessage = (novaMensagem) => {
      console.log('💬 Nova mensagem no chat:', novaMensagem);
      
      const currentUser = selectedUserRef.current;

      // Verifica se a mensagem é para a conversa atual
      const isFromSelectedUser = novaMensagem.remetente_id === currentUser?.id;
      const isToMe = novaMensagem.destinatario_id === meuUserId;
      const isFromMe = novaMensagem.remetente_id === meuUserId;

      if (isFromSelectedUser && isToMe) {
        // Adiciona mensagem recebida ao histórico
        setMessages(prev => [...prev, novaMensagem]);
        
        // Marca como lida automaticamente se for mensagem recebida
        if (currentUser) {
          markMessagesAsRead(currentUser.id);
        }
      } else if (isFromMe && novaMensagem.destinatario_id === currentUser?.id) {
        // CORREÇÃO: Se é uma mensagem que eu enviei, apenas atualiza se não existir
        setMessages(prev => {
          // Verifica se já existe uma mensagem com este conteúdo (para evitar duplicação)
          const mensagemExiste = prev.some(msg => 
            msg.id === novaMensagem.id || 
            (msg.conteudo === novaMensagem.conteudo && msg.remetente_id === meuUserId)
          );
          
          if (!mensagemExiste) {
            return [...prev, novaMensagem];
          }
          return prev;
        });
      } else if (isToMe && !isFromMe) {
        // Atualiza contador para outras conversas EM TEMPO REAL
        setUnreadCounts(prev => ({
          ...prev,
          [novaMensagem.remetente_id]: (prev[novaMensagem.remetente_id] || 0) + 1
        }));
        
        // Atualiza contagem total na sidebar EM TEMPO REAL
        fetchTotalMsgUnread();
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, meuUserId, fetchTotalMsgUnread]);

  // Buscar usuários e contagens iniciais
  useEffect(() => {
    if (!meuUserId || !apiUrl) return;

    async function initializeChat() {
      try {
        console.log('🔄 Inicializando chat...');
        setIsLoading(true);
        
        // Buscar usuários
        const usersResponse = await fetch(`${apiUrl}/user/paginated?statusConta=ativo&limit=9999999`);
        if (!usersResponse.ok) throw new Error("Falha ao buscar usuários");
        
        const data = await usersResponse.json();
        setUsers(data.users.filter(u => u.id !== meuUserId));

        // Buscar contagens não lidas
        const countsResponse = await fetch(`${apiUrl}/msg/unread-counts`, {
          headers: { 'x-user-id': meuUserId.toString() }
        });
        if (countsResponse.ok) {
          const counts = await countsResponse.json();
          setUnreadCounts(counts);
          console.log('📊 Contagens iniciais:', counts);
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar o chat:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeChat();
  }, [meuUserId, apiUrl]);

  // Buscar histórico quando selecionar usuário
  useEffect(() => {
    if (!selectedUser || !meuUserId || !apiUrl) return;

    async function fetchHistory() {
      try {
        const response = await fetch(`${apiUrl}/msg/historico/${selectedUser.id}`, {
          headers: { 'x-user-id': meuUserId.toString() }
        });
        if (!response.ok) throw new Error("Falha ao buscar histórico");
        
        const historico = await response.json();
        setMessages(historico);
        
        // Marcar como lida ao abrir a conversa
        if (unreadCounts[selectedUser.id] > 0) {
          await markMessagesAsRead(selectedUser.id);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
      }
    }

    fetchHistory();
  }, [selectedUser, meuUserId, apiUrl]);

  // Rolagem automática para a última mensagem
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para marcar mensagens como lidas
  const markMessagesAsRead = async (remetenteId) => {
    if (!apiUrl || !meuUserId) return;
    
    try {
      await fetch(`${apiUrl}/msg/mark-as-read/${remetenteId}`, {
        method: 'PUT',
        headers: { 'x-user-id': meuUserId.toString() }
      });
      
      // Atualizar contagens locais
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[remetenteId];
        return newCounts;
      });
      
      // Atualizar contagem total
      fetchTotalMsgUnread();
    } catch (error) {
      console.error("❌ Falha ao marcar mensagens como lidas:", error);
    }
  };

  // Enviar mensagem - CORREÇÃO: Cria mensagem local APENAS para feedback visual
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUser || !socket) {
      console.log('⚠️ Não pode enviar:', { 
        replyText: !!replyText.trim(), 
        selectedUser: !!selectedUser, 
        socket: !!socket 
      });
      return;
    }

    console.log('📤 Enviando mensagem:', { 
      remetenteId: meuUserId, 
      destinatarioId: selectedUser.id 
    });
    
    const mensagemData = { 
      remetenteId: meuUserId, 
      destinatarioId: selectedUser.id, 
      conteudo: replyText.trim()
    };
    
    // CORREÇÃO: Cria uma mensagem local APENAS para feedback visual imediato
    const mensagemLocal = {
      id: `local_${Date.now()}_${Math.random()}`, // ID único local
      remetente_id: meuUserId,
      destinatario_id: selectedUser.id,
      conteudo: replyText.trim(),
      data_envio: new Date().toISOString(),
      status_leitura: 0,
      remetente_nome: user?.nome || "Você",
      isLocal: true // Flag para identificar que é mensagem local
    };
    
    // Adiciona a mensagem local para feedback visual IMEDIATO
    setMessages(prev => [...prev, mensagemLocal]);
    
    // Limpa o campo de texto IMEDIATAMENTE
    setReplyText("");
    
    // Emite a mensagem via socket
    socket.emit('private_message', mensagemData);
  };

  // Selecionar usuário
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    
    // Se houver mensagens não lidas, marca como lidas
    if (unreadCounts[user.id] > 0) {
      await markMessagesAsRead(user.id);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!apiUrl) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          Conectando ao servidor de chat...
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          Carregando conversas...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Coluna de Contatos */}
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
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchTerm ? "Nenhum contato encontrado" : "Nenhum contato disponível"}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const unreadCount = unreadCounts[user.id] || 0;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={cn(
                      "flex flex-col items-start gap-1 border-b p-3 text-left text-sm transition-all hover:bg-accent w-full",
                      selectedUser?.id === user.id && "bg-muted"
                    )}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.nome.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{user.nome}</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-auto min-w-[1.25rem] flex items-center justify-center px-1">
                          {unreadCount > 99 ? '+99' : unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground capitalize ml-8">
                      {user.cargo}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Coluna do Chat */}
      <Card className="md:col-span-2 flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            <CardHeader className="flex flex-row items-center gap-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedUser.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{selectedUser.nome}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{selectedUser.cargo}</p>
              </div>
              {unreadCounts[selectedUser.id] > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCounts[selectedUser.id]}
                </span>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-muted-foreground h-full">
                  <div className="text-center">
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Inicie a conversa enviando uma mensagem</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div 
                    key={msg.id || `msg_${index}`} 
                    className={cn(
                      "flex items-end gap-2", 
                      msg.remetente_id === meuUserId ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.remetente_id !== meuUserId && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {selectedUser.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "max-w-xs rounded-lg px-3 py-2 md:max-w-md", 
                      msg.remetente_id === meuUserId 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      <p className="text-sm break-words">{msg.conteudo}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.remetente_id === meuUserId 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      )}>
                        {new Date(msg.data_envio).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {msg.remetente_id === meuUserId && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.nome?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
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
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!replyText.trim() || !socket}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground p-8">
            <div className="text-center max-w-md">
              <UserSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Selecione um contato</h3>
              <p className="text-sm">
                Escolha um contato da lista ao lado para iniciar uma conversa ou visualizar o histórico de mensagens.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}