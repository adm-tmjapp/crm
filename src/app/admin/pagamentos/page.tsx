"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import {
  deletePaymentSettings,
  getPaymentSettings,
  getSmsUsage,
  listPaymentSettings,
  listPaymentSettingsAuditLogs,
  listPayments,
  listProducts,
  updatePaymentSettings,
  type AdminPayment,
  type AdminPaymentSettings,
  type AdminPaymentSettingsAuditLog,
  type AdminProduct,
  type PaymentMethod,
  type PaymentScopeType,
  type SmsUsage
} from "@/services/admin-content-service";

type PaymentSettingsDraft = {
  provider: string;
  enabledMethods: PaymentMethod[];
  defaultMethod: PaymentMethod;
  allowSavedCard: boolean;
  scopeType: PaymentScopeType;
  scopeId: string;
};

const scopeLabels: Record<PaymentScopeType, string> = {
  GLOBAL: "Global",
  CITY: "Cidade",
  PRODUCT: "Produto",
  OPERATION: "Operacao"
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function toDraft(settings: AdminPaymentSettings): PaymentSettingsDraft {
  return {
    provider: settings.provider || "asaas",
    enabledMethods: settings.enabledMethods?.length
      ? settings.enabledMethods
      : ["PIX", "CREDIT_CARD", "CASH"],
    defaultMethod: (settings.defaultMethod || settings.enabledMethods?.[0] || "PIX") as PaymentMethod,
    allowSavedCard: !!settings.allowSavedCard,
    scopeType: settings.scopeType || "GLOBAL",
    scopeId: settings.scopeId || ""
  };
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
      {children}
    </span>
  );
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [smsUsage, setSmsUsage] = useState<SmsUsage | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<AdminPaymentSettings | null>(null);
  const [settingsList, setSettingsList] = useState<AdminPaymentSettings[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminPaymentSettingsAuditLog[]>([]);
const [draft, setDraft] = useState<PaymentSettingsDraft>({
    provider: "asaas",
    enabledMethods: ["PIX", "CREDIT_CARD", "CASH"],
    defaultMethod: "PIX",
    allowSavedCard: false,
    scopeType: "GLOBAL",
    scopeId: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSettings(scopeType = draft.scopeType, scopeId = draft.scopeId) {
    const payload = await getPaymentSettings({
      scopeType,
      scopeId: scopeType === "GLOBAL" ? null : scopeId || null
    });

    setPaymentSettings(payload);
    setDraft(toDraft(payload));
  }

  async function loadAll(scopeType = draft.scopeType, scopeId = draft.scopeId) {
    setLoading(true);
    setError("");

    try {
      const [paymentsPayload, usage, productsPayload, settingsPayload, listPayload, auditPayload] =
        await Promise.all([
          listPayments({ page: 1, limit: 30 }),
          getSmsUsage(),
          listProducts(),
          getPaymentSettings({
            scopeType,
            scopeId: scopeType === "GLOBAL" ? null : scopeId || null
          }),
          listPaymentSettings(),
          listPaymentSettingsAuditLogs()
        ]);

      setPayments(paymentsPayload.payments || []);
      setSmsUsage(usage);
      setProducts(productsPayload);
      setPaymentSettings(settingsPayload);
      setDraft(toDraft(settingsPayload));
      setSettingsList(listPayload.data || []);
      setAuditLogs(auditPayload.data || []);
      setSuccessMessage("");
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar pagamentos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialLoad() {
      setLoading(true);
      setError("");

      try {
        const [paymentsPayload, usage, productsPayload, settingsPayload, listPayload, auditPayload] =
          await Promise.all([
            listPayments({ page: 1, limit: 30 }),
            getSmsUsage(),
            listProducts(),
            getPaymentSettings({
              scopeType: "GLOBAL",
              scopeId: null
            }),
            listPaymentSettings(),
            listPaymentSettingsAuditLogs()
          ]);

        setPayments(paymentsPayload.payments || []);
        setSmsUsage(usage);
        setProducts(productsPayload);
        setPaymentSettings(settingsPayload);
        setDraft(toDraft(settingsPayload));
        setSettingsList(listPayload.data || []);
        setAuditLogs(auditPayload.data || []);
        setSuccessMessage("");
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Falha ao carregar pagamentos."
        );
      } finally {
        setLoading(false);
      }
    }

    initialLoad();
  }, []);

  const paymentSummary = useMemo(() => {
    const grouped = new Map<string, { count: number; amount: number }>();
    payments.forEach((payment) => {
      const key = payment.paymentMethod || "NAO_INFORMADO";
      const current = grouped.get(key) || { count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(payment.amount || 0);
      grouped.set(key, current);
    });
    return Array.from(grouped.entries());
  }, [payments]);

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  function toggleMethod(method: PaymentMethod) {
    setDraft((current) => {
      const enabledMethods = current.enabledMethods.includes(method)
        ? current.enabledMethods.filter((item) => item !== method)
        : [...current.enabledMethods, method];

      const nextDefault = enabledMethods.includes(current.defaultMethod)
        ? current.defaultMethod
        : (enabledMethods[0] || "PIX");

      return {
        ...current,
        enabledMethods,
        defaultMethod: nextDefault as PaymentMethod,
        allowSavedCard:
          method === "CREDIT_CARD" || enabledMethods.includes("CREDIT_CARD")
            ? current.allowSavedCard
            : false
      };
    });
  }

  async function handleScopeChange(scopeType: PaymentScopeType, scopeId = "") {
    setDraft((current) => ({
      ...current,
      scopeType,
      scopeId
    }));

    if (scopeType === "GLOBAL" || scopeId) {
      await loadSettings(scopeType, scopeId);
      return;
    }

    setPaymentSettings(null);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await updatePaymentSettings({
        provider: draft.provider,
        enabledMethods: draft.enabledMethods,
        defaultMethod: draft.defaultMethod,
        allowSavedCard: draft.allowSavedCard,
        scopeType: draft.scopeType,
        scopeId: draft.scopeType === "GLOBAL" ? null : draft.scopeId || null
      });

      setSuccessMessage(response.message);
      await loadAll(draft.scopeType, draft.scopeId);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao salvar configuração de pagamentos."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, scopeType: PaymentScopeType) {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await deletePaymentSettings(id);
      setSuccessMessage(response.message);
      await loadAll(scopeType, "");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Falha ao remover override."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="Pagamentos"
      description="Fluxo financeiro, política de meios de pagamento por escopo e auditoria operacional."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {loading ? <AdminLoadingState label="Carregando pagamentos..." /> : null}

      {!loading ? (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-[#8ea0bd]">
              Registros
            </div>
            <div className="mt-3 text-4xl font-bold text-white">{payments.length}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-[#8ea0bd]">
              Total movimentado
            </div>
            <div className="mt-3 text-4xl font-bold text-white">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-6">
            <div className="text-sm uppercase tracking-[0.18em] text-[#8ea0bd]">
              SMS no mês
            </div>
            <div className="mt-3 text-4xl font-bold text-white">
              {smsUsage?.totalMessages || 0}
            </div>
          </div>
        </div>
      ) : null}

      {!loading ? (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold text-white">
                  Configuração de meios de pagamento
                </h2>
                <p className="mt-1 text-[14px] text-[#8ea0bd]">
                  Habilite PIX, cartão e dinheiro e defina a política efetiva por escopo.
                </p>
              </div>
              <div className="rounded-xl bg-[#13253c] px-3 py-2 text-[12px] text-[#8fb4f2]">
                {paymentSettings?.isInherited
                  ? `Herdado de ${scopeLabels[paymentSettings.sourceScopeType || "GLOBAL"]}`
                  : "Escopo proprio"}
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <InputLabel>Escopo</InputLabel>
                <select
                  value={draft.scopeType}
                  onChange={(event) =>
                    handleScopeChange(event.target.value as PaymentScopeType, "")
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
                >
                  {(["GLOBAL", "CITY", "PRODUCT", "OPERATION"] as PaymentScopeType[]).map(
                    (scope) => (
                      <option key={scope} value={scope}>
                        {scopeLabels[scope]}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="block">
                <InputLabel>Provider</InputLabel>
                <select
                  value={draft.provider}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, provider: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
                >
                  <option value="asaas">Asaas</option>
                </select>
              </label>

              {draft.scopeType === "PRODUCT" ? (
                <label className="block md:col-span-2">
                  <InputLabel>Produto</InputLabel>
                  <select
                    value={draft.scopeId}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, scopeId: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name || product._id}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              {draft.scopeType !== "GLOBAL" && draft.scopeType !== "PRODUCT" ? (
                <label className="block md:col-span-2">
                  <InputLabel>
                    {draft.scopeType === "CITY" ? "ID da cidade" : "ID da operacao"}
                  </InputLabel>
                  <input
                    type="text"
                    value={draft.scopeId}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, scopeId: event.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
                    placeholder="Informe o identificador do escopo"
                  />
                </label>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#8ea0bd]">
                  Meios habilitados
                </p>
                <div className="mt-4 space-y-3">
                {(["PIX", "CREDIT_CARD", "CASH"] as PaymentMethod[]).map((method) => (
                  <label
                    key={method}
                    className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
                  >
                    <span className="text-[14px] text-white">
                      {method === "CASH" ? "DINHEIRO" : method}
                    </span>
                      <input
                        type="checkbox"
                        checked={draft.enabledMethods.includes(method)}
                        onChange={() => toggleMethod(method)}
                        className="h-5 w-5 rounded border-white/20 bg-black accent-[#cf2f7d]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black p-4">
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#8ea0bd]">
                  Política
                </p>
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <InputLabel>Método padrão</InputLabel>
                    <select
                      value={draft.defaultMethod}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          defaultMethod: event.target.value as PaymentMethod
                        }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#111111] px-3.5 py-3 text-[14px] text-white outline-none"
                    >
                      {draft.enabledMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                    <div>
                      <p className="text-[14px] text-white">Permitir cartão salvo</p>
                      <p className="mt-1 text-[12px] text-[#8ea0bd]">
                        Exige CREDIT_CARD habilitado no escopo.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.allowSavedCard}
                      disabled={!draft.enabledMethods.includes("CREDIT_CARD")}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          allowSavedCard: event.target.checked
                        }))
                      }
                      className="h-5 w-5 rounded border-white/20 bg-black accent-[#cf2f7d] disabled:opacity-40"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black px-4 py-4">
              <div className="text-[13px] text-[#8ea0bd]">
                Ultima alteracao:{" "}
                <span className="text-white">
                  {paymentSettings?.updatedAt
                    ? new Date(paymentSettings.updatedAt).toLocaleString("pt-BR")
                    : "sem registro"}
                </span>
                {" • "}
                <span className="text-white">
                  {paymentSettings?.updatedBy?.name || "Sistema"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {draft.scopeType !== "GLOBAL" ? (
                  <button
                    type="button"
                    onClick={() => handleScopeChange(draft.scopeType, draft.scopeId)}
                    disabled={!draft.scopeId || saving}
                    className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Carregar escopo
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#cf2f7d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar configuração"}
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
            <h2 className="text-[20px] font-semibold text-white">Overrides por escopo</h2>
            <p className="mt-1 text-[14px] text-[#8ea0bd]">
              Lista das configurações específicas que sobrescrevem a regra global.
            </p>

            <div className="mt-5 space-y-3">
              {settingsList.length ? (
                settingsList.map((item) => (
                  <div
                    key={`${item.id}-${item.scopeType}`}
                    className="rounded-2xl border border-white/10 bg-black p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[14px] font-semibold text-white">
                          {scopeLabels[item.scopeType]}
                        </p>
                        <p className="mt-1 text-[12px] text-[#8ea0bd]">
                          {item.scopeId || "regra global"} • {item.enabledMethods.join(" + ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleScopeChange(item.scopeType, item.scopeId || "")}
                          className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                        >
                          Abrir
                        </button>
                        {item.id ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id as string, item.scopeType)}
                            disabled={saving}
                            className="rounded-lg bg-[#2c1013] px-3 py-2 text-[12px] text-[#ff7b8a] disabled:opacity-50"
                          >
                            Remover
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <AdminEmptyState label="Nenhum override configurado." />
              )}
            </div>
          </section>
        </div>
      ) : null}

      {!loading && !payments.length ? (
        <AdminEmptyState label="Nenhum pagamento encontrado." />
      ) : null}

      {!loading && payments.length ? (
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
            <div className="grid grid-cols-[1fr_0.7fr_0.8fr] gap-4 border-b border-white/10 px-6 py-4 text-sm uppercase tracking-[0.18em] text-[#8ea0bd]">
              <span>Metodo</span>
              <span>Qtd.</span>
              <span>Total</span>
            </div>
            <div className="divide-y divide-white/10">
              {paymentSummary.map(([method, values]) => (
                <div
                  key={method}
                  className="grid grid-cols-[1fr_0.7fr_0.8fr] gap-4 px-6 py-5 text-[15px]"
                >
                  <span className="text-white">
                    {method === "CASH" ? "DINHEIRO" : method}
                  </span>
                  <span className="text-[#8ea0bd]">{values.count}</span>
                  <span className="text-white">{formatCurrency(values.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]">
            <div className="border-b border-white/10 px-6 py-4">
              <h2 className="text-[16px] font-semibold text-white">Auditoria de pagamentos</h2>
            </div>
            <div className="divide-y divide-white/10">
              {auditLogs.length ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 text-[13px]">
                    <p className="font-medium text-white">{log.action}</p>
                    <p className="mt-1 text-[#8ea0bd]">
                      {scopeLabels[(log.scopeType || "GLOBAL") as PaymentScopeType]} •{" "}
                      {log.scopeId || "global"}
                    </p>
                    <p className="mt-1 text-[#8ea0bd]">
                      {log.adminUser?.name || "Admin"} •{" "}
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-6 py-6 text-[14px] text-[#8ea0bd]">
                  Nenhum evento de auditoria encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
