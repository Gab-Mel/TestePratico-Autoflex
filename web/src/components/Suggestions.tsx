import { useEffect, useState } from "react";

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

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
  }, []);

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

  return (
    <div>
      <div className="panel-header">
        <h3>Sugestões de Produção</h3>
      </div>

      <ul>
        {suggestions.map(s => (
          <li key={s.product.cod}>
            {s.product.name} — produzir até {s.possible}
          </li>
        ))}
      </ul>
    </div>
  );
}