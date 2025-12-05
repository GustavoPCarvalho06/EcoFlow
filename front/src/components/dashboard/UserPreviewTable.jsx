

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Menu } from "lucide-react";

export function UserPreviewTable({ users }) {
  return (

    <Card className="rounded-xl border shadow-sm overflow-hidden flex flex-col h-full bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground">Usuários Recentes</CardTitle>
        <CardDescription className="text-muted-foreground">
          Uma pré-visualização dos últimos usuários cadastrados no sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</TableHead>
              <TableHead className="hidden md:table-cell text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow 
                    key={user.id} 
                   
                    className="hover:bg-muted/50 border-border transition-colors duration-200"
                >
                  <TableCell className="font-medium text-foreground py-3">{user.nome}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground py-3">
                    {user.cargo ? user.cargo.charAt(0).toUpperCase() + user.cargo.slice(1) : '-'}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge 
                        variant="secondary"
                        className={`rounded-md px-2.5 py-0.5 text-xs font-semibold shadow-none border-0 ${
                            user.statusConta === 'ativo' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                    >
                      {user.statusConta === 'ativo' ? 'Ativo' : 'Desligado'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" className="text-center text-muted-foreground py-8">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-border p-0">
        <Button asChild variant="ghost" className="w-full h-14 rounded-none text-muted-foreground hover:text-green-600 hover:bg-muted/50 transition-all duration-300 cursor-pointer" aria-label="Ver todos os usuários">
          <Link href="/usuarios" className="flex items-center gap-2">
            <span className="text-sm font-medium">Ver todos</span>
            <Menu className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}