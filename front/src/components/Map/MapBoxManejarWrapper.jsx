"use client";

import { useApiUrl } from "@/app/context/ApiContext";
import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Map, Trash2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Card className="rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
      <CardHeader className="border-b border-gray-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Sensores de Lixo</CardTitle>
            <CardDescription >
              Status atualizado dos sensores monitorados.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 ">
        <Table>
          <TableHeader className="bg-green-500/100">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="w-[80px] pl-6 h-10 text-xs font-semibold uppercase tracking-wide">ID</TableHead>
              <TableHead className="hidden md:table-cell h-10 text-xs font-semibold uppercase tracking-wide">Endereço</TableHead>
              <TableHead className="pr-6 h-10 text-xs font-semibold uppercase tracking-wide text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {lixo && lixo.length > 0 ? (
              lixo.map((item) => (
                <TableRow key={item.ID} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6 font-mono text-xs font-medium">
                    #{item.ID}
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {item.Endereco ?? "Localização não informada"}
                    </div>
                  </TableCell>

                  <TableCell className="pr-6 text-right">
                    <Badge
                      className={cn(
                        "shadow-none border font-medium px-2 py-0.5",
                        item.Stats === "Cheia"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : item.Stats === "Quase Cheia"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-green-50 text-green-700 border-green-200"
                      )}
                    >
                      {item.Stats}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="3" className="h-32 text-center text-sm">
                  Nenhum sensor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="p-0 border-t border-gray-100 ">
        <Button
          asChild
          variant="ghost"
          className="w-full h-12 rounded-none hover:text-green-700 transition-all text-sm font-medium cursor-pointer"
        >
        </Button>
      </CardFooter>
    </Card>
  );
}