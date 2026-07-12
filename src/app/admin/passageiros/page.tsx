"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import { MaterialIcon } from "@/components/admin/material-icon";
import { listUsers, type AdminUser } from "@/services/admin-content-service";

export default function AdminPassengersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [authStatusFilter, setAuthStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                    {item.name || "Passageiro sem nome"}
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
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="truncate text-sm text-[#708099]">
                  Telefone: {item.phone || "-"}
                </div>
                <div className="text-sm text-[#708099]">
                  Cadastro:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </AdminPageShell>
  );
}
