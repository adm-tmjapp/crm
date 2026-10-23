"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminEmptyState, AdminErrorState, AdminLoadingState } from "@/components/admin/admin-state";
import { listSupportTickets, type AdminSupportTicket } from "@/services/admin-content-service";

const statusLabels: Record<string, string> = { OPEN: "Aberto", IN_PROGRESS: "Em atendimento", UNDER_REVIEW: "Em análise", RESOLVED: "Resolvido" };
const issueLabels: Record<string, string> = { SECURITY_INCIDENT: "Segurança", PAYMENT_ISSUE: "Pagamento", FORGOTTEN_OBJECT: "Objeto esquecido", PASSENGER_ABSENT: "Passageiro ausente", OTHER: "Outro" };

function date(value?: string | null) { return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—"; }

export function AdminSupportPage({ issueCode }: { issueCode?: string }) {
  const [items, setItems] = useState<AdminSupportTicket[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const payload = await listSupportTickets({ status: status || undefined, issueCode }); setItems(payload.tickets || []); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Falha ao carregar suporte."); }
    finally { setLoading(false); }
  }, [issueCode, status]);
  useEffect(() => { void load(); }, [load]);
  return (
    <AdminPageShell title={issueCode ? "Segurança e incidentes" : "Suporte operacional"} description={issueCode ? "Priorize incidentes de segurança, acompanhe protocolos e registre a resposta da operação." : "Acompanhe solicitações dos motoristas, incidentes, pagamentos e problemas relacionados às corridas."}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#111111] p-5"><div><p className="text-sm font-semibold text-white">Tickets e incidentes</p><p className="mt-1 text-xs text-[#8ea0bd]">Cada solicitação possui protocolo e histórico operacional.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm text-white"><option value="">Todos os status</option><option value="OPEN">Abertos</option><option value="IN_PROGRESS">Em atendimento</option><option value="UNDER_REVIEW">Em análise</option><option value="RESOLVED">Resolvidos</option></select></div>
      {loading ? <AdminLoadingState label="Carregando tickets..." /> : null}
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && !error && !items.length ? <AdminEmptyState label="Nenhuma solicitação encontrada." /> : null}
      {!loading && !error && items.length ? <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]"><div className="hidden grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] gap-4 border-b border-white/10 px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#8ea0bd] lg:grid"><span>Protocolo</span><span>Tipo</span><span>Status</span><span>Corrida</span><span>Última atualização</span></div>{items.map((item) => <div key={item.id} className="grid gap-3 border-b border-white/8 px-5 py-5 last:border-b-0 lg:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] lg:items-center lg:gap-4"><div><p className="font-semibold text-white">{item.id}</p><p className="mt-1 text-xs text-[#8ea0bd]">{item.subject || "Solicitação"}</p></div><span className="text-sm text-[#cfd6e4]">{issueLabels[item.issueCode] || item.issueCode}</span><span className="inline-flex w-fit rounded-full bg-[#2c183f] px-3 py-1 text-xs font-semibold text-[#caa7ff]">{statusLabels[item.status] || item.status}</span><span className="text-sm text-[#cfd6e4]">{item.rideId}</span><span className="text-sm text-[#8ea0bd]">{date(item.updatedAt || item.createdAt)}</span>{item.description ? <p className="text-sm text-[#8ea0bd] lg:col-span-5">{item.description}</p> : null}</div>)}</div> : null}
    </AdminPageShell>
  );
}
