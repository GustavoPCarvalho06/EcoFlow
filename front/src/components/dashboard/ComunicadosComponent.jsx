"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock data para simular os comunicados que viriam do banco de dados
const mockComunicados = [
  {
    id: 1,
    titulo: "Alteração na Rota de Coleta - Bairro Sul",
    conteudo: "Atenção, equipe!\n\nA partir da próxima segunda-feira, a rota de coleta do Bairro Sul será iniciada pela Rua das Acácias, e não mais pela Avenida Principal, para otimizar o tempo e evitar o trânsito da manhã.\n\nPor favor, atualizem seus planos. Dúvidas, falar com a coordenação.",
    autor: "Maria Santos",
    data_publicacao: "2 dias atrás",
  },
  {
    id: 2,
    titulo: "Reunião Geral da Equipe - Manutenção dos Veículos",
    conteudo: "Lembrete: nossa reunião mensal obrigatória será nesta sexta-feira, às 8h da manhã no pátio principal. O tema será o novo cronograma de manutenção preventiva dos caminhões de coleta.\n\nA presença de todos é essencial.",
    autor: "Fernanda Lima",
    data_publicacao: "5 dias atrás",
  },
  {
    id: 3,
    titulo: "Novos Uniformes e Equipamentos de Segurança (EPIs)",
    conteudo: "Os novos uniformes de verão e os kits de EPIs (luvas e botas) já estão disponíveis para retirada no almoxarifado. Por favor, peguem os seus até o final desta semana. É obrigatório o uso do novo uniforme a partir do dia 1º do próximo mês.",
    autor: "Maria Santos",
    data_publicacao: "1 semana atrás",
  }
];

export function ComunicadosComponent() {
  return (
    // Container para o feed, com uma barra de rolagem se o conteúdo for grande
    <div className="space-y-4 overflow-y-auto h-[calc(100vh-12rem)] pr-2">
      {mockComunicados.map((comunicado) => (
        <Card key={comunicado.id}>
          <CardHeader className="flex flex-row items-start gap-4">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback>{comunicado.autor.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{comunicado.titulo}</CardTitle>
              <CardDescription>
                Postado por {comunicado.autor} • {comunicado.data_publicacao}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {/* A classe 'whitespace-pre-wrap' respeita as quebras de linha do texto */}
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {comunicado.conteudo}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}