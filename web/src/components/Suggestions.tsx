import { useEffect, useState } from "react";
import Modal from "./Modal";

type Product = {
  cod: number;
  name: string;
  value: number;
};

type Material = {
  cod: number;
  name: string;
  amount: number;
};

type Relation = {
  cod_product: number;
  cod_raw: number;
  amount: number;
};

type Suggestion = {
  product: Product;
  possible: number;
};

type Props = {
  responsible: string | null;
  lastProductEditedOn: string | null;
  lastMaterialEditedOn: string | null;
  setLastMaterialEditedOn: (name: string) => void;
};


export default function Suggestions({ 
    responsible, 
    lastProductEditedOn, 
    lastMaterialEditedOn, 
    setLastMaterialEditedOn 
  }: Props) {
  const [open, setOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [amount, setamount] = useState("");

  useEffect(() => {
    async function load() {
      const [p, m, r] = await Promise.all([
        fetch("http://localhost:3000/products").then(res => res.json()),
        fetch("http://localhost:3000/materials").then(res => res.json()),
        fetch("http://localhost:3000/relations").then(res => res.json()),
      ]);

      const result = calculateSuggestions(p, m, r);
      setSuggestions(result);
    }

    load();
  }, [lastProductEditedOn, lastMaterialEditedOn]);

  function calculateSuggestions(
    products: Product[],
    materials: Material[],
    relations: Relation[]
  ): Suggestion[] {

    const materialMap = new Map(
      materials.map(m => [m.cod, m])
    );

    return products
      .map(product => {

        const reqs = relations.filter(
          r => r.cod_product === product.cod
        );

        if (!reqs.length) return null;

        const possibleUnits = reqs.map(req => {
          const mat = materialMap.get(req.cod_raw);
          if (!mat) return 0;

          return Math.floor(mat.amount / req.amount);
        });

        const possible = Math.min(...possibleUnits);

        if (possible <= 0) return null;

        return {
          product,
          possible,
        };
      })
      .filter(Boolean) as Suggestion[];
  }

  function OpenProductionModal(product: Product) {
    setProduct(product);
    setOpen(true);
  }

  function produce(product: Product, amount: number) {
    if (!responsible) {
      alert("Faça login para produzir");
      return;
    }
    fetch("http://localhost:3000/production", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user": responsible,
      },
      body: JSON.stringify({
        cod_product: product.cod,
        amount,
      }),
    });

    setOpen(false);
    setLastMaterialEditedOn(Date.now().toString());
  }



  return (
    <div>
      <div className="panel-header">
        <h3>Sugestões de Produção</h3>
      </div>

      <ul>
        {suggestions.map(s => (
          <li key={s.product.cod}>
            <span style={{ fontWeight: "bold" }}>{s.product.name}</span> — produzir até {s.possible} unidades
            <button
              style={{ marginLeft: 16 }}
              onClick={() => OpenProductionModal(s.product)}
            >
              Produzir
            </button>
          </li>
        ))}
      </ul>

      {/* Modal de produção */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3>Produzir</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            produce(product!, Number(amount));
          }}
        >
          <input 
            type="number" 
            placeholder="Quantidade a produzir" 
            value={amount} 
            onChange={(e) => setamount(e.target.value)} 
            required
          />
          <button type="submit">Confirmar</button>
        </form>
      </Modal>
    </div>
  );
}