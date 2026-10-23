"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  dashboardPeriods,
  dashboardStats
} from "@/content/admin/dashboard";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  approvePendingDocument,
  approvePendingVehicle,
  loadAdminDashboardData,
  rejectPendingDocument,
  rejectPendingVehicle,
  type DashboardData
} from "@/services/admin-dashboard-service";

type DashboardPeriod = "monthly" | "biweekly" | "weekly";

const toneClassByStat = {
  pink: "bg-[#3a1224] text-[#d63384]",
  blue: "bg-[#152642] text-[#4f8df7]",
  purple: "bg-[#2c183f] text-[#9b5cf6]",
  amber: "bg-[#37280f] text-[#f3af23]"
} as const;

function buildChartPath(values: number[]) {
  if (!values.length) return "";

  const width = 1000;
  const height = 300;
  const maxValue = Math.max(...values, 1);
  const stepX = width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = Math.round(index * stepX);
      const y = Math.round(20 + (height - 20) * (1 - value / maxValue));
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

const statLinks = [
  "/admin/pagamentos",
  "/admin/motoristas",
  "/admin/passageiros",
  "/admin/documentos"
] as const;

const operationalQueues = [
  {
    title: "Aprovações",
    description: "Documentos e veículos aguardando análise.",
    href: "/admin/documentos",
    icon: "fact_check",
    tone: "amber",
    countKey: "pendingApprovals" as const
  },
  {
    title: "Motoristas",
    description: "Onboarding, cadastro e segurança de acesso.",
    href: "/admin/motoristas",
    icon: "person_pin",
    tone: "blue" as const,
    countKey: undefined
  },
  {
    title: "Passageiros",
    description: "Atendimento, histórico e alertas operacionais.",
    href: "/admin/passageiros",
    icon: "groups",
    tone: "purple" as const,
    countKey: undefined
  },
  {
    title: "Corridas",
    description: "Acompanhe status, cancelamentos e detalhes.",
    href: "/admin/corridas",
    icon: "directions_car",
    tone: "blue" as const,
    countKey: undefined
  },
  {
    title: "Pagamentos",
    description: "Pix, cartão, falhas e configurações financeiras.",
    href: "/admin/pagamentos",
    icon: "account_balance_wallet",
    tone: "pink" as const,
    countKey: undefined
  },
  {
    title: "Saques",
    description: "Analise solicitações e avance cada etapa.",
    href: "/admin/saques-motoristas",
    icon: "payments",
    tone: "amber" as const,
    countKey: undefined
  }
] as const;

function ApprovalActions({
  onApprove,
  onReject,
  busy
}: {
  onApprove: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onApprove}
        aria-label="Aprovar pendência"
        title="Aprovar pendência"
        disabled={busy}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#03271c] text-[#0bd38a] transition hover:brightness-110 disabled:opacity-50"
      >
        <MaterialIcon name="check" className="h-6 w-6" />
      </button>
      <button
        onClick={onReject}
        aria-label="Rejeitar pendência"
        title="Rejeitar pendência"
        disabled={busy}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2c1013] text-[#ff5a63] transition hover:brightness-110 disabled:opacity-50"
      >
        <MaterialIcon name="close" className="h-6 w-6" />
      </button>
    </div>
  );
}

export function AdminDashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function refresh(nextPeriod = selectedPeriod) {
    setIsLoading(true);
    setError("");

    try {
      const payload = await loadAdminDashboardData(nextPeriod);
      setData(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Falha ao carregar dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const payload = await loadAdminDashboardData(selectedPeriod);
        setData(payload);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Falha ao carregar dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [selectedPeriod]);

  async function handleDocumentAction(
    documentId: string,
    action: "approve" | "reject"
  ) {
    setBusyId(documentId);
    try {
      if (action === "approve") {
        await approvePendingDocument(documentId);
      } else {
        await rejectPendingDocument(documentId);
      }

      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao atualizar documento."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleVehicleAction(
    vehicleId: string,
    action: "approve" | "reject"
  ) {
    setBusyId(vehicleId);
    try {
      if (action === "approve") {
        await approvePendingVehicle(vehicleId);
      } else {
        await rejectPendingVehicle(vehicleId);
      }

      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao atualizar veiculo."
      );
    } finally {
      setBusyId("");
    }
  }

  const revenueSeries =
    data?.revenueSeries ||
    Array.from({ length: 7 }, (_, index) => ({ label: `Ponto ${index + 1}`, value: 0 }));
  const revenueValues = revenueSeries.map((point) => point.value);
  const areaPath = `${buildChartPath(revenueValues)} L 1000 300 L 0 300 Z`;
  const statValues = [
    formatCurrency(data?.stats.totalRevenue || 0),
    new Intl.NumberFormat("pt-BR").format(data?.stats.activeDrivers || 0),
    new Intl.NumberFormat("pt-BR").format(data?.stats.totalPassengers || 0),
    new Intl.NumberFormat("pt-BR").format(data?.stats.pendingApprovals || 0)
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#cf2f7d]">
            Visão geral
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">
            Acompanhe sua operação
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-[#8ea0bd]">
            Veja o que precisa de atenção e acesse rapidamente as principais áreas da plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-[#dfe5ef] transition hover:border-[#cf2f7d]/50 hover:bg-white/5"
          >
            <MaterialIcon name="local_taxi" className="h-5 w-5" />
            Tipos de viagem
          </Link>
          <Link
            href="/admin/tarifas"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-[#dfe5ef] transition hover:border-[#cf2f7d]/50 hover:bg-white/5"
          >
            <MaterialIcon name="payments" className="h-5 w-5" />
            Tarifas
          </Link>
          <Link
            href="/admin/documentos"
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 px-4 py-3 text-sm font-semibold text-[#dfe5ef] transition hover:border-[#cf2f7d]/50 hover:bg-white/5"
          >
            <MaterialIcon name="fact_check" className="h-5 w-5" />
            Aprovações
          </Link>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#cf2f7d] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            <MaterialIcon name="refresh" className="h-5 w-5" />
            {isLoading ? "Atualizando..." : "Atualizar dados"}
          </button>
        </div>
      </div>

      <div className="flex justify-start">
        <div className="flex rounded-xl border border-white/10 bg-[#131313] p-1">
          {dashboardPeriods.map((label, index) => {
            const periodValue =
              index === 0 ? "monthly" : index === 1 ? "biweekly" : "weekly";

            return (
              <button
                key={label}
                onClick={() => setSelectedPeriod(periodValue)}
                className={`rounded-lg px-5 py-2 text-[15px] font-semibold transition ${
                  periodValue === selectedPeriod
                    ? "bg-[#cf2f7d] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "text-[#aeb7c8] hover:text-white"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Link
            key={stat.title}
            href={statLinks[index]}
            className="rounded-[20px] border border-white/12 bg-[#111111] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
          >
            <div className="mb-7 flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  toneClassByStat[stat.tone]
                }`}
              >
                <MaterialIcon name={stat.icon} className="h-6 w-6" />
              </div>
              {stat.badge ? (
                <span className="text-[13px] font-medium text-[#9ba7bd]">
                  {index === 0
                    ? `${Math.round(data?.trends.revenueGrowthPercent || 0)}%`
                    : stat.badge}
                </span>
              ) : null}
            </div>

            <div>
              <p className="text-[16px] text-[#b7c1d4]">{stat.title}</p>
              <h2 className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-white">
                {isLoading ? "--" : statValues[index]}
              </h2>
              <p className="mt-2 text-xs text-[#71809a]">
                {index === 0
                  ? "No período selecionado"
                  : index === 1
                    ? "Total atual"
                    : index === 2
                      ? `${data?.stats.newPassengers || 0} novos no período`
                      : "Documentos e veículos"}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-[20px] border border-white/12 bg-[#111111] p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#cf2f7d]">
              Central de operação
            </p>
            <h2 className="mt-2 text-[20px] font-bold text-white">
              O que precisa de atenção?
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] text-[#7c8aa3]">
              Acesse diretamente as filas e áreas usadas no atendimento diário.
            </p>
          </div>
          <Link
            href="/admin/auditoria"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#cf2f7d] hover:text-[#ee73ad]"
          >
            Ver histórico administrativo
            <MaterialIcon name="arrow_forward" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {operationalQueues.map((queue) => (
            <Link
              key={queue.title}
              href={queue.href}
              className="group flex min-h-[112px] items-start gap-4 rounded-2xl border border-white/10 bg-black p-4 transition hover:border-[#cf2f7d]/50 hover:bg-white/[0.03]"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClassByStat[queue.tone]}`}>
                <MaterialIcon name={queue.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">{queue.title}</h3>
                  <MaterialIcon name="arrow_forward" className="h-4 w-4 text-[#708099] transition group-hover:text-[#cf2f7d]" />
                </div>
                <p className="mt-1 text-xs leading-5 text-[#8ea0bd]">{queue.description}</p>
                {queue.countKey === "pendingApprovals" ? (
                  <p className="mt-2 text-xs font-semibold text-[#f3af23]">
                    {isLoading ? "--" : `${data?.stats.pendingApprovals || 0} pendência(s)`}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] border border-white/12 bg-[#111111] p-6">
        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-white">
            Crescimento de Receita
          </h2>
          <p className="mt-1 text-[13px] text-[#7c8aa3]">
            Monitoramento de desempenho semanal
          </p>
        </div>

        <div className="overflow-hidden rounded-[16px]">
            <svg
            viewBox="0 0 1000 360"
            className="h-[360px] w-full"
            preserveAspectRatio="none"
              role="img"
              aria-label="Gráfico de crescimento de receita por período"
          >
            <defs>
              <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#cf2f7d" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#cf2f7d" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {[100, 200, 300].map((line) => (
              <line
                key={line}
                x1="0"
                x2="1000"
                y1={line - 20}
                y2={line - 20}
                stroke="#41506b"
                strokeDasharray="5 6"
                opacity="0.9"
              />
            ))}

            <path d={areaPath} fill="url(#revenueArea)" />
            <path
              d={buildChartPath(revenueValues)}
              fill="none"
              stroke="#cf2f7d"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {revenueSeries.map((point, index) => {
              const x = revenueSeries.length > 1 ? (index * 1000) / (revenueSeries.length - 1) : 0;
              const maxValue = Math.max(...revenueValues, 1);
              const y = 20 + 280 * (1 - point.value / maxValue);
              return (
                <circle key={`${point.label}-${index}`} cx={x} cy={y} r="7" fill="#cf2f7d">
                  <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>

        <div className="mt-2 grid grid-cols-7 px-2 text-[13px] text-[#7c8aa3]">
          {revenueSeries.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-[20px] border border-white/12 bg-[#111111]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <h2 className="text-[18px] font-bold text-white">
              Motoristas Pendentes
            </h2>
            <Link href="/admin/documentos" className="text-sm font-medium text-[#cf2f7d]">
              Ver fila
            </Link>
          </div>

          <div className="space-y-4 p-5">
            {(data?.pendingDrivers || []).map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-black px-4 py-4"
              >
                <div className="flex items-center gap-5">
                  <div className="h-12 w-12 rounded-full bg-[#1f2d4b]" />
                  <div>
                    <h3 className="text-[16px] font-semibold text-white">
                      {driver.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {driver.documents.map((document) => (
                        <span
                          key={document}
                          className="rounded-lg bg-[#3c1228] px-2.5 py-1 text-[12px] text-[#d95b9a]"
                        >
                          {document}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <ApprovalActions
                  busy={busyId === driver.id}
                  onApprove={() => handleDocumentAction(driver.id, "approve")}
                  onReject={() => handleDocumentAction(driver.id, "reject")}
                />
              </div>
            ))}
            {!isLoading && !(data?.pendingDrivers || []).length ? (
              <div className="rounded-[18px] border border-white/10 bg-black px-5 py-8 text-center text-[14px] text-[#7c8aa3]">
                Nenhum documento pendente no momento.
              </div>
            ) : null}
          </div>
        </article>

        <article className="overflow-hidden rounded-[20px] border border-white/12 bg-[#111111]">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <h2 className="text-[18px] font-bold text-white">
              Veiculos Pendentes
            </h2>
            <Link href="/admin/veiculos" className="text-sm font-medium text-[#cf2f7d]">
              Ver fila
            </Link>
          </div>

          <div className="space-y-4 p-5">
            {(data?.pendingVehicles || []).map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-black px-4 py-4"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24344f] text-[#91a4c4]">
                    <MaterialIcon name="directions_car" className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-white">
                      {vehicle.name}
                    </h3>
                    <p className="mt-1 text-[13px] text-[#7c8aa3]">
                      {vehicle.details}
                    </p>
                  </div>
                </div>

                <ApprovalActions
                  busy={busyId === vehicle.id}
                  onApprove={() => handleVehicleAction(vehicle.id, "approve")}
                  onReject={() => handleVehicleAction(vehicle.id, "reject")}
                />
              </div>
            ))}
            {!isLoading && !(data?.pendingVehicles || []).length ? (
              <div className="rounded-[18px] border border-white/10 bg-black px-5 py-8 text-center text-[14px] text-[#7c8aa3]">
                Nenhum veiculo pendente no momento.
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
