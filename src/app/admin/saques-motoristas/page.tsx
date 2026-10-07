"use client";

import { useCallback, useEffect, useState } from "react";
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

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function date(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—";
}

export default function AdminDriverWithdrawalsPage() {
  const [items, setItems] = useState<AdminDriverWithdrawal[]>([]);
  const [status, setStatus] = useState("REQUESTED");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await listDriverWithdrawals({ status: status || undefined });
      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Falha ao carregar saques.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

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
          <option value="REQUESTED">Aguardando aprovação</option>
          <option value="PROCESSING">Em processamento</option>
          <option value="COMPLETED">Pagas</option>
          <option value="REJECTED">Rejeitadas</option>
          <option value="FAILED">Com falha</option>
          <option value="">Todas</option>
        </select>
      </div>
      {error ? <AdminErrorState message={error} /> : null}
      {message ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">{message}</div> : null}
      {loading ? <AdminLoadingState label="Carregando solicitações..." /> : null}
      {!loading && !items.length ? <AdminEmptyState label="Nenhuma solicitação encontrada." /> : null}
      {!loading && items.length ? (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{item.driver?.name || "Motorista"}</h2>
                  <p className="mt-1 text-sm text-[#8ea0bd]">{item.driver?.email || item.driver?.phone || "Sem contato"}</p>
                  <p className="mt-3 text-xs text-[#708099]">Solicitado em {date(item.createdAt)} • {item.pixKeyType || "PIX"}: {item.pixKeyMasked || "oculta"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{currency(item.amount)}</p>
                  <p className="mt-1 text-xs text-[#0bd38a]">{statusLabels[item.status || ""] || item.status}</p>
                </div>
              </div>
              {item.failureReason || item.rejectionReason ? <p className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-100">{item.failureReason || item.rejectionReason}</p> : null}
              {item.status === "REQUESTED" ? (
                <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
                  <button type="button" onClick={() => void reject(item)} disabled={busyId === item.id} className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 disabled:opacity-50">Rejeitar</button>
                  <button type="button" onClick={() => void approve(item)} disabled={busyId === item.id} className="rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-50">Aprovar e enviar ao ASAAS</button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </AdminPageShell>
  );
}

