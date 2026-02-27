import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function MaterialPanel() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cust, setCust] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("");

  async function load() {
    const res = await fetch("http://localhost:3000/materials");
    setMaterials(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3000/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        amount: Number(amount),
        cust: Number(cust),
        unit_measure: Number(unitMeasure),
      }),
    });

    setOpen(false);
    setName("");
    setAmount("");
    setCust("");
    setUnitMeasure("");

    load();
  }

  return (
    <div>
      {/* HEADER */}
      <div className="panel-header">
        <h3>Insumos</h3>

        <button
          className="add-btn"
          onClick={() => setOpen(true)}
        >
          +
        </button>
      </div>

      {/* LISTA */}
      <ul>
        {materials.map((m) => (
          <li key={m.cod}>
            {m.name} — {m.amount} (custo: {m.cust})
          </li>
        ))}
      </ul>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3>Novo Insumo</h3>

        <form onSubmit={addMaterial}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Quantidade"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="number"
            placeholder="Custo"
            value={cust}
            onChange={(e) => setCust(e.target.value)}
          />

          <input
            type="number"
            placeholder="Unidade de medida"
            value={unitMeasure}
            onChange={(e) =>
              setUnitMeasure(e.target.value)
            }
          />

          <button type="submit">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}