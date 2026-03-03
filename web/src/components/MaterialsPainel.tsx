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

export default function MaterialPanel({ 
    responsible, 
    setLastMaterialEditedOn, 
    materialEditedOn 
  }: Props) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

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
              setEditingId(null);
              setOpen(true);
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
    </div>
  );
}