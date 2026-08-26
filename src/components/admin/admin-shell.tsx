"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAdminSession,
  hasAdminAccess,
  type AdminSession
} from "@/lib/auth";
import { logoutAdmin } from "@/services/admin-auth-service";
import {
  searchAdmin,
  type AdminSearchResults
} from "@/services/admin-content-service";
import {
  adminNavigationItems,
  adminSecondaryNavigationItems
} from "@/content/admin/navigation";
import { MaterialIcon } from "@/components/admin/material-icon";
import { AdminHeaderSheets } from "@/components/admin/admin-header-sheets";

export function AdminShell({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<AdminSearchResults | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isLoginRoute = pathname === "/admin/login" || pathname === "/admin/login/";

  useEffect(() => {
    if (isLoginRoute) {
      setSession(null);
      setIsInitializing(false);
      return;
    }

    setIsInitializing(true);

    const currentSession = getAdminSession();
    if (!hasAdminAccess(currentSession)) {
      setSession(null);
      setIsInitializing(false);
      router.replace("/admin/login");
      return;
    }

    setSession(currentSession);
    setIsInitializing(false);
  }, [isLoginRoute, pathname, router]);

  useEffect(() => {
    if (searchValue.trim().length < 2) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const payload = await searchAdmin(searchValue.trim());
        setSearchResults(payload);
        setSearchError("");
      } catch (error) {
        setSearchResults(null);
        setSearchError(error instanceof Error ? error.message : "Falha ao pesquisar.");
      }
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  function handleLogout() {
    logoutAdmin();
    router.replace("/admin/login");
  }

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020202] text-white">
        <div className="text-sm uppercase tracking-[0.24em] text-white/45">
          Carregando portal...
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="relative z-20 hidden w-[320px] shrink-0 border-r border-white/10 bg-black xl:flex xl:flex-col">
          <div className="flex items-center gap-4 px-8 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cf2f7d] text-white shadow-[0_14px_34px_rgba(207,47,125,0.25)]">
              <MaterialIcon name="airport_shuttle" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[18px] font-bold leading-tight text-white">TMJApp</p>
              <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#9aa8c1]">
                Admin Portal
              </p>
            </div>
          </div>

          <nav className="px-5 pt-8">
            <div className="space-y-4">
              {adminNavigationItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 rounded-2xl px-6 py-5 text-[18px] font-medium transition ${
                      active
                        ? "bg-[#cf2f7d] text-white"
                        : "text-[#a9b4c8] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <MaterialIcon name={item.icon} className="h-7 w-7" />
                    <span className={item.label.length > 18 ? "max-w-[170px]" : ""}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 border-t border-white/10 pt-8">
              {adminSecondaryNavigationItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 rounded-2xl px-6 py-5 text-[18px] font-medium transition ${
                      active
                        ? "bg-[#cf2f7d] text-white"
                        : "text-[#a9b4c8] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <MaterialIcon name={item.icon} className="h-7 w-7" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto border-t border-white/10 px-5 py-7">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-2xl px-6 py-5 text-[18px] font-medium text-[#ff6b7b] transition hover:bg-[#2c1013]"
            >
              <MaterialIcon name="logout" className="h-7 w-7" />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <section className="relative z-0 flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="relative z-10 border-b border-white/10 px-10 py-5">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div className="relative w-full max-w-[760px]">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a99b4]">
                  <MaterialIcon name="search" className="h-6 w-6" />
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar dados, motoristas ou transações..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
                  className="w-full rounded-2xl border border-white/12 bg-[#0f0f0f] py-4 pl-16 pr-5 text-[17px] text-[#dfe5ef] outline-none transition placeholder:text-[#6f7d95] focus:border-[#cf2f7d]/55"
                />
                {isSearchFocused && searchValue.trim().length >= 2 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden rounded-[20px] border border-white/10 bg-[#111111] shadow-[0_24px_48px_rgba(0,0,0,0.35)]">
                    {searchError ? (
                      <div className="px-5 py-4 text-sm text-red-200">{searchError}</div>
                    ) : null}
                    {!searchError && searchResults ? (
                      <div className="divide-y divide-white/10">
                        {[
                          {
                            label: "Usuários",
                            items: searchResults.users.map((item) => ({
                              id: item.id,
                              primary: item.name || item.email || "Usuário",
                              secondary: item.role || "-"
                            }))
                          },
                          {
                            label: "Veículos",
                            items: searchResults.vehicles.map((item) => ({
                              id: item.id,
                              primary:
                                `${item.manufacturer || ""} ${item.modelName || ""}`.trim() ||
                                item.vehiclePlate ||
                                "Veículo",
                              secondary: item.vehiclePlate || "-"
                            }))
                          },
                          {
                            label: "Documentos",
                            items: searchResults.documents.map((item) => ({
                              id: item.id,
                              primary: item.type || item.filename || "Documento",
                              secondary: item.user?.name || item.user?.email || "-"
                            }))
                          }
                        ]
                          .filter((section) => section.items.length)
                          .map((section) => (
                            <div key={section.label} className="px-5 py-4">
                              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#8ea0bd]">
                                {section.label}
                              </p>
                              <div className="space-y-3">
                                {section.items.map((item) => (
                                  <div key={item.id} className="text-sm">
                                    <p className="text-white">{item.primary}</p>
                                    <p className="text-[#7c8aa3]">{item.secondary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        {!searchResults.users.length &&
                        !searchResults.vehicles.length &&
                        !searchResults.documents.length &&
                        !searchResults.rides.length ? (
                          <div className="px-5 py-4 text-sm text-[#8ea0bd]">
                            Nenhum resultado encontrado.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-8">
                <AdminHeaderSheets />
                <div className="hidden h-10 w-px bg-white/12 lg:block" />
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[20px] font-semibold text-white">
                      {session.user.name}
                    </p>
                    <p className="text-[14px] text-[#8ea0bd]">
                      Administrador Geral
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#e7bf9d] bg-[#f0dec9] text-[#b19174]">
                    <MaterialIcon name="person" className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-0 flex-1 overflow-auto bg-black px-10 py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
