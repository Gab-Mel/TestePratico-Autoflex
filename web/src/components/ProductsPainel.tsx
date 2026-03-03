import { useEffect, useState } from "react";
import Modal from "./Modal";
import RequirementsEditor, {
  type Requirement,
} from "./RequirementList";
import { API } from "../service/api";

/* ================= TYPES ================= */

type Product = {
  cod: number;
  name: string;
  value: number;
};

type RawMaterial = {
  cod: number;
  name: string;
};

type Props = {
  responsible: string | null;
  setLastProductEditedOn: (name: string) => void;
};

/* ================= COMPONENT ================= */

export default function ProductPanel({ responsible, setLastProductEditedOn }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const [requirements, setRequirements] =
    useState<Requirement[]>([]);

  const [raws, setRaws] = useState<RawMaterial[]>([]);

  /* ================= LOAD ================= */

  async function load() {
    const res = await fetch(`${API}/products`);
    setProducts(await res.json());
  }

  useEffect(() => {
    fetch(`${API}/materials`)
      .then((r) => r.json())
      .then(setRaws);

    load();
  }, []);

  /* ================= SAVE PRODUCT ================= */

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    let productId: number | null = editingId;

    const payload = {
      name,
      value: Number(value),
    };

    /* ---------- CREATE ---------- */
    if (productId === null && responsible) {
      const res = await fetch(
        `${API}/products`,
        {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          "x-user": responsible
        },
          body: JSON.stringify(payload),
        }
      );

      const created: Product = await res.json();

      // garante número (resolve bigint | undefined)
      productId = Number(created.cod);
    }

    /* ---------- UPDATE ---------- */
    else {
      if (!responsible) {
        alert("Usuário não autenticado");
        return;
      }
      await fetch(
        `${API}/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user": responsible
          },
          body: JSON.stringify(payload),
        }
      );
    }

    if (productId === null) return;

    /* ================= SYNC RELATIONS ================= */

    const res = await fetch(
      `${API}/relations/product/${productId}`
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

    /* ---------- DELETE removidos ---------- */
    for (const r of currentRelations) {
      if (!newMap.has(r.cod_raw)) {
        await fetch(`${API}/relations`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user": responsible
          },
          body: JSON.stringify({
            cod_product: productId,
            cod_raw: r.cod_raw,
          }),
        });
      }
    }

    /* ---------- CREATE ou UPDATE ---------- */
    for (const req of newMap.values()) {
      const exists = currentMap.get(req.cod_raw);

      const body = JSON.stringify({
        cod_product: productId,
        cod_raw: req.cod_raw,
        amount: req.quantidade,
      });

      if (!exists) {
        await fetch(`${API}/relations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user": responsible
          },
          body,
        });
      } else {
        await fetch(`${API}/relations`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user": responsible
          },
          body,
        });
      }
    }

    closeModal();
    load();
    setLastProductEditedOn(Date.now().toString());
  }

  /* ================= EDIT ================= */

  async function editProduct(p: Product) {
    setEditingId(p.cod);
    setName(p.name);
    setValue(String(p.value));

    const res = await fetch(
      `${API}/relations/product/${p.cod}`
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
    setLastProductEditedOn(Date.now().toString());
  }

  /* ================= DELETE ================= */

  async function deleteProduct(id: number) {
    if (!confirm("Deseja deletar o produto?")) return;

    if (!responsible) {
      alert("Usuário não autenticado");
      return;
    }

    await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: {
        "x-user": responsible
      }
    });

    load();
    setLastProductEditedOn(Date.now().toString());
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
        <div className="home-header">
          <h3>Produtos</h3>

          <button
            className="button-register"
            onClick={() => setOpen(true)}
          >
            ➕
          </button>
        </div>
        <div className="product-title">
          <span style={{ fontWeight: "bold" }} className="title-row">Nome</span>
          <span style={{ fontWeight: "bold" }} className="title-row">Valor</span>
        </div>
      </div>

      <ul className="product-list">
        {products.map((p) => (
          <li
            key={p.cod}
            className="product-row"
            style={{
              justifyContent: "space-between",
            }}
          >
            <span>{p.name}</span>
            <span>R$ {p.value}</span>


            <div style={{ display: "flex", gap: 8 }}>
              <button 
              className="button-edit"
              onClick={() => editProduct(p)}>
                ✏️
              </button>

              <button 
              className="button-delete"
              onClick={() => deleteProduct(p.cod)}>
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