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
  listUsers,
  resetDriverOnboarding,
  unblockUser,
  type AdminUser
} from "@/services/admin-content-service";

export default function AdminDriversPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [authStatusFilter, setAuthStatusFilter] = useState("ALL");
  const [onboardingFilter, setOnboardingFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

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
                <option value="BLOCKED">Bloqueados</option>
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
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="rounded-[24px] border border-white/10 bg-[#111111] p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1f2d4b] text-[#9bb0d1]">
                  <MaterialIcon name="person" className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[20px] font-semibold text-white">
                    {item.name || "Motorista sem nome"}
                  </h2>
                  <p className="truncate text-[15px] text-[#8ea0bd]">
                    {item.email || item.phone || "Sem contato"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-4">
                  <span className="text-sm text-[#8ea0bd]">Status</span>
                  <span className="rounded-xl bg-[#13253c] px-3 py-1 text-sm text-[#8fb4f2]">
                    {item.authStatus || "PENDING"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black px-4 py-4">
                  <span className="text-sm text-[#8ea0bd]">Onboarding</span>
                  <span className="rounded-xl bg-[#3c1228] px-3 py-1 text-sm text-[#d95b9a]">
                    {item.onboardingStatus || "PENDING"}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-[#708099]">
                  Cadastro:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {item.authStatus === "BLOCKED" ? (
                    <button
                      type="button"
                      onClick={() => handleUnblock(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-2xl bg-[#03271c] px-4 py-3 text-sm font-medium text-[#0bd38a] transition hover:brightness-110 disabled:opacity-50"
                    >
                      Desbloquear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBlock(item.id)}
                      disabled={busyId === item.id}
                      className="rounded-2xl bg-[#2c1013] px-4 py-3 text-sm font-medium text-[#ff7b8a] transition hover:brightness-110 disabled:opacity-50"
                    >
                      Bloquear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleResetOnboarding(item.id)}
                    disabled={busyId === `reset-${item.id}`}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Resetar onboarding
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </AdminPageShell>
  );
}
