import { useEffect, useState } from "react";
import Modal from "./Modal";
import RequirementsEditor, {
  type Requirement,
} from "./RequirementList";



export default function ProductPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [raws, setRaws] = useState<any[]>([]);

  /* ================= LOAD ================= */

  async function load() {
    const res = await fetch("http://localhost:3000/products");
    setProducts(await res.json());
  }

  useEffect(() => {
    fetch("http://localhost:3000/materials")
      .then((r) => r.json())
      .then(setRaws);

    load();
  }, []);

  /* ================= SAVE PRODUCT ================= */

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    let productId = editingId;

    const payload = {
      name,
      value: Number(value),
    };

    /* ---------- CREATE ---------- */
    if (!editingId) {
      const res = await fetch(
        "http://localhost:3000/products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const created = await res.json();
      productId = created.cod;
    }

    /* ---------- UPDATE ---------- */
    else {
      await fetch(
        `http://localhost:3000/products/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
    }

    /* ================= SYNC RELATIONS ================= */

    const res = await fetch(
      `http://localhost:3000/relations/product/${productId}`
    );

    const currentRelations = await res.json();

    const currentMap = new Map(
      currentRelations.map((r: any) => [
        r.cod_raw,
        r,
      ])
    );

    const newMap = new Map(
      requirements
        .filter((r) => r.cod_raw && r.quantidade)
        .map((r) => [r.cod_raw, r])
    );

    /* DELETE removidos */
    for (const r of currentRelations) {
      if (!newMap.has(r.cod_raw)) {
        await fetch("http://localhost:3000/relations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cod_product: productId,
            cod_raw: r.cod_raw,
          }),
        });
      }
    }

    /* CREATE ou UPDATE */
    for (const req of newMap.values()) {
      const exists = currentMap.get(req.cod_raw);

      if (!exists) {
        await fetch("http://localhost:3000/relations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cod_product: productId,
            cod_raw: req.cod_raw,
            amount: req.quantidade,
          }),
        });
      } else {
        await fetch("http://localhost:3000/relations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cod_product: productId,
            cod_raw: req.cod_raw,
            amount: req.quantidade,
          }),
        });
      }
    }

    closeModal();
    load();
  }

  /* ================= EDIT ================= */

  async function editProduct(p: any) {
    setEditingId(p.cod);
    setName(p.name);
    setValue(String(p.value));

    const res = await fetch(
      `http://localhost:3000/relations/product/${p.cod}`
    );

    const rels = await res.json();

    setRequirements(
      rels.map((r: any) => ({
        cod_product: r.cod_product,
        cod_raw: r.cod_raw,
        quantidade: r.amount,
      }))
    );

    setOpen(true);
  }

  /* ================= DELETE ================= */

  async function deleteProduct(id: number) {
    if (!confirm("Deseja deletar o produto?")) return;

    await fetch(`http://localhost:3000/products/${id}`, {
      method: "DELETE",
    });

    load();
  }

  /* ================= HELPERS ================= */

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setName("");
    setValue("");
    setRequirements([]);
  }

  /* ================= UI ================= */

  return (
    <div>
      <div className="panel-header">
        <h3>Produtos</h3>

        <button
          className="add-btn"
          onClick={() => setOpen(true)}
        >
          +
        </button>
      </div>

      <ul>
        {products.map((p) => (
          <li
            key={p.cod}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {p.name} — R$ {p.value}
            </span>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => editProduct(p)}>
                ✏️
              </button>

              <button onClick={() => deleteProduct(p.cod)}>
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={open} onClose={closeModal}>
        <h3>
          {editingId ? "Editar Produto" : "Novo Produto"}
        </h3>

        <form onSubmit={saveProduct}>
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />

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