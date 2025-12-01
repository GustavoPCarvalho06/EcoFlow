"use client";

import { useApiUrl } from "@/app/context/ApiContext";
import { useEffect, useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "lucide-react";

async function getLixoData(apiUrl, token) {
  if (!token) return [];

  try {
    const response = await fetch(`${apiUrl}/statusSensor`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default function MapBoxManejarWrapper({ token }) {
  const apiUrl = useApiUrl();
  const [lixo, setLixo] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLixo(await getLixoData(apiUrl, token));
    }
    fetchData();
  }, [apiUrl, token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensores de Lixo</CardTitle>
        <CardDescription>
          Status atualizado dos sensores monitorados pelo sistema.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="hidden md:table-cell">Endereço</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lixo && lixo.length > 0 ? (
              lixo.map((item) => (
                <TableRow key={item.ID}>
                  <TableCell className="font-medium">{item.ID}</TableCell>

                  <TableCell className="hidden md:table-cell">
                    {item.Endereco ?? "—"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        item.Stats === "Cheia"
                          ? "bg-red-600 text-white"
                          : item.Stats === "Quase Cheia"
                          ? "bg-yellow-600 text-white"
                          : "bg-green-600 text-white"
                      }
                    >
                      {item.Stats}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" className="text-center">
                  Nenhum sensor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex justify-center border-t p-0 h-7">
        <Button
          asChild
          variant="outline"
          className="w-full h-13 border-0 border-t"
          aria-label="Ver sensores no mapa"
        >
          <Link href="/mapa">
            <Menu className="h-8 w-8" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
