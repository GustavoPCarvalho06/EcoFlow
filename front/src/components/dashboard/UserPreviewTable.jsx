"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Menu } from "lucide-react";

// O componente agora recebe uma lista de 'users' como prop
export function UserPreviewTable({ users }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários Recentes</CardTitle>
        <CardDescription>
          Uma pré-visualização dos últimos usuários cadastrados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Cargo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Verificamos se há usuários para exibir */}
            {users && users.length > 0 ? (
              // Mapeamos a lista de usuários recebida via props
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.cargo ? user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1) : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={user.statusConta === 'ativo' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}>
                      {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Mensagem exibida se não houver usuários
              <TableRow>
                <TableCell colSpan="3" className="text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t p-0 h-7">
        {/* MUDANÇA 3: Classes corrigidas para um botão largo e alto */}
        <Button asChild variant="outline" className="w-full h-13 border-0 border-t" aria-label="Ver todos os usuários">
          <Link href="/dashboard/administrador/usuarios">
            <Menu className="h-8 w-8" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}