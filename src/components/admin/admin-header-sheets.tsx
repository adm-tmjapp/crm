"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/admin/material-icon";

type OpenSheet = "notifications" | "messages" | null;

const initialNotifications = [
  {
    id: 1,
    title: "Novo motorista aguardando aprovação",
    description: "Carlos Mendes enviou os documentos para análise.",
    time: "Há 5 min",
    unread: true,
    icon: "person"
  },
  {
    id: 2,
    title: "Veículo cadastrado",
    description: "Um novo veículo foi adicionado à fila de validação.",
    time: "Há 28 min",
    unread: true,
    icon: "directions_car"
  },
  {
    id: 3,
    title: "Pagamento processado",
    description: "O repasse semanal foi concluído com sucesso.",
    time: "Ontem",
    unread: false,
    icon: "payments"
  }
];

const conversations = [
  { id: 1, name: "Mariana Souza", role: "Motorista", preview: "Preciso de ajuda com meu cadastro.", time: "10:42" },
  { id: 2, name: "Rafael Lima", role: "Passageiro", preview: "Obrigado pelo atendimento!", time: "09:18" },
  { id: 3, name: "Suporte TMJApp", role: "Equipe interna", preview: "A atualização foi concluída.", time: "Ontem" }
];

export function AdminHeaderSheets() {
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const panelRef = useRef<HTMLElement>(null);
  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    if (!openSheet) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenSheet(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSheet]);

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage) return;
    setSentMessages((current) => [...current, nextMessage]);
    setMessage("");
  }

  return (
    <>
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={() => setOpenSheet("notifications")}
          aria-label={`Abrir notificações${unreadCount ? `, ${unreadCount} não lidas` : ""}`}
          className="relative text-[#b5c0d5] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cf2f7d]/70"
        >
          <MaterialIcon name="notifications" className="h-7 w-7" />
          {unreadCount ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#cf2f7d] px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setOpenSheet("messages")}
          aria-label="Abrir mensagens"
          className="text-[#b5c0d5] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cf2f7d]/70"
        >
          <MaterialIcon name="chat" className="h-7 w-7" />
        </button>
      </div>

      {openSheet ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Fechar painel"
            onClick={() => setOpenSheet(null)}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[2px]"
          />
          <aside
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${openSheet}-sheet-title`}
            className="relative flex h-full w-full max-w-[460px] flex-col border-l border-white/10 bg-[#0b0b0b] shadow-[-24px_0_60px_rgba(0,0,0,0.45)] outline-none"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#cf2f7d]">
                  Central administrativa
                </p>
                <h2 id={`${openSheet}-sheet-title`} className="mt-1 text-xl font-bold text-white">
                  {openSheet === "notifications" ? "Notificações" : "Mensagens"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenSheet(null)}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-[#9aa8c1] transition hover:bg-white/5 hover:text-white"
              >
                <MaterialIcon name="close" className="h-5 w-5" />
              </button>
            </div>

            {openSheet === "notifications" ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm text-[#8ea0bd]">{unreadCount} não lidas</span>
                  <button
                    type="button"
                    onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))}
                    disabled={!unreadCount}
                    className="text-sm font-semibold text-[#cf2f7d] transition hover:text-[#e25098] disabled:cursor-default disabled:opacity-40"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item))}
                      className={`flex w-full gap-4 rounded-[18px] border p-4 text-left transition hover:border-[#cf2f7d]/35 ${notification.unread ? "border-[#cf2f7d]/25 bg-[#25101b]" : "border-white/10 bg-[#111111]"}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3a1224] text-[#d63384]">
                        <MaterialIcon name={notification.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-semibold text-white">{notification.title}</span>
                          {notification.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#cf2f7d]" /> : null}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-[#8ea0bd]">{notification.description}</span>
                        <span className="mt-2 block text-xs text-[#65728a]">{notification.time}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/10 p-4">
                  <label className="relative block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71809b]"><MaterialIcon name="search" className="h-5 w-5" /></span>
                    <input aria-label="Pesquisar conversas" placeholder="Pesquisar conversas..." className="w-full rounded-xl border border-white/10 bg-[#111111] py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-[#65728a] focus:border-[#cf2f7d]/55" />
                  </label>
                </div>
                <div className="max-h-[215px] overflow-y-auto border-b border-white/10 p-3">
                  {conversations.map((conversation) => (
                    <button key={conversation.id} type="button" onClick={() => { setActiveConversation(conversation); setSentMessages([]); }} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${activeConversation.id === conversation.id ? "bg-[#3a1224]" : "hover:bg-white/5"}`}>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f2d4b] text-[#91a4c4]"><MaterialIcon name="person" className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1"><span className="flex justify-between gap-2"><strong className="truncate text-sm text-white">{conversation.name}</strong><small className="text-[#65728a]">{conversation.time}</small></span><span className="mt-1 block truncate text-xs text-[#8ea0bd]">{conversation.preview}</span></span>
                    </button>
                  ))}
                </div>
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="border-b border-white/10 px-5 py-3"><p className="font-semibold text-white">{activeConversation.name}</p><p className="text-xs text-[#8ea0bd]">{activeConversation.role}</p></div>
                  <div className="flex-1 space-y-3 overflow-y-auto p-5">
                    <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-[#1b1b1b] px-4 py-3 text-sm leading-5 text-[#d9dfeb]">{activeConversation.preview}</div>
                    {sentMessages.map((sentMessage, index) => <div key={`${sentMessage}-${index}`} className="ml-auto max-w-[82%] rounded-2xl rounded-tr-sm bg-[#cf2f7d] px-4 py-3 text-sm leading-5 text-white">{sentMessage}</div>)}
                  </div>
                  <form onSubmit={submitMessage} className="flex gap-3 border-t border-white/10 p-4">
                    <input value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Digite sua mensagem" placeholder="Digite uma mensagem..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none placeholder:text-[#65728a] focus:border-[#cf2f7d]/55" />
                    <button type="submit" disabled={!message.trim()} className="rounded-xl bg-[#cf2f7d] px-5 text-sm font-bold text-white transition hover:bg-[#df3e8d] disabled:cursor-not-allowed disabled:opacity-40">Enviar</button>
                  </form>
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
