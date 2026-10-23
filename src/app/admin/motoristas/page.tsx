"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  AdminApiError,
  blockUser,
  getDriverDetails,
  listUsers,
  resetDriverOnboarding,
  unblockUser,
  type AdminDriverDetails,
  type AdminUser
} from "@/services/admin-content-service";

const onboardingStepLabels: Record<string, string> = {
  profilePhoto: "Foto de perfil",
  email: "Verificação de e-mail",
  phone: "Verificação de telefone",
  documents: "CNH",
  criminalRecord: "Antecedentes criminais",
  vehicle: "Cadastro do veículo",
  vehiclePhotos: "Fotos do veículo"
};

const statusLabels: Record<string, string> = {
  APPROVED: "Aprovado",
  ACTIVE: "Ativo",
  BLOCKED: "Bloqueado",
  COMPLETED: "Concluído",
  PENDING: "Pendente",
  REJECTED: "Rejeitado",
  UNDER_REVIEW: "Em análise",
  INACTIVE: "Inativo"
};

function labelForStatus(status?: string | null) {
  return statusLabels[String(status || "PENDING").toUpperCase()] || status || "Pendente";
}

function statusTone(status?: string | null) {
  switch (String(status || "PENDING").toUpperCase()) {
    case "ACTIVE":
    case "APPROVED":
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-200";
    case "BLOCKED":
    case "REJECTED":
      return "bg-red-500/10 text-red-200";
    case "UNDER_REVIEW":
      return "bg-amber-500/10 text-amber-200";
    default:
      return "bg-blue-500/10 text-blue-200";
  }
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString("pt-BR") : "-";
}

const securityEventLabels: Record<string, string> = {
  PASSWORD_RESET_REQUESTED: "Solicitou recuperação de senha",
  PASSWORD_RESET_CODE_GENERATED: "Código de recuperação gerado",
  PASSWORD_RESET_EMAIL_SENT: "Código enviado por e-mail",
  PASSWORD_RESET_EMAIL_FAILED: "Falha no envio do código",
  PASSWORD_RESET_CODE_INVALID: "Código informado inválido",
  PASSWORD_RESET_CODE_EXPIRED: "Código informado expirado",
  PASSWORD_RESET_CODE_VERIFIED: "Código validado",
  PASSWORD_RESET_COMPLETED: "Senha redefinida com sucesso"
};

function securityEventLabel(action?: string | null) {
  return securityEventLabels[String(action || "")] || action || "Evento de segurança";
}

export default function AdminDriversPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [authStatusFilter, setAuthStatusFilter] = useState("ALL");
  const [onboardingFilter, setOnboardingFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<AdminDriverDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const payload = await listUsers({ role: "driver", page: 1, limit: 100 });
      setItems(payload.users || []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar motoristas."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function removeUserFromList(userId: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== userId));
  }

  async function handleBlock(userId: string) {
    setBusyId(userId);
    try {
      await blockUser(userId);
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao bloquear motorista."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleUnblock(userId: string) {
    setBusyId(userId);
    try {
      await unblockUser(userId);
      await load();
    } catch (actionError) {
      if (actionError instanceof AdminApiError && actionError.status === 404) {
        removeUserFromList(userId);
        setError(
          `${actionError.message} O registro foi removido da lista local porque não existe mais na base atual.`
        );
        return;
      }
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao desbloquear motorista."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleResetOnboarding(userId: string) {
    setBusyId(`reset-${userId}`);
    try {
      await resetDriverOnboarding(userId);
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao resetar onboarding do motorista."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleOpenDetails(userId: string) {
    setDetailsLoading(true);
    setDetailsError("");
    setSelectedDriver(null);
    try {
      setSelectedDriver(await getDriverDetails(userId));
    } catch (detailsLoadError) {
      setDetailsError(
        detailsLoadError instanceof Error
          ? detailsLoadError.message
          : "Falha ao carregar detalhes do motorista."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

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

      const matchesOnboarding =
        onboardingFilter === "ALL"
          ? true
          : (item.onboardingStatus || "PENDING") === onboardingFilter;

      return matchesQuery && matchesAuthStatus && matchesOnboarding;
    });
  }, [authStatusFilter, items, onboardingFilter, query]);

  if (detailsLoading || detailsError || selectedDriver) {
    return (
      <AdminPageShell
        title="Detalhes do motorista"
        description="Visão completa para acompanhar cadastro, onboarding, documentos, veículo e segurança."
      >
        {detailsLoading ? (
          <div className="rounded-[28px] border border-white/10 bg-[#111111] p-8">
            <AdminLoadingState label="Carregando detalhes do motorista..." />
          </div>
        ) : null}
        {detailsError ? (
          <AdminErrorState message={detailsError} />
        ) : null}
        {selectedDriver ? (
          <DriverDetailsPanel
            details={selectedDriver}
            onClose={() => {
              setSelectedDriver(null);
              setDetailsError("");
            }}
          />
        ) : null}
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Motoristas"
      description="Base real de motoristas carregada de /admin/users com status de autenticacao e onboarding."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {loading ? <AdminLoadingState label="Carregando motoristas..." /> : null}
      {!loading ? (
        <section className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                Buscar motorista
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
                <option value="PENDING">Pendentes</option>
                <option value="UNDER_REVIEW">Em análise</option>
                <option value="BLOCKED">Bloqueados</option>
                <option value="INACTIVE">Inativos</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                Onboarding
              </span>
              <select
                value={onboardingFilter}
                onChange={(event) => setOnboardingFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
              >
                <option value="ALL">Todos</option>
                <option value="COMPLETED">Completo</option>
                <option value="UNDER_REVIEW">Em analise</option>
                <option value="PENDING">Pendente</option>
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setAuthStatusFilter("ALL");
                  setOnboardingFilter("ALL");
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
              <span className="text-white">{items.length}</span> motoristas
            </span>
            {query ? (
              <span className="rounded-lg bg-[#3c1228] px-2.5 py-1 text-[#d95b9a]">
                Busca: {query}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}
      {!loading && !items.length ? (
        <AdminEmptyState label="Nenhum motorista encontrado." />
      ) : null}
      {!loading && items.length && !filteredItems.length ? (
        <AdminEmptyState label="Nenhum motorista encontrado com os filtros atuais." />
      ) : null}
      {!loading && filteredItems.length ? (
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-left">
              <caption className="sr-only">Tabela operacional de motoristas</caption>
              <thead className="border-b border-white/10 bg-[#151515] text-[11px] uppercase tracking-[0.08em] text-[#708099]">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Motorista</th>
                  <th scope="col" className="px-5 py-4 font-medium">Status da conta</th>
                  <th scope="col" className="px-5 py-4 font-medium">Onboarding</th>
                  <th scope="col" className="px-5 py-4 font-medium">Cadastro</th>
                  <th scope="col" className="px-5 py-4 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => {
                  const authStatus = item.authStatus || "PENDING";
                  const onboardingStatus = item.onboardingStatus || "PENDING";
                  const isBusy = busyId === item.id || busyId === `reset-${item.id}`;

                  return (
                    <tr key={item.id} className="align-middle transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <div className="flex min-w-[260px] items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f2d4b] text-[#9bb0d1]">
                            <MaterialIcon name="person" className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{item.name || "Motorista sem nome"}</p>
                            <p className="truncate text-xs text-[#8ea0bd]">{item.email || item.phone || "Sem contato"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold ${statusTone(authStatus)}`}>
                          {labelForStatus(authStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold ${statusTone(onboardingStatus)}`}>
                          {labelForStatus(onboardingStatus)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#8ea0bd]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[360px] justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d95b9a]/40 bg-[#3c1228] px-3 py-2 text-xs font-semibold text-[#f08abb] transition hover:bg-[#52183a]"
                          >
                            <MaterialIcon name="visibility" className="h-4 w-4" />
                            Detalhes
                          </button>
                          {authStatus === "BLOCKED" ? (
                            <button
                              type="button"
                              onClick={() => handleUnblock(item.id)}
                              disabled={isBusy}
                              className="rounded-xl bg-[#03271c] px-3 py-2 text-xs font-semibold text-[#0bd38a] transition hover:brightness-110 disabled:opacity-50"
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleBlock(item.id)}
                              disabled={isBusy}
                              className="rounded-xl bg-[#2c1013] px-3 py-2 text-xs font-semibold text-[#ff7b8a] transition hover:brightness-110 disabled:opacity-50"
                            >
                              Bloquear
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleResetOnboarding(item.id)}
                            disabled={isBusy}
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
                          >
                            Resetar onboarding
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}

function DriverDetailsPanel({
  details,
  onClose
}: {
  details: AdminDriverDetails;
  onClose: () => void;
}) {
  const onboarding = details.onboardingStatus;
  const steps = Object.entries(onboarding?.steps || {});
  const completedSteps = steps.filter(([, step]) => step.completed).length;
  const totalSteps = steps.length;
  const currentStep =
    steps.find(([, step]) => !step.completed)?.[0] || "-";
  const onboardingLabel = onboarding?.isCompleted
    ? "COMPLETED"
    : onboarding?.isUnderReview
      ? "UNDER_REVIEW"
      : "PENDING";

  return (
    <div className="min-h-[60vh]">
      <div className="w-full max-w-6xl rounded-[28px] border border-white/10 bg-[#111111] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-6 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d95b9a]">
              Detalhes do motorista
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {details.user.name || "Motorista sem nome"}
            </h2>
            <p className="mt-1 text-sm text-[#8ea0bd]">
              {details.user.email || details.user.phone || "Sem contato"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-[#b7c3d8] hover:bg-white/5"
          >
            <MaterialIcon name="arrow_back" className="h-5 w-5" />
            Voltar
          </button>
        </div>

        <div className="grid gap-4 border-b border-white/10 p-6 md:grid-cols-4 md:p-8">
          <SummaryCard label="Conta" value={labelForStatus(details.user.authStatus)} />
          <SummaryCard label="Onboarding" value={labelForStatus(onboardingLabel)} />
          <SummaryCard
            label="Progresso"
            value={totalSteps ? `${completedSteps} de ${totalSteps} etapas` : "Sem dados"}
          />
          <SummaryCard
            label="Próxima etapa"
            value={onboardingStepLabels[currentStep] || currentStep}
          />
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <section>
            <SectionTitle title="Linha do tempo do onboarding" />
            <div className="mt-4 space-y-3">
              {steps.map(([key, step]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${step.completed ? "bg-[#03271c] text-[#0bd38a]" : step.underReview ? "bg-[#30260c] text-[#f6c453]" : "bg-[#2c1013] text-[#ff7b8a]"}`}>
                      {step.completed ? "✓" : step.underReview ? "…" : "!"}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {onboardingStepLabels[key] || key}
                    </span>
                  </div>
                  <span className="text-xs text-[#9aa8c1]">
                    {step.completed ? "Concluído" : step.underReview ? "Em análise" : "Pendente"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="Dados do cadastro" />
            <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black p-5 text-sm">
              <InfoRow label="Telefone" value={details.user.phone} />
              <InfoRow label="CPF" value={details.user.cpf} />
              <InfoRow label="E-mail verificado" value={details.user.emailVerified ? "Sim" : "Não"} />
              <InfoRow label="Telefone verificado" value={details.user.phoneVerified ? "Sim" : "Não"} />
              <InfoRow label="Cadastro" value={formatDate(details.user.createdAt)} />
              <InfoRow label="Última atualização" value={formatDate(details.user.updatedAt)} />
            </div>
          </section>

          <section className="md:col-span-2">
            <SectionTitle title="Segurança e recuperação de acesso" />
            <p className="mt-1 text-xs text-[#708099]">
              Histórico seguro das tentativas de recuperação. Senhas, códigos e tokens nunca são exibidos.
            </p>
            <div className="mt-4 space-y-3">
              {details.securityEvents?.length ? details.securityEvents.map((event) => {
                const eventDetails = event.details || {};
                const outcome = eventDetails.outcome ? String(eventDetails.outcome) : "";
                const provider = eventDetails.provider ? String(eventDetails.provider) : "";
                const retryable = eventDetails.retryable === true ? "Pode tentar novamente" : "";
                return (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-black p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{securityEventLabel(event.action)}</p>
                        <p className="mt-1 text-xs text-[#708099]">{formatDate(event.createdAt)}</p>
                      </div>
                      <span className="rounded-lg bg-[#1f2d4b] px-2.5 py-1 text-xs text-[#9bb0d1]">
                        {eventDetails.channel ? String(eventDetails.channel) : "AUTENTICAÇÃO"}
                      </span>
                    </div>
                    {(outcome || provider || retryable) ? (
                      <p className="mt-3 text-xs text-[#9aa8c1]">
                        {[outcome, provider, retryable].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                );
              }) : <EmptyDetail text="Nenhuma tentativa de recuperação registrada." />}
            </div>
          </section>

          <section>
            <SectionTitle title={`Documentos (${details.documents.length})`} />
            <div className="mt-4 space-y-3">
              {details.documents.length ? details.documents.map((document) => (
                <div key={document.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{document.type}{document.side ? ` · ${document.side}` : ""}</p>
                      <p className="mt-1 text-xs text-[#708099]">Enviado em {formatDate(document.createdAt)}</p>
                    </div>
                    <span className="rounded-lg bg-[#1f2d4b] px-2.5 py-1 text-xs text-[#9bb0d1]">{labelForStatus(document.status)}</span>
                  </div>
                  {document.rejectionReason ? <p className="mt-3 text-xs text-[#ff9ca7]">Motivo: {document.rejectionReason}</p> : null}
                </div>
              )) : <EmptyDetail text="Nenhum documento enviado." />}
            </div>
          </section>

          <section>
            <SectionTitle title={`Veículos (${details.vehicles.length})`} />
            <div className="mt-4 space-y-3">
              {details.vehicles.length ? details.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-2xl border border-white/10 bg-black p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{vehicle.manufacturer} {vehicle.modelName}</p>
                      <p className="mt-1 text-sm text-[#8ea0bd]">{vehicle.vehiclePlate || "Sem placa"} · {vehicle.color || "Cor não informada"}</p>
                    </div>
                    <span className="rounded-lg bg-[#3c1228] px-2.5 py-1 text-xs text-[#d95b9a]">{labelForStatus(vehicle.status)}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#9aa8c1]">Documentação: {labelForStatus(vehicle.documentationStatus)} · Fotos: {vehicle.photos?.length || 0}</p>
                  {vehicle.photos?.some((photo) => photo.rejectionReason) ? <p className="mt-2 text-xs text-[#ff9ca7]">Há fotos rejeitadas que precisam de novo envio.</p> : null}
                </div>
              )) : <EmptyDetail text="Nenhum veículo cadastrado." />}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black p-4"><p className="text-xs uppercase tracking-[0.08em] text-[#708099]">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-base font-semibold text-white">{title}</h3>;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0"><span className="text-[#708099]">{label}</span><span className="text-right text-white">{value || "-"}</span></div>;
}

function EmptyDetail({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-[#708099]">{text}</div>;
}
