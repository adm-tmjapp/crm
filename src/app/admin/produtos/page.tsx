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
  listProducts,
  listTarifas,
  updateProduct,
  type AdminProduct,
  type AdminTarifa
} from "@/services/admin-content-service";

type ProductDraft = {
  id?: string;
  name: string;
  icon: string;
  taxaId: string;
  active: boolean;
};

type ProductFilter = "all" | "active" | "inactive";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.08em] text-[#9aa8c1]">
      {children}
    </span>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [tarifas, setTarifas] = useState<AdminTarifa[]>([]);
  const [draft, setDraft] = useState<ProductDraft>({
    name: "",
    icon: "",
    taxaId: "",
    active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [productFilter, setProductFilter] = useState<ProductFilter>("all");

  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const isActive = product.active !== false;
      return productFilter === "all" || (productFilter === "active" ? isActive : !isActive);
    }),
    [productFilter, products]
  );

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [productsPayload, tarifasPayload] = await Promise.all([
        listProducts(),
        listTarifas()
      ]);
      setProducts(productsPayload);
      setTarifas(tarifasPayload);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Falha ao carregar produtos."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetDraft() {
    setDraft({
      name: "",
      icon: "",
      taxaId: "",
      active: true
    });
  }

  function startEdit(product: AdminProduct) {
    setDraft({
      id: product._id,
      name: product.name || "",
      icon: product.icon || "",
      taxaId: product.taxaId || "",
      active: product.active !== false
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        name: draft.name.trim(),
        icon: draft.icon.trim() || undefined,
        taxaId: draft.taxaId || undefined,
        active: draft.active
      };

      if (!payload.name) {
        throw new Error("Informe o nome do produto.");
      }

      if (draft.id) {
        await updateProduct(draft.id, payload);
        setSuccessMessage("Produto atualizado com sucesso.");
      } else {
        await createProduct(payload);
        setSuccessMessage("Produto cadastrado com sucesso.");
      }

      resetDraft();
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao salvar produto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(product: AdminProduct) {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateProduct(product._id, {
        name: product.name || "",
        icon: product.icon,
        taxaId: product.taxaId,
        active: product.active === false
      });
      setSuccessMessage(
        product.active === false
          ? "Tipo de viagem ativado para novas solicitações."
          : "Tipo de viagem desativado para novas solicitações."
      );
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao alterar disponibilidade."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="Tipos de viagem"
      description="Publique ou oculte as opções que o passageiro pode escolher e vincule cada uma à sua regra de tarifa."
    >
      {error ? <AdminErrorState message={error} /> : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
          {successMessage}
        </div>
      ) : null}
      {loading ? <AdminLoadingState label="Carregando produtos..." /> : null}
      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold text-white">Configurar tipo de viagem</h2>
                <p className="mt-1 text-[14px] text-[#8ea0bd]">
                  O tipo ativo aparece para passageiros elegíveis. Desativar não apaga o histórico.
                </p>
              </div>
              {draft.id ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                >
                  Cancelar edição
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <FieldLabel>Nome do produto</FieldLabel>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Ex: Premium"
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-[#5f6d83]"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3.5">
                <span>
                  <span className="block text-[14px] font-medium text-white">Disponível para passageiros</span>
                  <span className="mt-1 block text-[12px] text-[#7c8aa3]">Permite novas solicitações nesta categoria.</span>
                </span>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
                  className="h-5 w-5 rounded border-white/20 bg-black accent-[#cf2f7d]"
                />
              </label>

              <label className="block">
                <FieldLabel>Icone</FieldLabel>
                <input
                  type="text"
                  value={draft.icon}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, icon: event.target.value }))
                  }
                  placeholder="Ex: local_taxi"
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none placeholder:text-[#5f6d83]"
                />
              </label>

              <label className="block">
                <FieldLabel>Tarifa vinculada</FieldLabel>
                <select
                  value={draft.taxaId}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, taxaId: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3.5 py-3 text-[14px] text-white outline-none"
                >
                  <option value="">Selecione uma tarifa</option>
                  {tarifas.filter((tarifa) => tarifa.status !== false).map((tarifa) => (
                    <option key={tarifa._id} value={tarifa._id}>
                      {tarifa.name || tarifa._id}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-[#cf2f7d] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Salvando..." : draft.id ? "Atualizar produto" : "Cadastrar produto"}
              </button>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-[#111111] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold text-white">Tipos cadastrados</h2>
                <p className="mt-1 text-[14px] text-[#8ea0bd]">
                  Publique, oculte ou edite as opções oferecidas ao passageiro.
                </p>
              </div>
              <select
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value as ProductFilter)}
                className="rounded-lg border border-white/10 bg-black px-3 py-2 text-[12px] text-white outline-none"
                aria-label="Filtrar tipos de viagem"
              >
                <option value="all">Todos ({products.length})</option>
                <option value="active">Ativos ({products.filter((product) => product.active !== false).length})</option>
                <option value="inactive">Inativos ({products.filter((product) => product.active === false).length})</option>
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {filteredProducts.length ? (
                filteredProducts.map((product) => {
                  const linkedTarifa = tarifas.find((tarifa) => tarifa._id === product.taxaId);
                  const isActive = product.active !== false;

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
                          {isActive ? "Disponível" : "Oculto"} • Ícone: {product.icon || "-"} • Tarifa:{" "}
                          {linkedTarifa?.name || product.taxaId || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-[#9aa8c1]"}`}>
                          {isActive ? "ATIVO" : "INATIVO"}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(product)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(product)}
                          disabled={saving}
                          className={`rounded-lg px-3 py-2 text-[12px] disabled:opacity-50 ${isActive ? "bg-[#2c1013] text-[#ff7b8a]" : "bg-[#03271c] text-[#0bd38a]"}`}
                        >
                          {isActive ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <AdminEmptyState label={products.length ? "Nenhum tipo encontrado neste filtro." : "Nenhum tipo de viagem cadastrado ainda."} />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
