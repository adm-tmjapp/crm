"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { MaterialIcon } from "@/components/admin/material-icon";
import { getAdminSession, hasAdminAccess } from "@/lib/auth";
import { loginAdmin } from "@/services/admin-auth-service";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (hasAdminAccess(session)) {
      router.replace("/admin");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await loginAdmin({ email, password, remember });
      router.replace("/admin");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Falha ao autenticar."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#010101] font-sans text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#c62f78]/8 blur-[140px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#c62f78]/8 blur-[140px]" />
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[452px]">
          <div className="mb-7 flex flex-col items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c62f78]/12 text-[#d43f89] shadow-[0_8px_30px_rgba(198,47,120,0.14)]">
              <MaterialIcon name="database" className="h-[22px] w-[22px]" />
            </div>
            <div className="text-center">
              <h1 className="text-[34px] font-black tracking-[-0.03em] text-white">
                TMJApp
              </h1>
              <p className="mt-1 text-[15px] text-slate-400">
                Portal Administrativo
              </p>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#16233c] bg-[#050b14] px-7 py-8 shadow-[0_20px_70px_rgba(0,0,0,0.48)] md:px-8 md:py-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.04em] text-white/50">
                  E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                    <MaterialIcon name="mail" className="h-[20px] w-[20px]" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-[14px] border border-[#18263f] bg-[#02070d] py-3.5 pl-11 pr-4 text-[15px] text-white outline-none transition placeholder:text-white/22 focus:border-[#c62f78]/60 focus:ring-1 focus:ring-[#c62f78]/35"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label className="text-[12px] font-semibold uppercase tracking-[0.04em] text-white/50">
                    Senha
                  </label>
                  <Link
                    href="#"
                    className="text-[12px] font-medium text-[#c62f78] hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                    <MaterialIcon name="lock" className="h-[20px] w-[20px]" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[14px] border border-[#18263f] bg-[#02070d] py-3.5 pl-11 pr-12 text-[15px] text-white outline-none transition placeholder:text-white/22 focus:border-[#c62f78]/60 focus:ring-1 focus:ring-[#c62f78]/35"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-[#c62f78]"
                    aria-label="Alternar visibilidade da senha"
                  >
                    <MaterialIcon
                      name={showPassword ? "visibility_off" : "visibility"}
                      className="h-[20px] w-[20px]"
                    />
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 pt-1 text-[12px] font-medium uppercase tracking-[0.04em] text-white/42">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded-[4px] border-[#24324a] bg-transparent text-[#c62f78] focus:ring-[#c62f78]/40"
                />
                Lembrar acesso
              </label>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full rounded-[14px] bg-gradient-to-r from-[#c62f78] to-[#d83b8a] py-4 text-[17px] font-semibold text-white shadow-[0_10px_30px_rgba(198,47,120,0.34)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Entrando..." : "Entrar no Portal"}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-[15px] text-slate-400">
            Precisa de ajuda?{" "}
            <a href="#" className="font-medium text-[#c62f78] hover:underline">
              Contate o suporte
            </a>
          </div>
        </div>
      </div>

      <footer className="relative px-6 py-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <div className="h-px w-14 bg-[#1a2a42]" />
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-medium uppercase tracking-[0.22em] text-[#5b6b87]">
            <span>© 2024 TMJApp</span>
            <span>Seguranca</span>
            <span>Termos</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
