"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingState
} from "@/components/admin/admin-state";
import {
  createProduct,
  deleteProduct,
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
};

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
    taxaId: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      taxaId: ""
    });
  }

  function startEdit(product: AdminProduct) {
    setDraft({
      id: product._id,
      name: product.name || "",
      icon: product.icon || "",
      taxaId: product.taxaId || ""
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
        taxaId: draft.taxaId || undefined
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

  async function handleDelete(productId: string) {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteProduct(productId);
      setSuccessMessage("Produto removido com sucesso.");
      if (draft.id === productId) {
        resetDraft();
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Falha ao remover produto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell
      title="Produtos"
      description="Cadastre os tipos de corrida disponiveis, como X, Confort e Premium, vinculando cada um a uma tarifa."
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
                <h2 className="text-[20px] font-semibold text-white">Novo tipo de corrida</h2>
                <p className="mt-1 text-[14px] text-[#8ea0bd]">
                  Configure o nome comercial, icone e tarifa usada no cálculo.
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
                  {tarifas.map((tarifa) => (
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
            <h2 className="text-[20px] font-semibold text-white">Produtos cadastrados</h2>
            <p className="mt-1 text-[14px] text-[#8ea0bd]">
              Use está lista para revisar e editar rapidamente os tipos de corrida.
            </p>

            <div className="mt-5 space-y-3">
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
                          onClick={() => startEdit(product)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-[12px] text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id)}
                          disabled={saving}
                          className="rounded-lg bg-[#2c1013] px-3 py-2 text-[12px] text-[#ff7b8a] disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <AdminEmptyState label="Nenhum produto cadastrado ainda." />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
