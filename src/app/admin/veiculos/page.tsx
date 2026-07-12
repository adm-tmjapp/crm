"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  approveVehicle,
  batchApproveVehicles,
  batchRejectVehicles,
  listPendingVehicles,
  rejectVehicle,
  type AdminVehicle
} from "@/services/admin-content-service";

export default function AdminVehiclesPage() {
  const [items, setItems] = useState<AdminVehicle[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setItems(await listPendingVehicles());
      setSelectedIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar veiculos."
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
        await approveVehicle(id);
      } else {
        await rejectVehicle(id);
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao atualizar veiculo."
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
        await batchApproveVehicles(selectedIds);
      } else {
        await batchRejectVehicles(selectedIds);
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao atualizar veiculos em lote."
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
      title="Veiculos Pendentes"
      description="Fila de validacao dos veiculos enriquecida com o proprietario e moderacao em lote."
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
      {loading ? <AdminLoadingState label="Carregando veiculos..." /> : null}
      {!loading && !items.length ? (
        <AdminEmptyState label="Nenhum veiculo pendente encontrado." />
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#24344f] text-[#91a4c4]">
                  <MaterialIcon name="directions_car" className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-white">
                    {`${item.manufacturer || ""} ${item.modelName || ""}`.trim() ||
                      "Veiculo pendente"}
                  </h2>
                  <p className="mt-1 text-[15px] text-[#8ea0bd]">
                    {item.vehiclePlate || "SEM PLACA"} •{" "}
                    {item.documentationStatus || item.status || "PENDING"}
                  </p>
                  <p className="mt-1 text-sm text-[#708099]">
                    {item.owner?.name || item.owner?.email || "Proprietario nao identificado"}
                  </p>
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
    </AdminPageShell>
  );
}
