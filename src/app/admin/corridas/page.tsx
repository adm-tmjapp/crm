"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState,
} from "@/components/admin/admin-state";
import { MaterialIcon } from "@/components/admin/material-icon";
import {
  AdminApiError,
  adminCancelRide,
  adminReassignDriver,
  deleteRides,
  getRideDetails,
  listRides,
  type AdminRide,
  type AdminRideDetails,
} from "@/services/admin-content-service";

const rideStatuses = ["pending", "accepted", "ongoing", "completed", "canceled"] as const;
const knownPaymentMethods = ["PIX", "CREDIT_CARD", "CASH"];

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function formatMoney(value?: number | null, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(Number(value || 0));
}

function getPassengerDisplayName(ride: AdminRide) {
  return ride.rider?.name || "Sem passageiro";
}

function getPassengerSecondaryId(ride: AdminRide) {
  return ride.rider?.id || ride.passengerId || ride.id;
}

function getRideTotalAmount(ride: AdminRide | AdminRideDetails) {
  const fare = ride.fare as
    | { total_amount?: number | null; totalAmount?: number | null }
    | undefined;

  return fare?.total_amount ?? fare?.totalAmount ?? ride.product?.price ?? 0;
}

function getRideCurrency(ride: AdminRide | AdminRideDetails) {
  return ride.fare?.currency || "BRL";
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "pending":
      return "Pendente";
    case "accepted":
      return "Aceita";
    case "ongoing":
      return "Em andamento";
    case "completed":
      return "Concluída";
    case "canceled":
      return "Cancelada";
    default:
      return status || "-";
  }
}

function getStatusTone(status?: string | null) {
  switch (status) {
    case "completed":
      return "bg-[#03271c] text-[#19db90]";
    case "ongoing":
      return "bg-[#10233f] text-[#6da3ff]";
    case "accepted":
      return "bg-[#27193b] text-[#c88fff]";
    case "canceled":
      return "bg-[#331619] text-[#ff8b96]";
    default:
      return "bg-[#2a220f] text-[#ffc857]";
  }
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#8ea0bd]">{label}</p>
      <p className="mt-2 text-sm text-white">{value || "-"}</p>
    </div>
  );
}

export default function AdminRidesPage() {
  const [items, setItems] = useState<AdminRide[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busyAction, setBusyAction] = useState("");
  const [detailRideId, setDetailRideId] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState<AdminRideDetails | null>(null);

  const limit = 12;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const payload = await listRides({
        statuses: statusFilter === "ALL" ? undefined : [statusFilter],
        page,
        limit,
        query: query.trim() || undefined,
        paymentMethod: paymentFilter === "ALL" ? undefined : paymentFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setItems(payload.rides);
      setSummary(payload.summary || {});
      setTotal(payload.total || 0);
      setSelectedIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar corridas.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, paymentFilter, query, statusFilter, startDate, endDate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      load();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [load]);

  async function handleDelete(ids: string[]) {
    if (!ids.length) return;

    setBusyAction(ids.length === 1 ? ids[0] : "bulk");

    try {
      await deleteRides(ids);
      if (detailRideId && ids.includes(detailRideId)) {
        setDetailRideId("");
        setDetail(null);
        setDetailError("");
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao remover corridas.",
      );

      if (!(actionError instanceof AdminApiError && actionError.status === 404)) {
        await load();
      }
    } finally {
      setBusyAction("");
    }
  }

  async function handleCancelRide(id: string) {
    const reason = window.prompt("Motivo do cancelamento:");
    if (reason === null) return;
    setBusyAction("CANCELING");
    try {
      await adminCancelRide(id, reason);
      await load();
      setDetailRideId("");
    } catch (err) {
      alert("Erro ao cancelar: " + (err instanceof AdminApiError ? err.message : "Erro desconhecido"));
    } finally {
      setBusyAction("");
    }
  }

  async function handleReassignDriver(id: string) {
    const driverId = window.prompt("Digite o User ID do novo motorista:");
    if (!driverId) return;
    setBusyAction("REASSIGNING");
    try {
      await adminReassignDriver(id, driverId);
      await load();
      setDetailRideId("");
      alert("Motorista reatribuído com sucesso!");
    } catch (err) {
      alert("Erro ao reatribuir: " + (err instanceof AdminApiError ? err.message : "Erro desconhecido"));
    } finally {
      setBusyAction("");
    }
  }

  function handleExportCSV() {
    if (!items.length) return;

    const headers = ["ID", "Status", "Passageiro", "Motorista", "Valor", "Data", "Pagamento"];
    const rows = items.map((ride) => [
      ride.id,
      getStatusLabel(ride.status),
      getPassengerDisplayName(ride),
      ride.driver?.name || "-",
      getRideTotalAmount(ride),
      formatDateTime(ride.requestedAt),
      ride.paymentMethod || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `corridas_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleOpenDetails(rideId: string) {
    setDetailRideId(rideId);
    setDetailLoading(true);
    setDetailError("");
    setDetail(null);

    try {
      const payload = await getRideDetails(rideId);
      setDetail(payload);
    } catch (loadError) {
      setDetailError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar detalhes da corrida.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  const paymentMethods = useMemo(() => {
    const methods = new Set<string>(knownPaymentMethods);
    items.forEach((ride) => {
      if (ride.paymentMethod) methods.add(ride.paymentMethod);
    });
    return Array.from(methods);
  }, [items]);

  const allSelected = items.length > 0 && items.every((ride) => selectedIds.includes(ride.id));

  function toggleSelection(rideId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(rideId)
        ? currentIds.filter((id) => id !== rideId)
        : [...currentIds, rideId],
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(items.map((ride) => ride.id));
  }

  return (
    <AdminPageShell
      title="Corridas"
      description="Operação em tempo administrativo, com filtros reais, paginação e detalhamento da jornada."
    >
      {error ? <AdminErrorState message={error} /> : null}

      <>
          <div className="grid gap-3 md:grid-cols-5">
            {rideStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(statusFilter === status ? "ALL" : status);
                  setPage(1);
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  statusFilter === status
                    ? "border-[#d43182] bg-[#231118]"
                    : "border-white/10 bg-[#111111] hover:border-white/20"
                }`}
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8ea0bd]">
                  {getStatusLabel(status)}
                </div>
                <div className="mt-2 text-[28px] font-semibold leading-none text-white">
                  {summary[status] || 0}
                </div>
              </button>
            ))}
          </div>

          <section className="mt-5 rounded-[24px] border border-white/10 bg-[#111111] p-5">
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Buscar corrida
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="ID, passageiro, motorista ou endereço"
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[13px] text-white outline-none placeholder:text-[#5f6d83]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Status
                </span>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[13px] text-white outline-none"
                >
                  <option value="ALL">Todos</option>
                  {rideStatuses.map((status) => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Pagamento
                </span>
                <select
                  value={paymentFilter}
                  onChange={(event) => {
                    setPaymentFilter(event.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[13px] text-white outline-none"
                >
                  <option value="ALL">Todos</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Data Início
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#d43182]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Data Fim
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-[#d43182]"
                />
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("ALL");
                    setPaymentFilter("ALL");
                    setStartDate("");
                    setEndDate("");
                    setPage(1);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedIds)}
                  disabled={!selectedIds.length || busyAction === "DELETING"}
                  className="rounded-xl bg-[#2c1013] px-4 py-3 text-sm font-medium text-[#ff7b8a] transition hover:brightness-110 disabled:opacity-50"
                >
                  Remover
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={!items.length}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  <MaterialIcon name="download" className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-[#8ea0bd]">
              <span>
                Exibindo <span className="text-white">{items.length}</span> de{" "}
                <span className="text-white">{total}</span> corridas
              </span>
              <span>
                Selecionadas: <span className="text-white">{selectedIds.length}</span>
              </span>
              <span>
                Página <span className="text-white">{page}</span> de{" "}
                <span className="text-white">{totalPages}</span>
              </span>
            </div>
          </section>
        </>

      {loading && !items.length ? (
        <div className="mt-5">
          <AdminLoadingState label="Carregando corridas..." />
        </div>
      ) : null}

      {!loading && !items.length ? (
        <div className="mt-5">
          <AdminEmptyState label="Nenhuma corrida encontrada." />
        </div>
      ) : null}

      {items.length ? (
        <div className={`transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
            <div className="hidden grid-cols-[0.3fr_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/10 px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-[#8ea0bd] lg:grid">
              <label className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-black"
                />
              </label>
              <span>Passageiro</span>
              <span>Motorista</span>
              <span>Status</span>
              <span>Pagamento</span>
              <span>Valor</span>
              <span>Ações</span>
            </div>

            <div className="divide-y divide-white/10">
              {items.map((ride) => (
                <div key={ride.id} className="px-4 py-4 lg:px-5">
                  <div className="grid gap-4 lg:grid-cols-[0.3fr_1.2fr_1fr_0.8fr_0.8fr_0.8fr_1fr] lg:items-center">
                    <label className="hidden items-center justify-center lg:flex">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ride.id)}
                        onChange={() => toggleSelection(ride.id)}
                        className="h-4 w-4 rounded border-white/20 bg-black"
                      />
                    </label>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {getPassengerDisplayName(ride)}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#708099]">
                        {getPassengerSecondaryId(ride)}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#708099]">
                        {ride.locations?.pickupAddress || "Sem origem informada"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {ride.driver?.name || "Sem motorista"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#708099]">
                        {ride.vehicle?.model || "Sem veículo"}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusTone(ride.status)}`}
                      >
                        {getStatusLabel(ride.status)}
                      </span>
                    </div>

                    <div className="text-sm text-[#cfd6e4]">{ride.paymentMethod || "-"}</div>

                    <div className="text-sm font-semibold text-white">
                      {formatMoney(getRideTotalAmount(ride), getRideCurrency(ride))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(ride.id)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/5"
                      >
                        Detalhes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete([ride.id])}
                        disabled={busyAction === ride.id}
                        className="rounded-xl bg-[#2c1013] px-3 py-2 text-xs font-medium text-[#ff7b8a] transition hover:brightness-110 disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-[#8ea0bd] lg:hidden">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span>{getStatusLabel(ride.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pagamento</span>
                      <span>{ride.paymentMethod || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Solicitada em</span>
                      <span>{formatDateTime(ride.requestedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-40"
            >
              Página anterior
            </button>
            <div className="text-sm text-[#8ea0bd]">
              {page} / <span className="text-white">{totalPages}</span>
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:opacity-40"
            >
              Próxima página
            </button>
          </div>
        </div>
      ) : null}

      {detailRideId ? (
        <div className="fixed inset-0 z-50 bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d0d] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8ea0bd]">
                  Detalhamento da corrida
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {detail?.id || detailRideId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailRideId("");
                  setDetail(null);
                  setDetailError("");
                }}
                className="rounded-2xl border border-white/10 p-3 text-white transition hover:bg-white/5"
              >
                <MaterialIcon name="close" className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {detailError ? <AdminErrorState message={detailError} /> : null}
              {detailLoading ? (
                <AdminLoadingState label="Carregando detalhes da corrida..." />
              ) : null}

              {!detailLoading && detail ? (
                <div className="space-y-6">
                  <section className="grid gap-4 xl:grid-cols-4">
                    <DetailRow label="Status atual" value={detail.status} />
                    <DetailRow label="Método de pagamento" value={detail.paymentMethod} />
                    <DetailRow label="Solicitada em" value={formatDateTime(detail.requestedAt)} />
                    <DetailRow label="Concluída em" value={formatDateTime(detail.completedAt)} />
                  </section>

                  <section className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Passageiro</h3>
                      <div className="mt-4 grid gap-3">
                        <DetailRow label="Nome" value={detail.passenger?.name} />
                        <DetailRow label="ID" value={detail.passenger?.id} />
                        <DetailRow label="Email" value={detail.passenger?.email} />
                        <DetailRow label="Telefone" value={detail.passenger?.phone} />
                        <DetailRow label="Status" value={detail.passenger?.authStatus} />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Motorista</h3>
                      <div className="mt-4 grid gap-3">
                        <DetailRow label="Nome" value={detail.driver?.name} />
                        <DetailRow label="ID" value={detail.driver?.id} />
                        <DetailRow label="Email" value={detail.driver?.email} />
                        <DetailRow label="Telefone" value={detail.driver?.phone} />
                        <DetailRow label="Status" value={detail.driver?.authStatus} />
                        <DetailRow label="Rating" value={detail.driver?.rating ?? "-"} />
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Tracking e status</h3>
                        <span className="text-sm text-[#8ea0bd]">
                          {detail.timeline?.length || 0} eventos
                        </span>
                      </div>
                      <div className="mt-5 space-y-3">
                        {(detail.timeline || []).map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                  item.done
                                    ? "bg-[#03271c] text-[#0bd38a]"
                                    : "bg-white/5 text-[#8ea0bd]"
                                }`}
                              >
                                <MaterialIcon
                                  name={item.done ? "check" : "expand_more"}
                                  className="h-4 w-4"
                                />
                              </span>
                              <div>
                                <p className="text-sm font-medium text-white">{item.label}</p>
                                <p className="text-xs text-[#8ea0bd]">{item.key}</p>
                              </div>
                            </div>
                            <p className="text-sm text-[#cfd6e4]">{formatDateTime(item.at)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Valores</h3>
                      <div className="mt-4 grid gap-3">
                        <DetailRow
                          label="Total"
                          value={formatMoney(getRideTotalAmount(detail), getRideCurrency(detail))}
                        />
                        <DetailRow
                          label="Base"
                          value={formatMoney(
                            detail.fare?.breakdown?.baseFare,
                            detail.fare?.currency || "BRL",
                          )}
                        />
                        <DetailRow
                          label="Distância"
                          value={formatMoney(
                            detail.fare?.breakdown?.distanceFee,
                            detail.fare?.currency || "BRL",
                          )}
                        />
                        <DetailRow
                          label="Tempo"
                          value={formatMoney(
                            detail.fare?.breakdown?.timeFee,
                            detail.fare?.currency || "BRL",
                          )}
                        />
                        <DetailRow
                          label="Serviço"
                          value={formatMoney(
                            detail.fare?.breakdown?.serviceFee,
                            detail.fare?.currency || "BRL",
                          )}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Origem e destino</h3>
                      <div className="mt-4 grid gap-3">
                        <DetailRow label="Origem" value={detail.locations?.pickup?.address} />
                        <DetailRow
                          label="Coordenadas origem"
                          value={
                            detail.locations?.pickup?.coordinates
                              ? `${detail.locations.pickup.coordinates.latitude}, ${detail.locations.pickup.coordinates.longitude}`
                              : "-"
                          }
                        />
                        <DetailRow
                          label="Destino"
                          value={detail.locations?.destination?.address}
                        />
                        <DetailRow
                          label="Coordenadas destino"
                          value={
                            detail.locations?.destination?.coordinates
                              ? `${detail.locations.destination.coordinates.latitude}, ${detail.locations.destination.coordinates.longitude}`
                              : "-"
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Pagamento e rota</h3>
                      <div className="mt-4 grid gap-3">
                        <DetailRow
                          label="Distância"
                          value={
                            detail.route?.distanceKm ? `${detail.route.distanceKm} km` : "-"
                          }
                        />
                        <DetailRow
                          label="Duração"
                          value={
                            detail.route?.durationMin ? `${detail.route.durationMin} min` : "-"
                          }
                        />
                        <DetailRow label="Produto" value={detail.product?.name} />
                        <DetailRow label="Observações" value={detail.notes} />
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-[#111111] p-5">
                      <h3 className="text-lg font-semibold text-white">Mapa e Ações</h3>
                      <div className="mt-4 space-y-4">
                        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                            <MaterialIcon name="map" className="mb-2 h-8 w-8 text-[#8ea0bd]" />
                            <p className="text-xs text-[#8ea0bd]">Visualize o trajeto no Google Maps</p>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(detail.locations?.pickup?.address || "")}&destination=${encodeURIComponent(detail.locations?.destination?.address || "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 text-sm font-semibold text-[#d43182] hover:underline"
                            >
                              Abrir Trajeto Completo ↗
                            </a>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button
                            type="button"
                            onClick={() => handleReassignDriver(detail.id)}
                            disabled={busyAction === "REASSIGNING"}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                          >
                            Trocar Motorista
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelRide(detail.id)}
                            disabled={busyAction === "CANCELING"}
                            className="w-full rounded-2xl bg-[#2c1013] py-3 text-sm font-semibold text-[#ff7b8a] transition hover:brightness-110 disabled:opacity-50"
                          >
                            Cancelar Corrida
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
