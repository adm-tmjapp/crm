"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/admin-state";
import {
  approveDriverWithdrawal,
  listDriverWithdrawals,
  rejectDriverWithdrawal,
  type AdminDriverWithdrawal
} from "@/services/admin-content-service";

const statusLabels: Record<string, string> = {
  REQUESTED: "Aguardando aprovação",
  APPROVED: "Aprovada",
  PROCESSING: "Em processamento",
  COMPLETED: "Paga",
  REJECTED: "Rejeitada",
  FAILED: "Falhou",
  CANCELLED: "Cancelada"
};

const boardColumns = [
  { key: "REQUESTED", label: "Aguardando aprovação", color: "border-amber-500/30" },
  { key: "APPROVED", label: "Aprovadas", color: "border-blue-500/30" },
  { key: "PROCESSING", label: "Em processamento", color: "border-violet-500/30" },
  { key: "COMPLETED", label: "Concluídas", color: "border-emerald-500/30" },
  { key: "FAILED", label: "Com falha", color: "border-red-500/30" },
  { key: "REJECTED", label: "Rejeitadas", color: "border-white/10" }
] as const;

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
}

export default function AdminDriverWithdrawalsPage() {
  const [items, setItems] = useState<AdminDriverWithdrawal[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState<"board" | "table">("board");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await listDriverWithdrawals({ limit: 100 });
      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar saques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleItems = useMemo(
    () => status ? items.filter((item) => item.status === status) : items,
    [items, status]
  );

  async function approve(item: AdminDriverWithdrawal) {
    setBusyId(item.id);
    setError("");
    setMessage("");
    try {
      await approveDriverWithdrawal(item.id);
      setMessage("Solicitação aprovada e enviada ao ASAAS para processamento.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Falha ao aprovar saque.");
    } finally { setBusyId(null); }
  }

  async function reject(item: AdminDriverWithdrawal) {
    const reason = window.prompt("Informe o motivo da rejeição:");
    if (!reason?.trim()) return;
    setBusyId(item.id);
    setError("");
    setMessage("");
    try {
      await rejectDriverWithdrawal(item.id, reason.trim());
      setMessage("Solicitação rejeitada e saldo devolvido ao motorista.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Falha ao rejeitar saque.");
    } finally { setBusyId(null); }
  }

  return (
    <AdminPageShell
      title="Saques de motoristas"
      description="Analise solicitações feitas pelo aplicativo do motorista. A aprovação envia a transferência para o ASAAS."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#111111] p-5">
        <div>
          <p className="text-sm font-semibold text-white">Solicitações de saque</p>
          <p className="mt-1 text-xs text-[#8ea0bd]">O motorista não possui acesso a esta área.</p>
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white">
          <option value="">Todas as etapas</option>
          <option value="REQUESTED">Aguardando aprovação</option>
          <option value="PROCESSING">Em processamento</option>
          <option value="COMPLETED">Pagas</option>
          <option value="REJECTED">Rejeitadas</option>
          <option value="FAILED">Com falha</option>
        </select>
        <div className="flex rounded-xl border border-white/10 bg-[#1a1a1a] p-1">
          <button type="button" onClick={() => setView("board")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "board" ? "bg-[#c52b7d] text-white" : "text-[#8ea0bd]"}`}>Esteira</button>
          <button type="button" onClick={() => setView("table")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${view === "table" ? "bg-[#c52b7d] text-white" : "text-[#8ea0bd]"}`}>Tabela</button>
        </div>
      </div>
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">{message}</div> : null}
      {loading ? <AdminLoadingState label="Carregando solicitações..." /> : null}
      {!loading && !visibleItems.length ? <AdminEmptyState label="Nenhuma solicitação encontrada para o filtro atual." /> : null}
      {!loading && visibleItems.length ? (
        view === "board" ? (
          <div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-3 2xl:grid-cols-6">
            {boardColumns.map((column) => {
              const columnItems = visibleItems.filter((item) => item.status === column.key);
              return (
                <section key={column.key} className={`min-w-[280px] rounded-[24px] border ${column.color} bg-[#111111] p-4`}>
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold text-white">{column.label}</h2>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-[#b7c3d8]">{columnItems.length}</span>
                  </div>
                  <div className="space-y-3">
                    {columnItems.length ? columnItems.map((item) => (
                      <WithdrawalCard key={item.id} item={item} busyId={busyId} onApprove={approve} onReject={reject} />
                    )) : <p className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-[#708099]">Nenhuma solicitação nesta etapa.</p>}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-white/10 bg-[#111111]">
            <table className="min-w-[980px] w-full text-left">
              <thead className="border-b border-white/10 bg-[#151515] text-[11px] uppercase tracking-[0.1em] text-[#708099]">
                <tr><th className="px-5 py-4">Motorista</th><th className="px-5 py-4">Valor</th><th className="px-5 py-4">Destino</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Solicitado em</th><th className="px-5 py-4 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4"><p className="font-medium text-white">{item.driver?.name || "Motorista"}</p><p className="mt-1 text-xs text-[#708099]">{item.driver?.email || item.driver?.phone || "Sem contato"}</p></td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">{currency(item.amount)}</td>
                    <td className="px-5 py-4 text-sm text-[#aebbd0]">{item.pixKeyType || "PIX"} · {item.pixKeyMasked || "oculta"}</td>
                    <td className="px-5 py-4"><span className="rounded-xl bg-white/10 px-3 py-1 text-xs text-[#cfd6e4]">{statusLabels[item.status || ""] || item.status}</span></td>
                    <td className="px-5 py-4 text-xs text-[#8ea0bd]">{date(item.createdAt)}</td>
                    <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2">{item.status === "REQUESTED" ? <><button type="button" onClick={() => void reject(item)} disabled={busyId === item.id} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-50">Rejeitar</button><button type="button" onClick={() => void approve(item)} disabled={busyId === item.id} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-50">Aprovar</button></> : <span className="text-xs text-[#708099]">Sem ação</span>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </AdminPageShell>
  );
}

function WithdrawalCard({
  item,
  busyId,
  onApprove,
  onReject
}: {
  item: AdminDriverWithdrawal;
  busyId: string | null;
  onApprove: (item: AdminDriverWithdrawal) => Promise<void>;
  onReject: (item: AdminDriverWithdrawal) => Promise<void>;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">{item.driver?.name || "Motorista"}</h3>
          <p className="mt-1 truncate text-xs text-[#8ea0bd]">{item.driver?.email || item.driver?.phone || "Sem contato"}</p>
        </div>
        <p className="shrink-0 text-lg font-bold text-white">{currency(item.amount)}</p>
      </div>
      <p className="mt-3 text-xs text-[#708099]">{date(item.createdAt)} · {item.pixKeyType || "PIX"}: {item.pixKeyMasked || "oculta"}</p>
      {item.failureReason || item.rejectionReason ? <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-100">{item.failureReason || item.rejectionReason}</p> : null}
      {item.status === "REQUESTED" ? (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
          <button type="button" onClick={() => void onReject(item)} disabled={busyId === item.id} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-50">Rejeitar</button>
          <button type="button" onClick={() => void onApprove(item)} disabled={busyId === item.id} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 disabled:opacity-50">Aprovar</button>
        </div>
      ) : null}
    </article>
  );
}

