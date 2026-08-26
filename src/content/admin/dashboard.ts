export type DashboardStat = {
  title: string;
  icon: string;
  tone: "pink" | "blue" | "purple" | "amber";
  badge?: string;
};

export const dashboardPeriods = ["Mensal", "Quinzenal", "Semanal"] as const;

export const dashboardStats: DashboardStat[] = [
  {
    title: "Faturamento Total",
    icon: "payments",
    tone: "pink",
    badge: "Mensal"
  },
  {
    title: "Motoristas Ativos",
    icon: "person_pin",
    tone: "blue"
  },
  {
    title: "Total de Passageiros",
    icon: "groups",
    tone: "purple"
  },
  {
    title: "Aprovações Pendentes",
    icon: "notifications_active",
    tone: "amber"
  }
];
export const revenueLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
