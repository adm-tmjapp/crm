"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/admin/material-icon";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import {
  approveDocument,
  batchApproveDocuments,
  batchRejectDocuments,
  listPendingDocuments,
  rejectDocument,
  type AdminDocument
} from "@/services/admin-content-service";
import { getApiBaseUrl } from "@/lib/api";

function resolveFileUrl(fileUrl?: string | null) {
  if (!fileUrl) return "";
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    return fileUrl;
  }

  const apiBase = getApiBaseUrl().replace(/\/api\/v2$/, "");
  return `${apiBase}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}

function isPreviewableImage(fileUrl?: string | null) {
  const normalized = String(fileUrl || "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif"].some((ext) =>
    normalized.includes(ext)
  );
}

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<AdminDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<AdminDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingDocuments());
      setSelectedIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar documentos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      if (action === "approve") {
        await approveDocument(id);
      } else {
        await rejectDocument(id);
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao atualizar documento."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleBatch(action: "approve" | "reject") {
    if (!selectedIds.length) return;

    setBusyId(action);
    try {
      if (action === "approve") {
        await batchApproveDocuments(selectedIds);
      } else {
        await batchRejectDocuments(selectedIds);
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao atualizar documentos em lote."
      );
    } finally {
      setBusyId("");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <AdminPageShell
      title="Aprovacao de Documentos"
      description="Fila operacional enriquecida com dados do usuario e acoes em lote."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {!loading && items.length ? (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-[#8ea0bd]">
            {selectedIds.length} selecionado(s) de {items.length}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleBatch("approve")}
              disabled={!selectedIds.length || busyId === "approve" || busyId === "reject"}
              className="rounded-2xl bg-[#03271c] px-4 py-3 text-sm font-medium text-[#0bd38a] disabled:opacity-50"
            >
              Aprovar selecionados
            </button>
            <button
              type="button"
              onClick={() => handleBatch("reject")}
              disabled={!selectedIds.length || busyId === "approve" || busyId === "reject"}
              className="rounded-2xl bg-[#2c1013] px-4 py-3 text-sm font-medium text-[#ff5a63] disabled:opacity-50"
            >
              Rejeitar selecionados
            </button>
          </div>
        </div>
      ) : null}
      {loading ? <AdminLoadingState label="Carregando documentos..." /> : null}
      {!loading && !items.length ? (
        <AdminEmptyState label="Nenhum documento pendente encontrado." />
      ) : null}
      {!loading && items.length ? (
        <div className="grid gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex items-center justify-between gap-6 rounded-[24px] border border-white/10 bg-[#111111] p-6"
            >
              <div className="flex items-center gap-5">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="h-5 w-5 rounded border-white/20 bg-black accent-[#cf2f7d]"
                  />
                </label>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2d1735] text-[#cf2f7d]">
                  <MaterialIcon name="fact_check" className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-white">
                    {item.user?.name || item.user?.email || "Usuario sem nome"}
                  </h2>
                  <p className="mt-1 text-[15px] text-[#8ea0bd]">
                    {item.type || "DOCUMENTO"} {item.side ? `• ${item.side}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-[#708099]">
                    {item.user?.email || item.user?.phone || "Sem contato"}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      disabled={!item.fileUrl}
                      className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Visualizar documento
                    </button>
                    {item.filename ? (
                      <span className="text-[12px] text-[#8ea0bd]">{item.filename}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAction(item.id, "approve")}
                  disabled={busyId === item.id}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#03271c] text-[#0bd38a] disabled:opacity-50"
                >
                  <MaterialIcon name="check" className="h-6 w-6" />
                </button>
                <button
                  onClick={() => handleAction(item.id, "reject")}
                  disabled={busyId === item.id}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2c1013] text-[#ff5a63] disabled:opacity-50"
                >
                  <MaterialIcon name="close" className="h-6 w-6" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {previewItem ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-6 py-8">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#111111] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">
                  {previewItem.type || "Documento"}{" "}
                  {previewItem.side ? `• ${previewItem.side}` : ""}
                </h2>
                <p className="mt-1 text-[13px] text-[#8ea0bd]">
                  {previewItem.user?.name || previewItem.user?.email || "Usuario"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={resolveFileUrl(previewItem.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                >
                  Abrir em nova aba
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2c1013] text-[#ff5a63]"
                >
                  <MaterialIcon name="close" className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-black p-4">
              {isPreviewableImage(previewItem.fileUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveFileUrl(previewItem.fileUrl)}
                  alt={previewItem.filename || "Documento"}
                  className="mx-auto max-h-[76vh] rounded-xl object-contain"
                />
              ) : (
                <iframe
                  src={resolveFileUrl(previewItem.fileUrl)}
                  title={previewItem.filename || "Documento"}
                  className="h-[76vh] w-full rounded-xl border border-white/10 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
