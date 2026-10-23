"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  getPassengerDetails,
  listUsers,
  type AdminPassengerDetails,
  type AdminUser
} from "@/services/admin-content-service";

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  PENDING_EMAIL: "Pendente de e-mail",
  PENDING_PHONE: "Pendente de telefone",
  PENDING: "Pendente"
};

function labelForStatus(value?: string | null) {
  if (!value) return "Não informado";
  return statusLabels[value] || value.replaceAll("_", " ");
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

export default function AdminPassengersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [authStatusFilter, setAuthStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState<AdminPassengerDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const payload = await listUsers({ role: "passenger", page: 1, limit: 100 });
        setItems(payload.users || []);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Falha ao carregar passageiros."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesQuery = !normalizedQuery
        ? true
        : [item.name, item.email, item.phone]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      const matchesAuthStatus =
        authStatusFilter === "ALL" ? true : item.authStatus === authStatusFilter;

      return matchesQuery && matchesAuthStatus;
    });
  }, [authStatusFilter, items, query]);

  async function handleOpenDetails(passenger: AdminUser) {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedPassenger(null);

    try {
      setSelectedPassenger(await getPassengerDetails(passenger.id));
    } catch (loadError) {
      setDetailsError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar detalhes do passageiro."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <AdminPageShell
      title="Passageiros"
      description="Base real de passageiros carregada de /admin/users com filtros para busca operacional."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {loading ? <AdminLoadingState label="Carregando passageiros..." /> : null}

      {!loading ? (
        <section className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr_auto]">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                Buscar passageiro
              </span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nome, email ou telefone"
                className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-[#5f6d83]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                Status
              </span>
              <select
                value={authStatusFilter}
                onChange={(event) => setAuthStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
              >
                <option value="ALL">Todos</option>
                <option value="ACTIVE">Ativos</option>
                <option value="PENDING_EMAIL">Pendente de email</option>
                <option value="PENDING_PHONE">Pendente de telefone</option>
                <option value="BLOCKED">Bloqueados</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setAuthStatusFilter("ALL");
                }}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[#8ea0bd]">
            <span>
              Exibindo <span className="text-white">{filteredItems.length}</span> de{" "}
              <span className="text-white">{items.length}</span> passageiros
            </span>
            {query ? (
              <span className="rounded-lg bg-[#13253c] px-2.5 py-1 text-[#8fb4f2]">
                Busca: {query}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {!loading && !items.length ? (
        <AdminEmptyState label="Nenhum passageiro encontrado." />
      ) : null}

      {!loading && items.length && !filteredItems.length ? (
        <AdminEmptyState label="Nenhum passageiro encontrado com os filtros atuais." />
      ) : null}

      {!loading && filteredItems.length ? (
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left">
              <caption className="sr-only">Lista operacional de passageiros</caption>
              <thead className="border-b border-white/10 bg-[#151515] text-[11px] uppercase tracking-[0.08em] text-[#708099]">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Passageiro</th>
                  <th scope="col" className="px-5 py-4 font-medium">Contato</th>
                  <th scope="col" className="px-5 py-4 font-medium">Status</th>
                  <th scope="col" className="px-5 py-4 font-medium">Cadastro</th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex min-w-[230px] items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f2d4b] text-[#9bb0d1]">
                          <MaterialIcon name="person" className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{item.name || "Passageiro sem nome"}</p>
                          <p className="truncate text-xs text-[#708099]">ID: {item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#aebbd0]">
                      <p>{item.email || "E-mail não informado"}</p>
                      <p className="mt-1 text-xs text-[#708099]">{item.phone || "Telefone não informado"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-xl bg-[#13253c] px-3 py-1 text-xs font-medium text-[#8fb4f2]">
                        {labelForStatus(item.authStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#8ea0bd]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#c52b7d]/50 px-3 py-2 text-xs font-semibold text-[#e16aa8] transition hover:bg-[#c52b7d] hover:text-white"
                      >
                        <MaterialIcon name="manage_search" className="h-4 w-4" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {detailsLoading || detailsError || selectedPassenger ? (
        <PassengerDetailsPanel
          details={selectedPassenger}
          loading={detailsLoading}
          error={detailsError}
          onClose={() => {
            setSelectedPassenger(null);
            setDetailsError("");
          }}
        />
      ) : null}
    </AdminPageShell>
  );
}

function PassengerDetailsPanel({
  details,
  loading,
  error,
  onClose
}: {
  details: AdminPassengerDetails | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Detalhes do passageiro">
      <section className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#101010] p-5 shadow-2xl md:rounded-[28px] md:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#c52b7d]">Atendimento CRM</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Detalhes do passageiro</h2>
            <p className="mt-1 text-sm text-[#8ea0bd]">Visão consolidada para suporte, segurança e acompanhamento operacional.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 p-2 text-[#b7c2d6] hover:bg-white/5" aria-label="Fechar detalhes"><MaterialIcon name="close" className="h-5 w-5" /></button>
        </div>

        {loading ? <div className="py-16"><AdminLoadingState label="Carregando detalhes do passageiro..." /></div> : null}
        {error ? <div className="py-8"><AdminErrorState message={error} /></div> : null}
        {details ? <PassengerDetailsContent details={details} /> : null}
      </section>
    </div>
  );
}

function PassengerDetailsContent({ details }: { details: AdminPassengerDetails }) {
  const [activeTab, setActiveTab] = useState<"overview" | "trips" | "payments" | "support" | "security">("overview");
  const address = details.user.address?.formattedAddress || [
    details.user.address?.street,
    details.user.address?.number,
    details.user.address?.city,
    details.user.address?.state,
    details.user.address?.zipCode
  ].filter(Boolean).join(", ");

  return (
    <div className="mt-6 grid gap-6">
      <section className="grid gap-4 rounded-2xl border border-white/10 bg-[#151515] p-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="text-xl font-semibold text-white">{details.user.name || "Passageiro sem nome"}</h3>
          <div className="mt-3 grid gap-2 text-sm text-[#aebbd0] sm:grid-cols-2">
            <p><span className="text-[#708099]">E-mail:</span> {details.user.email || "-"}</p>
            <p><span className="text-[#708099]">Telefone:</span> {details.user.phone || "-"}</p>
            <p><span className="text-[#708099]">CPF:</span> {details.user.cpfMasked || "Não disponível"}</p>
            <p><span className="text-[#708099]">Cadastro:</span> {formatDate(details.user.createdAt)}</p>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-[#aebbd0] sm:grid-cols-2">
          <p><span className="text-[#708099]">Status:</span> {labelForStatus(details.user.authStatus)}</p>
          <p><span className="text-[#708099]">E-mail verificado:</span> {details.user.emailVerified ? "Sim" : "Não"}</p>
          <p><span className="text-[#708099]">Telefone verificado:</span> {details.user.phoneVerified ? "Sim" : "Não"}</p>
          <p><span className="text-[#708099]">Última atividade:</span> {formatDate(details.summary.lastActivityAt)}</p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <SummaryCard label="Total de corridas" value={details.summary.totalRides || 0} icon="route" />
        <SummaryCard label="Corridas concluídas" value={details.summary.completedRides || 0} icon="check_circle" />
        <SummaryCard label="Corridas canceladas" value={details.summary.canceledRides || 0} icon="cancel" />
        <SummaryCard label="Corrida ativa" value={details.summary.activeRides || 0} icon="directions_car" />
        <SummaryCard label="Total gasto" value={formatCurrency(details.summary.totalSpent)} icon="payments" />
        <SummaryCard label="Tickets abertos" value={details.summary.openSupportTickets || 0} icon="support_agent" />
      </div>

      <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#151515] p-2" aria-label="Seções do passageiro">
        {([
          ["overview", "Visão geral", "dashboard"],
          ["trips", "Corridas", "route"],
          ["payments", "Pagamentos", "payments"],
          ["support", "Suporte", "support_agent"],
          ["security", "Segurança", "security"]
        ] as const).map(([tab, label, icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === tab ? "bg-[#c52b7d] text-white" : "text-[#8ea0bd] hover:bg-white/5 hover:text-white"}`}
          >
            <MaterialIcon name={icon} className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <>
      <DetailSection title="Endereço cadastrado" icon="location_on">
        {address || "Nenhum endereço cadastrado."}
      </DetailSection>
        </>
      ) : null}

      {activeTab === "overview" || activeTab === "trips" ? (
      <DetailSection title="Corridas recentes" icon="route">
        {details.recentRides.length ? <div className="grid gap-3">{details.recentRides.map((ride) => (
          <div key={ride.id} className="rounded-xl border border-white/10 bg-black p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-white">{labelForStatus(ride.status)}</span><span className="text-sm text-[#8ea0bd]">{formatDate(ride.requestedAt)}</span></div>
            <p className="mt-2 text-sm text-[#aebbd0]">{ride.origin || "Origem não informada"} → {ride.destination || "Destino não informado"}</p>
            <p className="mt-2 text-xs text-[#708099]">Motorista: {ride.driver?.name || "Não informado"} · Pagamento: {ride.paymentMethod || "-"} · {formatCurrency(ride.amount)}</p>
          </div>
        ))}</div> : <EmptyDetails label="Nenhuma corrida encontrada para este passageiro." />}
      </DetailSection>
      ) : null}

      {activeTab === "payments" || activeTab === "support" ? (
      <div className="grid gap-6">
        {activeTab === "payments" ? (
        <DetailSection title="Pagamentos" icon="payments">
          {details.payments.length ? <div className="grid gap-2">{details.payments.map((payment) => <div key={`${payment.source}-${payment.id}`} className="rounded-xl border border-white/10 bg-black p-3 text-sm"><div className="flex justify-between gap-2 text-white"><span>{formatCurrency(payment.amount)}</span><span>{labelForStatus(payment.status)}</span></div><p className="mt-1 text-xs text-[#708099]">{payment.method || "-"} · {payment.provider || "-"} · {formatDate(payment.createdAt)}</p></div>)}</div> : <EmptyDetails label="Nenhum pagamento encontrado." />}
        </DetailSection>
        ) : null}
        {activeTab === "support" ? (
        <DetailSection title="Suporte" icon="support_agent">
          {details.supportTickets.length ? <div className="grid gap-2">{details.supportTickets.map((ticket) => <div key={ticket.id} className="rounded-xl border border-white/10 bg-black p-3 text-sm"><div className="flex justify-between gap-2 text-white"><span>{ticket.subject || ticket.issueCode || "Solicitação"}</span><span>{labelForStatus(ticket.status)}</span></div><p className="mt-1 text-xs text-[#aebbd0]">{ticket.message || "Sem descrição."}</p><p className="mt-1 text-xs text-[#708099]">{formatDate(ticket.createdAt)}</p></div>)}</div> : <EmptyDetails label="Nenhum ticket de suporte encontrado." />}
        </DetailSection>
        ) : null}
      </div>
      ) : null}

      {activeTab === "security" ? (
      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection title="Alertas de segurança" icon="security"><AuditList items={details.securityAlerts} emptyLabel="Nenhum alerta de segurança encontrado." /></DetailSection>
        <DetailSection title="Histórico administrativo" icon="history"><AuditList items={details.auditHistory} emptyLabel="Nenhum evento administrativo encontrado." /></DetailSection>
      </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#151515] p-4"><div className="flex items-center justify-between text-[#8ea0bd]"><span className="text-xs uppercase tracking-[0.08em]">{label}</span><MaterialIcon name={icon} className="h-5 w-5" /></div><p className="mt-3 text-2xl font-semibold text-white">{value}</p></div>;
}

function DetailSection({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-white/10 bg-[#151515] p-5"><h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white"><MaterialIcon name={icon} className="h-5 w-5 text-[#c52b7d]" />{title}</h3>{children}</section>;
}

function EmptyDetails({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-[#708099]">{label}</p>;
}

function AuditList({ items, emptyLabel }: { items: AdminPassengerDetails["auditHistory"]; emptyLabel: string }) {
  return items.length ? <div className="grid gap-2">{items.map((item) => <div key={item.id} className="rounded-xl border border-white/10 bg-black p-3 text-sm"><p className="font-medium text-white">{item.action || "Evento"}</p><p className="mt-1 text-xs text-[#708099]">{item.targetType || "-"} · {formatDate(item.createdAt)}</p></div>)}</div> : <EmptyDetails label={emptyLabel} />;
}
