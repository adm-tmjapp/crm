"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import {
  createProduct,
  createTarifa,
  deleteTarifa,
  deleteProduct,
  listAuditLogs,
  listProducts,
  listTarifas,
  updateTarifa,
  updateProduct,
  type AdminAuditLog,
  type AdminProduct,
  type AdminTarifa
} from "@/services/admin-content-service";

type PricingDraft = {
  label: string;
  valorBase: number;
  valorKm: number;
  custoFixo: number;
  taxaIntermediacao: number;
  vigenciaInicio: string;
  vigenciaFim: string;
  status: boolean;
};

type SimulationInput = {
  distanceKm: number;
};

type ProductDraft = {
  id?: string;
  name: string;
  icon: string;
  taxaId: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDateInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function toDraft(tarifa?: AdminTarifa): PricingDraft {
  return {
    label: tarifa?.name || "",
    valorBase: Number(tarifa?.valorBase || 0),
    valorKm: Number(tarifa?.valorKm || 0),
    custoFixo: Number(tarifa?.custoFixo || 0),
    taxaIntermediacao: Number(tarifa?.taxaIntermediacao || 0),
    vigenciaInicio: formatDateInput(tarifa?.vigenciaInicio),
    vigenciaFim: formatDateInput(tarifa?.vigenciaFim),
    status: true
  };
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  suffix,
  placeholder
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2.5 pr-12 text-[14px] text-white outline-none transition placeholder:text-[#5f6d83] focus:border-[#cf2f7d]/55"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-[#7c8aa3]">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function StatCard({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#7c8aa3]">{label}</p>
      <p className="mt-1.5 text-[20px] font-semibold text-white">{value}</p>
      {helper ? <p className="mt-1.5 text-[12px] text-[#7c8aa3]">{helper}</p> : null}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [tarifas, setTarifas] = useState<AdminTarifa[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [selectedTarifaId, setSelectedTarifaId] = useState("");
  const [draft, setDraft] = useState<PricingDraft>(toDraft());
  const [simulation, setSimulation] = useState<SimulationInput>({ distanceKm: 12 });
  const [productDraft, setProductDraft] = useState<ProductDraft>({
    name: "",
    icon: "",
    taxaId: ""
  });
  const [loading, setLoading] = useState(true);
  const [savingTarifa, setSavingTarifa] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [productsPayload, tarifasPayload, auditPayload] = await Promise.all([
          listProducts(),
          listTarifas(),
          listAuditLogs({ page: 1, limit: 6 })
        ]);

        setProducts(productsPayload);
        setTarifas(tarifasPayload);
        setLogs(auditPayload.logs || []);
        setSuccessMessage("");

        if (tarifasPayload.length) {
          setSelectedTarifaId(tarifasPayload[0]._id);
          setDraft(toDraft(tarifasPayload[0]));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Falha ao carregar configuracoes."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedTarifa = useMemo(
    () => tarifas.find((tarifa) => tarifa._id === selectedTarifaId) || null,
    [selectedTarifaId, tarifas]
  );

  const preview = useMemo(() => {
    const subtotal = draft.valorBase + simulation.distanceKm * draft.valorKm;
    const taxaValor = subtotal * (draft.taxaIntermediacao / 100);
    const total = subtotal + draft.custoFixo + taxaValor;

    return {
      subtotal,
      taxaValor,
      total
    };
  }, [draft, simulation.distanceKm]);

  function handleSelectTarifa(tarifa: AdminTarifa) {
    setSelectedTarifaId(tarifa._id);
    setDraft(toDraft(tarifa));
  }

  function handleNewTarifa() {
    setSelectedTarifaId("");
    setDraft(toDraft());
    setSuccessMessage("");
  }

  function updateDraft(field: keyof PricingDraft, value: string | boolean) {
    setDraft((current) => {
      if (typeof current[field] === "number") {
        return {
          ...current,
          [field]: Number(value || 0)
        };
      }

      return {
        ...current,
        [field]: value
      };
    });
  }

  function startEditProduct(product: AdminProduct) {
    setProductDraft({
      id: product._id,
      name: product.name || "",
      icon: product.icon || "",
      taxaId: product.taxaId || ""
    });
  }

  function resetProductDraft() {
    setProductDraft({
      name: "",
      icon: "",
      taxaId: ""
    });
  }

  async function reloadProducts() {
    const productsPayload = await listProducts();
    setProducts(productsPayload);
  }

  async function handleSaveProduct() {
    setSavingProduct(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: productDraft.name.trim(),
        icon: productDraft.icon.trim() || undefined,
        taxaId: productDraft.taxaId || undefined
      };

      if (!payload.name) {
        throw new Error("Informe o nome do produto.");
      }

      if (productDraft.id) {
        await updateProduct(productDraft.id, payload);
        setSuccessMessage("Produto atualizado com sucesso.");
      } else {
        await createProduct(payload);
        setSuccessMessage("Produto criado com sucesso.");
      }

      await reloadProducts();
      resetProductDraft();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao salvar produto."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleSaveTarifa() {
    setSavingTarifa(true);
    setError("");

    try {
      const payload = {
        name: draft.label || "Nova tarifa",
        valorBase: draft.valorBase,
        valorKm: draft.valorKm,
        custoFixo: draft.custoFixo,
        taxaIntermediacao: draft.taxaIntermediacao,
        vigenciaInicio: draft.vigenciaInicio || undefined,
        vigenciaFim: draft.vigenciaFim || undefined
      };

      if (selectedTarifaId) {
        const updated = await updateTarifa(selectedTarifaId, payload);
        setTarifas((current) =>
          current.map((tarifa) => (tarifa._id === updated._id ? updated : tarifa))
        );
        setSuccessMessage("Tarifa atualizada com sucesso.");
      } else {
        const created = await createTarifa(payload);
        setTarifas((current) => [created, ...current]);
        setSelectedTarifaId(created._id);
        setDraft(toDraft(created));
        setSuccessMessage("Tarifa criada com sucesso.");
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao salvar tarifa."
      );
    } finally {
      setSavingTarifa(false);
    }
  }

  async function handleDeleteTarifa() {
    if (!selectedTarifaId) return;
    setSavingTarifa(true);
    setError("");

    try {
      await deleteTarifa(selectedTarifaId);
      setTarifas((current) => current.filter((tarifa) => tarifa._id !== selectedTarifaId));
      setSelectedTarifaId("");
      setDraft(toDraft());
      setSuccessMessage("Tarifa removida com sucesso.");
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao remover tarifa."
      );
    } finally {
      setSavingTarifa(false);
    }
  }

  async function handleDeleteProduct(productId: string) {
    setSavingProduct(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteProduct(productId);
      setSuccessMessage("Produto removido com sucesso.");
      await reloadProducts();
      if (productDraft.id === productId) {
        resetProductDraft();
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao remover produto."
      );
    } finally {
      setSavingProduct(false);
    }
  }

  return (
    <AdminPageShell
      title="Configuracoes"
      description="Estrutura de tarifacao com regras, valores-base, simulador de calculo e visao operacional das tarifas em vigor."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {loading ? <AdminLoadingState label="Carregando configuracoes..." /> : null}
      {!loading && !products.length && !tarifas.length ? (
        <AdminEmptyState label="Nenhuma configuracao disponivel." />
      ) : null}

      {!loading ? (
        <section className="grid gap-6 2xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-6">
            <article className="overflow-hidden rounded-[20px] border border-white/10 bg-[#111111]">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[18px] font-semibold text-white">
                      Regras de Tarifacao
                    </h2>
                    <p className="mt-1 text-[13px] text-[#8ea0bd]">
                      Escolha a regra para revisar os valores usados no calculo da corrida.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewTarifa}
                    className="rounded-xl border border-white/10 px-3 py-2 text-[12px] font-semibold text-white hover:bg-white/5"
                  >
                    Nova tarifa
                  </button>
                </div>
              </div>
              <div className="divide-y divide-white/10">
                {tarifas.length ? (
                  tarifas.map((tarifa) => {
                    const isActive = tarifa._id === selectedTarifaId;

                    return (
                      <button
                        key={tarifa._id}
                        type="button"
                        onClick={() => handleSelectTarifa(tarifa)}
                        className={`block w-full px-5 py-4 text-left transition ${
                          isActive ? "bg-[#171717]" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-[15px] font-medium text-white">
                              {tarifa.name || "Tarifa sem nome"}
                            </p>
                            <p className="mt-1 text-[12px] text-[#8ea0bd]">
                              {formatDateInput(tarifa.vigenciaInicio)} ate{" "}
                              {formatDateInput(tarifa.vigenciaFim)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-[#13253c] px-3 py-1.5 text-[12px] text-[#8fb4f2]">
                            {formatCurrency(Number(tarifa.valorBase || 0))}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-5 py-6 text-[13px] text-[#8ea0bd]">
                    Nenhuma tarifa cadastrada ainda.
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[20px] border border-white/10 bg-[#111111] p-5">
              <h3 className="text-[17px] font-semibold text-white">Resumo da regra</h3>
              <div className="mt-4 grid gap-3">
                <StatCard
                  label="Valor base"
                  value={formatCurrency(draft.valorBase)}
                  helper="Entrada fixa usada antes do custo por distancia."
                />
                <StatCard
                  label="Valor por km"
                  value={formatCurrency(draft.valorKm)}
                  helper="Multiplicado pela distancia estimada."
                />
                <StatCard
                  label="Taxa de intermediacao"
                  value={`${draft.taxaIntermediacao.toFixed(2)}%`}
                  helper="Aplicada sobre o subtotal da corrida."
                />
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <article className="rounded-[20px] border border-white/10 bg-[#111111] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">
                    Estrutura de calculo
                  </h2>
                  <p className="mt-1 text-[13px] text-[#8ea0bd]">
                    Formulario base para organizar os valores cobrados junto ao calculo.
                  </p>
                </div>
                <span className="rounded-lg bg-[#3c1228] px-3 py-1.5 text-[12px] text-[#d95b9a]">
                  {selectedTarifa?.name || "Nova tarifa"}
                </span>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
                <section className="space-y-4">
                  <h3 className="text-[15px] font-semibold text-white">
                    Valores base do calculo
                  </h3>
                  <InputField
                    label="Nome da regra"
                    value={draft.label}
                    onChange={(value) => updateDraft("label", value)}
                    placeholder="Ex: Tarifa urbana padrao"
                  />
                  <InputField
                    label="Valor base"
                    type="number"
                    value={draft.valorBase}
                    onChange={(value) => updateDraft("valorBase", value)}
                    suffix="BRL"
                  />
                  <InputField
                    label="Valor por km"
                    type="number"
                    value={draft.valorKm}
                    onChange={(value) => updateDraft("valorKm", value)}
                    suffix="BRL"
                  />
                  <InputField
                    label="Custo fixo"
                    type="number"
                    value={draft.custoFixo}
                    onChange={(value) => updateDraft("custoFixo", value)}
                    suffix="BRL"
                  />
                </section>

                <section className="space-y-4">
                  <h3 className="text-[15px] font-semibold text-white">
                    Taxas e vigencia
                  </h3>
                  <InputField
                    label="Taxa de intermediacao"
                    type="number"
                    value={draft.taxaIntermediacao}
                    onChange={(value) => updateDraft("taxaIntermediacao", value)}
                    suffix="%"
                  />
                  <InputField
                    label="Vigencia inicial"
                    type="date"
                    value={draft.vigenciaInicio}
                    onChange={(value) => updateDraft("vigenciaInicio", value)}
                  />
                  <InputField
                    label="Vigencia final"
                    type="date"
                    value={draft.vigenciaFim}
                    onChange={(value) => updateDraft("vigenciaFim", value)}
                  />
                  <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3.5">
                    <div>
                      <p className="text-[14px] font-medium text-white">Regra ativa</p>
                      <p className="mt-1 text-[12px] text-[#7c8aa3]">
                        Estrutura pronta para controle operacional da tarifa.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.status}
                      onChange={(event) => updateDraft("status", event.target.checked)}
                      className="h-5 w-5 rounded border-white/20 bg-black accent-[#cf2f7d]"
                    />
                  </label>
                </section>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                <div className="text-[12px] text-[#8ea0bd]">
                  {selectedTarifaId ? "Editando tarifa existente." : "Criando nova tarifa."}
                </div>
                <div className="flex items-center gap-3">
                  {selectedTarifaId ? (
                    <button
                      type="button"
                      onClick={handleDeleteTarifa}
                      disabled={savingTarifa}
                      className="rounded-xl border border-[#3b1519] px-4 py-2.5 text-[13px] font-semibold text-[#ff7b8a] disabled:opacity-50"
                    >
                      Remover tarifa
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSaveTarifa}
                    disabled={savingTarifa}
                    className="rounded-xl bg-[#cf2f7d] px-5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-50"
                  >
                    {savingTarifa ? "Salvando..." : "Salvar tarifa"}
                  </button>
                </div>
              </div>

              <section className="mt-6 rounded-[16px] border border-dashed border-white/10 bg-black/50 p-4">
                <h3 className="text-[15px] font-semibold text-white">
                  Espaco reservado para taxas adicionais
                </h3>
                <p className="mt-2 text-[13px] text-[#8ea0bd]">
                  Aqui podemos conectar depois taxa noturna, cancelamento, aeroporto ou regras extras.
                  A estrutura visual ja fica preparada sem depender de novos campos agora.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {["Taxa noturna", "Taxa de cancelamento", "Taxa de aeroporto"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-white/10 bg-[#151515] px-3 py-1.5 text-[12px] text-[#8ea0bd]"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </section>
            </article>

            <article className="rounded-[20px] border border-white/10 bg-[#111111] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">
                    Simulador de cobranca
                  </h2>
                  <p className="mt-1 text-[13px] text-[#8ea0bd]">
                    Preview do calculo atual: base + distancia + custo fixo + taxa.
                  </p>
                </div>
                <div className="w-full max-w-[180px]">
                  <InputField
                    label="Distancia"
                    type="number"
                    value={simulation.distanceKm}
                    onChange={(value) =>
                      setSimulation({ distanceKm: Number(value || 0) })
                    }
                    suffix="km"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <StatCard label="Subtotal" value={formatCurrency(preview.subtotal)} />
                <StatCard
                  label="Taxa aplicada"
                  value={formatCurrency(preview.taxaValor)}
                  helper={`${draft.taxaIntermediacao.toFixed(2)}% sobre o subtotal`}
                />
                <StatCard
                  label="Total estimado"
                  value={formatCurrency(preview.total)}
                  helper="Usando a mesma composicao base do calculo atual."
                />
              </div>

              <div className="mt-5 rounded-[16px] border border-white/10 bg-black p-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#7c8aa3]">
                  Formula atual
                </p>
                <p className="mt-2 text-[14px] text-white">
                  ({formatCurrency(draft.valorBase)} + {simulation.distanceKm} km x{" "}
                  {formatCurrency(draft.valorKm)}) + {formatCurrency(draft.custoFixo)} +{" "}
                  {draft.taxaIntermediacao.toFixed(2)}%
                </p>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[20px] border border-white/10 bg-[#111111] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">
                  Tipos de corrida
                </h2>
                <p className="mt-1 text-[13px] text-[#8ea0bd]">
                  Cadastre produtos como X, Confort e Premium e vincule cada um a uma tarifa.
                </p>
              </div>
              <button
                type="button"
                onClick={resetProductDraft}
                className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
              >
                Novo produto
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <InputField
                  label="Nome do produto"
                  value={productDraft.name}
                  onChange={(value) =>
                    setProductDraft((current) => ({ ...current, name: value }))
                  }
                  placeholder="Ex: Premium"
                />
                <InputField
                  label="Icone"
                  value={productDraft.icon}
                  onChange={(value) =>
                    setProductDraft((current) => ({ ...current, icon: value }))
                  }
                  placeholder="Ex: local_taxi"
                />
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
                  Tarifa vinculada
                </span>
                <select
                  value={productDraft.taxaId}
                  onChange={(event) =>
                    setProductDraft((current) => ({
                      ...current,
                      taxaId: event.target.value
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-2.5 text-[14px] text-white outline-none"
                >
                  <option value="">Selecione uma tarifa</option>
                  {tarifas.map((tarifa) => (
                    <option key={tarifa._id} value={tarifa._id}>
                      {tarifa.name || tarifa._id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={savingProduct}
                  className="rounded-xl bg-[#cf2f7d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {savingProduct
                    ? "Salvando..."
                    : productDraft.id
                      ? "Atualizar produto"
                      : "Cadastrar produto"}
                </button>
                {productDraft.id ? (
                  <button
                    type="button"
                    onClick={resetProductDraft}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Cancelar edicao
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {products.length ? (
                products.map((product) => {
                  const linkedTarifa = tarifas.find((tarifa) => tarifa._id === product.taxaId);

                  return (
                    <div
                      key={product._id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black px-4 py-4"
                    >
                      <div>
                        <p className="text-[15px] font-medium text-white">
                          {product.name || "Produto sem nome"}
                        </p>
                        <p className="mt-1 text-[13px] text-[#8ea0bd]">
                          Icone: {product.icon || "-"} • Tarifa:{" "}
                          {linkedTarifa?.name || product.taxaId || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditProduct(product)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={savingProduct}
                          className="rounded-lg bg-[#2c1013] px-3 py-2 text-[12px] text-[#ff7b8a] disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-white/10 bg-black px-4 py-6 text-[13px] text-[#8ea0bd]">
                  Nenhum tipo de corrida cadastrado ainda.
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[20px] border border-white/10 bg-[#111111]">
            <div className="border-b border-white/10 px-5 py-4 text-[18px] font-semibold text-white">
              Auditoria recente
            </div>
            <div className="divide-y divide-white/10">
              {logs.length ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="grid gap-2 px-5 py-4 md:grid-cols-[0.8fr_0.8fr_1fr_0.7fr]"
                  >
                    <p className="text-[13px] text-white">{log.action || "-"}</p>
                    <p className="text-[13px] text-[#8ea0bd]">{log.targetType || "-"}</p>
                    <p className="text-[13px] text-[#8ea0bd]">
                      {log.adminUser?.name || log.adminUser?.email || "Admin"}
                    </p>
                    <p className="text-[13px] text-[#8ea0bd]">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-5 text-[13px] text-[#8ea0bd]">
                  Nenhum log de auditoria encontrado.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
