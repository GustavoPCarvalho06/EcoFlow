"use client";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Menu } from "lucide-react";

const mockUsers = [
  { id: 1, nome: 'João Martins', cpf: '123.456.789-00', cargo: 'administrador', statusConta: 'ativo' },
  { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', cargo: 'coordenador', statusConta: 'ativo' },
  { id: 3, nome: 'Carlos Nunes', cpf: '555.666.777-88', cargo: 'coletor', statusConta: 'ativo' },
  { id: 4, nome: 'Ana Silva', cpf: '222.333.444-55', cargo: 'coletor', statusConta: 'desligado' },
  { id: 5, nome: 'Pedro Costa', cpf: '111.222.333-44', cargo: 'coletor', statusConta: 'ativo' },
];

export function UserPreviewTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Recentes</CardTitle>
        <CardDescription>
          Uma pré-visualização dos últimos usuários cadastrados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Cargo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.slice(0, 5).map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nome}</TableCell>
                <TableCell className="hidden md:table-cell">{user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1)}</TableCell>
                <TableCell>
                  <Badge className={user.statusConta === 'ativo' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}>
                    {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {/* SEÇÃO DO FOOTER ATUALIZADA */}
      <CardFooter className="flex justify-center border-t px-6 py-2">
        {/* BOTÃO COM FOCO NO TAMANHO HORIZONTAL */}
        <Button asChild variant="outline" className="w-45 py-5" aria-label="Ver todos os usuários">
          <Link href="/dashboard/administrador/usuarios">
            <Menu className="h-8 w-8" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}