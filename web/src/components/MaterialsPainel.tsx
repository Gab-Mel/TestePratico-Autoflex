import { useEffect, useState } from "react";
import Modal from "./Modal";

/* =========================
    TYPES
========================= */

type Props = {
  responsible: string | null;
  setLastMaterialEditedOn: (name: string) => void;
  materialEditedOn: string | null;
};
type PurchaseItem = {
  cod_raw: number | "";
  amount: string;
};

export default function MaterialPanel({ 
    responsible, 
    setLastMaterialEditedOn, 
    materialEditedOn 
  }: Props) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([
    { cod_raw: "", amount: "" }
  ]);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cust, setCust] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("un");

  const UNIT_OPTIONS = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "l", label: "Litro (l)" },
  { value: "m", label: "Metro (m)" },  
  { value: "un", label: "Unidade (un)" }
];

  /* =========================
     LOAD
  ========================= */
  async function load() {
    const res = await fetch("http://localhost:3000/materials");
    setMaterials(await res.json());
  }

  useEffect(() => {
    load();
  }, [materialEditedOn]);

  /* =========================
     EDIT
  ========================= */
  function startEdit(material: any) {
    setEditingId(material.cod);

    setName(material.name);
    setAmount(String(material.amount));
    setCust(String(material.cust));
    setUnitMeasure(material.unit_measure);

    setOpen(true);
    setLastMaterialEditedOn(Date.now().toString());
  }

  /* =========================
     DELETE
  ========================= */
  async function deleteMaterial(id: number) {
    const confirmDelete = confirm(
      "Deseja realmente deletar este insumo?"
    );

    if (!confirmDelete) return;
    
    if (!responsible) {
      alert("Usuário não autenticado");
      return;
    }
    await fetch(`http://localhost:3000/materials/${id}`, {
      method: "DELETE",
      headers: {
        "x-user": responsible
      }
    });

    load();
    setLastMaterialEditedOn(Date.now().toString());
  }

  /* =========================
     SAVE (CREATE + UPDATE)
  ========================= */
  async function saveMaterial(e: React.FormEvent) {
    e.preventDefault();

    const url = editingId
      ? `http://localhost:3000/materials/${editingId}`
      : "http://localhost:3000/materials";

    const method = editingId ? "PUT" : "POST";

    if (!responsible) {
      alert("Usuário não autenticado");
      return;
    }
    await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        "x-user": responsible
      },
      body: JSON.stringify({
        name,
        amount: Number(amount),
        cust: Number(cust),
        unit_measure: unitMeasure,
      }),
    });

    /* =========================
        RESETAR ESTADOS
    ========================= */

    setOpen(false);
    setEditingId(null);

    setName("");
    setAmount("");
    setCust("");
    setUnitMeasure("");

    load();
    setLastMaterialEditedOn(Date.now().toString());
  }

  /* =========================
     COMPRAS
  ========================= */

  function addPurchaseRow() {
    setPurchases(prev => [
      ...prev,
      { cod_raw: "", amount: "" }
    ]);
  }

  function updatePurchase(
    index: number,
    field: keyof PurchaseItem,
    value: any
  ) {
    setPurchases(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removePurchase(index: number) {
    setPurchases(prev => prev.filter((_, i) => i !== index));
  }

  async function savePurchases(e: React.FormEvent) {
    e.preventDefault();

    if (!responsible) {
      alert("Usuário não autenticado");
      return;
    }

    for (const p of purchases) {
      if (!p.cod_raw || !p.amount) continue;

      await fetch("http://localhost:3000/raw-material-purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user": responsible
        },
        body: JSON.stringify({
          cod_raw: Number(p.cod_raw),
          amount: Number(p.amount)
        })
      });
    }

    setShoppingOpen(false);
    load();
    setLastMaterialEditedOn(Date.now().toString());
  }

  /* =========================
     UI
  ========================= */
  return (
    <div>
      {/* HEADER */}
      <div className="panel-header">
        <h3>Insumos</h3>

        <div>
          <button
            className="button-shopping"
            onClick={() => {
              setPurchases([{ cod_raw: "", amount: "" }]);
              setShoppingOpen(true);
            }}
          >
            🛒
          </button>
          <button
            className="button-register"
            onClick={() => {
              setEditingId(null);
              setOpen(true);
            }}
          >
            ➕
          </button>
        </div>
      </div>

      {/* LISTA */}
      <ul className="material-list">
        {materials.map((m) => (
          <li
            key={m.cod}
            className="material-row"
          >
            <span> {m.name} </span>
            <span> {m.amount} {m.unit_measure} </span>
            <span> {m.cust} </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button 
              className="button-edit"
              onClick={() => startEdit(m)}>
                ✏️
              </button>

              <button
                className="button-delete"
                onClick={() => deleteMaterial(m.cod)}
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3>
          {editingId ? "Editar Insumo" : "Novo Insumo"}
        </h3>

        <form onSubmit={saveMaterial}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Quantidade"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Custo"
            value={cust}
            onChange={(e) => setCust(e.target.value)}
            required
          />

          <select
            value={unitMeasure}
            onChange={(e) => setUnitMeasure(e.target.value)}
            required
          >
            <option value="" disabled>
              Unidade de medida
            </option>

            {UNIT_OPTIONS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          <button type="submit">Salvar</button>
        </form>
      </Modal>
      <Modal open={shoppingOpen} onClose={() => setShoppingOpen(false)}>
        <h3>Registrar Compra</h3>

        <form onSubmit={savePurchases}>

          {purchases.map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 10
              }}
            >
              {/* MATERIAL */}
              <select
                value={p.cod_raw}
                onChange={(e) =>
                  updatePurchase(i, "cod_raw", Number(e.target.value))
                }
                required
              >
                <option value="">Material</option>

                {materials.map(m => (
                  <option key={m.cod} value={m.cod}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* QUANTIDADE */}
              <input
                type="number"
                placeholder="Quantidade"
                value={p.amount}
                onChange={(e) =>
                  updatePurchase(i, "amount", e.target.value)
                }
                required
              />

              <button
                type="button"
                onClick={() => removePurchase(i)}
              >
                ❌
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addPurchaseRow}
          >
            ➕ Adicionar item
          </button>

          <hr />

          <button type="submit">
            Salvar compra
          </button>

        </form>
      </Modal>
    </div>
  );
}