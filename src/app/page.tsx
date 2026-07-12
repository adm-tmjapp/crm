import Image from "next/image";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  benefits,
  faqs,
  footerColumns,
  navItems,
  testimonials
} from "@/content/site-config";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo_tmj.png"
              alt="TMJApp"
              width={112}
              height={28}
              className="h-auto w-24"
            />
          </div>
          <div className="hidden items-center gap-10 md:flex">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-white/70 transition hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href="#cadastro"
              className="rounded-md bg-[#c72f79] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Seja um Motorista
            </a>
          </div>
          <button
            aria-label="Abrir menu"
            className="rounded-md border border-white/10 p-2 text-white/80 md:hidden"
          >
            <MaterialIcon name="menu" className="h-7 w-7" />
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_520px]">
          <div className="max-w-xl">
            <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl">
              Dirija com o <span className="text-[#c72f79]">TMJApp</span> e
              mude sua vida financeira
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/68 md:text-lg">
              A plataforma que valoriza o seu trabalho com taxas mais
              competitivas, rotina clara e foco no ganho real de quem esta no
              volante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cadastro"
                className="rounded-md bg-[#c72f79] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Quero Dirigir
              </a>
              <a
                href="#beneficios"
                className="rounded-md border border-[#c72f79]/40 px-5 py-3 text-sm font-semibold text-[#f35ca3] transition hover:bg-[#c72f79]/10"
              >
                Saiba Mais
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="rounded-[28px] bg-[#f5a623] p-6 shadow-[0_24px_80px_rgba(199,47,121,0.18)] md:p-8">
              <div className="relative mx-auto max-w-[290px]">
                <div className="absolute inset-x-8 top-8 h-10 rounded-full bg-black/20 blur-xl" />
                <div className="relative overflow-hidden rounded-[34px] border-[10px] border-[#1e1e1e] bg-[#f4f1ec] shadow-[0_30px_60px_rgba(0,0,0,0.38)]">
                  <div className="flex items-center justify-between px-5 pb-2 pt-4 text-[11px] font-semibold text-[#1b1b1b]">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-[#1b1b1b]" />
                      <span className="h-2 w-2 rounded-full bg-[#1b1b1b]" />
                      <span className="h-2 w-2 rounded-full bg-[#1b1b1b]" />
                    </div>
                  </div>
                  <div className="px-5 pb-6">
                    <div className="rounded-[28px] bg-[#f7b733] px-4 py-5">
                      <div className="rounded-[22px] bg-white px-4 py-4 shadow-sm">
                        <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-[26px] bg-[#f3f3f3]">
                          <Image
                            src="/assets/app_registration.svg"
                            alt="Aplicativo TMJApp"
                            width={120}
                            height={120}
                            className="h-auto w-28"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="h-3 rounded-full bg-slate-200" />
                          <div className="h-3 w-4/5 rounded-full bg-slate-200" />
                          <div className="h-3 w-3/5 rounded-full bg-slate-200" />
                        </div>
                        <div className="mt-5 rounded-xl bg-[#111111] px-4 py-3 text-center text-xs font-bold text-white">
                          CADASTRAR
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-[#07090f] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Por que escolher a TMJApp?
            </h2>
            <p className="mt-4 text-base leading-7 text-white/60">
              Uma operacao pensada para dar mais previsibilidade, seguranca e
              margem para quem roda todo dia.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-2xl border border-white/6 bg-[#10131b] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c72f79]/12 text-[#c72f79]">
                  <MaterialIcon name={benefit.icon} className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="seguranca" className="bg-[#040507] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Vozes de quem esta no volante
            </h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              Relatos de motoristas que encontraram mais clareza operacional e
              melhor percepcao de ganho.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                className="rounded-2xl border border-white/6 bg-[#10131b] p-6"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-full ${
                      index === 0
                        ? "bg-emerald-200"
                        : index === 1
                          ? "bg-orange-200"
                          : "bg-sky-200"
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#c72f79]">{item.role}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/58">
                  &ldquo;{item.text}&rdquo;
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ganhos" className="bg-[#040404] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-[#c72f79]/10 bg-[linear-gradient(135deg,#220412,#13071b_42%,#062028)] px-6 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-8 lg:px-12 lg:py-12">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div id="cadastro">
              <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                Pronto para comecar?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/65 md:text-base">
                Baixe o app, conclua o cadastro e entre em uma operacao pensada
                para acelerar sua rotina com mais clareza e resultado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Image
                  src="/assets/google-play-badge.png"
                  alt="Google Play"
                  width={170}
                  height={50}
                  className="h-auto w-[160px]"
                />
                <Image
                  src="/assets/app-store-badge.png"
                  alt="App Store"
                  width={170}
                  height={50}
                  className="h-auto w-[160px]"
                />
              </div>
            </div>

            <div className="flex items-end justify-center gap-4 overflow-hidden">
              <div className="hidden h-64 w-36 -rotate-12 rounded-[26px] border-4 border-[#1e1e1e] bg-[#73d0cf] shadow-2xl sm:block" />
              <div className="h-72 w-40 rounded-[26px] border-4 border-[#1e1e1e] bg-[#97e3ea] shadow-2xl" />
              <div className="h-80 w-44 rounded-[30px] border-4 border-[#1e1e1e] bg-white shadow-2xl" />
              <div className="hidden h-72 w-40 rotate-12 rounded-[26px] border-4 border-[#1e1e1e] bg-[#d7d7d7] shadow-2xl sm:block" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              Perguntas Frequentes
            </h2>
            <p className="mt-4 text-base text-white/55">
              O essencial para entender a operacao antes de entrar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-xl border border-white/7 bg-[#101010]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-left">
                  <span className="text-sm font-semibold text-white">
                    {faq.question}
                  </span>
                  <span className="text-white/50 transition group-open:rotate-180">
                    <MaterialIcon name="expand_more" className="h-6 w-6" />
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-7 text-white/60">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/6 bg-[#060606] py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr_1fr]">
            <div>
              <Image
                src="/assets/logo_tmj.png"
                alt="TMJApp"
                width={120}
                height={30}
                className="h-auto w-24"
              />
              <p className="mt-4 max-w-xs text-sm leading-7 text-white/45">
                Mobilidade urbana com foco em operacao profissional,
                rentabilidade e experiencia confiavel para motoristas.
              </p>
              <div className="mt-5 flex gap-3">
                {["instagram", "smart_display", "call", "mail"].map((icon) => (
                  <div
                    key={icon}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 text-white/55"
                  >
                    <MaterialIcon name={icon} className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-white/45">
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/6 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
            <span>© 2026 TMJApp. Todos os direitos reservados.</span>
            <span>Feito para a proxima fase do produto.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
