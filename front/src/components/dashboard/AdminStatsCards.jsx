import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStatsCards({ stats }) {
  const cardData = [
    {
      title: "Total de Usuários",
      value: stats?.totalUsers || 0,
      description: "Todas as contas do sistema",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      borderColor: "border-l-blue-500",
    },
    {
      title: "Coletores Ativos",
      value: stats?.activeCollectors || 0,
      description: "Usuários com cargo coletor e ativos",
      icon: UserCheck,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      borderColor: "border-l-green-500",
    },
    {
      title: "Contas Desligadas",
      value: stats?.inactiveUsers || 0,
      description: "Usuários com status desligado",
      icon: UserX,
      iconColor: "text-red-600",
      iconBg: "bg-red-50",
      borderColor: "border-l-red-500",
    },
    {
      title: "Cargos",
      value: stats?.roles || 3,
      description: "Administrador, Coordenador, Coletor",
      icon: Briefcase,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      borderColor: "border-l-purple-500",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((item, index) => (
        <Card 
          key={index}
          className={cn(
            "rounded-xl border border-gray-100 shadow-sm transition-all duration-300",
            "hover:shadow-lg hover:-translate-y-1",
            "border-l-[4px]",
            item.borderColor
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-600">
              {item.title}
            </CardTitle>
            <div className={cn("p-2 rounded-lg", item.iconBg)}>
              <item.icon className={cn("h-5 w-5", item.iconColor)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {item.value}
            </div>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}