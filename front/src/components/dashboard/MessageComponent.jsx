"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CornerUpLeft, Send } from "lucide-react"; // Ícones desnecessários removidos

// Mock data ATUALIZADO para incluir o 'cargo'
const mockMessages = [
  {
    id_mensagem_suporte: 1,
    nome: 'Lucas Ribeiro',
    cargo: 'Coletor', // Adicionamos o cargo
    mensagem: 'O sensor da praça central não está respondendo. Já reiniciamos o dispositivo, mas ele continua offline no sistema. Poderiam verificar se há algum problema de conexão do lado do servidor? Agradeço a atenção.',
    status_mensagem: 0, 
  },
  {
    id_mensagem_suporte: 2,
    nome: 'Diego Souza',
    cargo: 'Coletor',
    mensagem: 'Olá, equipe EcoFlow. Estou tentando acessar o aplicativo mobile, mas ele está travando na tela de login e fechando sozinho. Meu dispositivo é um Android 12. Podem me ajudar?',
    status_mensagem: 0,
  },
  {
    id_mensagem_suporte: 3,
    nome: 'Patrícia Gomes',
    cargo: 'Coordenador',
    mensagem: 'Bom dia. O sensor localizado próximo ao mercado municipal na Rua das Flores está indicando "cheio" o tempo todo, mesmo logo após a coleta. Suspeito que o sensor possa estar com defeito ou obstruído.',
    status_mensagem: 0,
  },
  {
    id_mensagem_suporte: 4,
    nome: 'Fernanda Lima',
    cargo: 'Coordenador',
    mensagem: 'Preciso de acesso ao painel de coordenador para poder gerenciar as rotas da minha equipe. Meu acesso atual é apenas de coletor. Agradeço a ajuda.',
    status_mensagem: 1,
  }
];

export function MessageComponent() {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    console.log(`Resposta para ${selectedMessage.nome}:`);
    console.log(replyText);
    
    setReplyText("");
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
      {/* Coluna da Lista de Mensagens */}
      <Card className="md:col-span-1 overflow-y-auto">
        <CardHeader>
          <CardTitle>Mensagens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {mockMessages.map((msg) => (
              <button
                key={msg.id_mensagem_suporte}
                onClick={() => handleSelectMessage(msg)}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-lg border-b p-3 text-left text-sm transition-all hover:bg-accent", // Diminuído o gap
                  selectedMessage?.id_mensagem_suporte === msg.id_mensagem_suporte && "bg-muted"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold">{msg.nome}</span>
                  <Badge className={cn(msg.status_mensagem === 0 ? "bg-yellow-500" : "bg-green-600", "text-white")}>
                    {msg.status_mensagem === 0 ? "Pendente" : "Resolvida"}
                  </Badge>
                </div>
                {/* 1. MUDANÇA PRINCIPAL: Exibindo o cargo em vez da mensagem */}
                <p className="text-xs font-medium text-muted-foreground">
                  {msg.cargo}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coluna de Detalhe da Mensagem */}
      <Card className="md:col-span-2 flex flex-col">
        {selectedMessage ? (
          <>
            {/* 2. CABEÇALHO ATUALIZADO: Botões de ação removidos */}
            <CardHeader className="flex flex-row items-center gap-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{selectedMessage.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle>{selectedMessage.nome}</CardTitle>
                 {/* Adicionamos o cargo abaixo do nome para mais contexto */}
                <p className="text-sm text-muted-foreground">{selectedMessage.cargo}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" aria-label="Responder">
                    <CornerUpLeft className="h-4 w-4" />
                </Button>
                {/* Botões de check e lixeira foram removidos daqui */}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 text-sm whitespace-pre-wrap">
              {selectedMessage.mensagem}
            </CardContent>
            <CardFooter className="p-4 border-t">
              <form onSubmit={handleSendReply} className="flex w-full items-center gap-2">
                <Textarea
                  placeholder={`Responder para ${selectedMessage.nome}...`}
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
            Selecione uma mensagem para ler seu conteúdo.
          </div>
        )}
      </Card>
    </div>
  );
}