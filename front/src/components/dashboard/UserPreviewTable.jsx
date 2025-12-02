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
    <Card className="rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Usuários Recentes</CardTitle>
        <CardDescription className="text-gray-500">
          Uma pré-visualização dos últimos usuários cadastrados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold text-gray-400 uppercase tracking-wider">Cargo</TableHead>
              <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Verificamos se há usuários para exibir */}
            {users && users.length > 0 ? (
              // Mapeamos a lista de usuários recebida via props
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/80 border-gray-50 transition-colors duration-200">
                  <TableCell className="font-medium text-gray-700 py-3">{user.nome}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500 py-3">
                    {user.cargo ? user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1) : '-'}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                        variant="secondary"
                        className={`rounded-md px-2.5 py-0.5 text-xs font-semibold shadow-none border-0 ${
                            user.statusConta === 'ativo' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Mensagem exibida se não houver usuários
              <TableRow>
                <TableCell colSpan="3" className="text-center text-gray-400 py-8">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-gray-100 p-0">
        {/* MUDANÇA 3: Classes corrigidas para um botão largo e alto */}
        <Button asChild variant="ghost" className="w-full h-14 rounded-none text-gray-400 hover:text-green-600 hover:bg-gray-50 transition-all duration-300 cursor-pointer" aria-label="Ver todos os usuários">
          <Link href="/usuarios" className="flex items-center gap-2">
            <span className="text-sm font-medium">Ver todos</span>
            <Menu className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}