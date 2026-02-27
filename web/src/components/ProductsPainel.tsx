import { useEffect, useState } from "react";
import Modal from "./Modal";
import RequirementsEditor, {
  type Requirement,
} from "./RequirementList";

export default function ProductPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [raws, setRaws] = useState<any[]>([]);

  async function load() {
    const res = await fetch(
      "http://localhost:3000/products"
    );
    setProducts(await res.json());
  }

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then(setRaws);
  }, []);

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        value: Number(value),

        // adaptação Requirement -> API DTO
        requirements: requirements
          .filter((r) => r.cod_raw && r.quantidade)
          .map((r) => ({
            material_id: Number(r.cod_raw),
            quantity: Number(r.quantidade),
          })),
      }),
    });

    setOpen(false);
    setName("");
    setValue("");
    setRequirements([]);

    load();
  }

  return (
    <div>
      {/* HEADER */}
      <div className="panel-header">
        <h3>Produtos</h3>

        <button
          className="add-btn"
          onClick={() => setOpen(true)}
        >
          +
        </button>
      </div>

      {/* LISTA */}
      <ul>
        {products.map((p) => (
          <li key={p.cod}>
            {p.name} — R$ {p.value}
          </li>
        ))}
      </ul>

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3>Novo Produto</h3>

        <form onSubmit={addProduct}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e) =>
              setValue(e.target.value)
            }
          />

          {/* EDITOR DE REQUISITOS */}
          <RequirementsEditor
            raws={raws}
            value={requirements}
            onChange={setRequirements}
          />

          <button type="submit">Salvar</button>
        </form>
      </Modal>
    </div>
  );
}