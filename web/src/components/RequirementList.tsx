import { useState } from "react";

export type Requirement = {
  cod_raw?: number;
  quantidade?: number;
};

type Props = {
  raws: any[];
  value: Requirement[];
  onChange: (v: Requirement[]) => void;
};

export default function RequirementsEditor({
  raws,
  value,
  onChange,
}: Props) {

  const update = (
    i: number,
    key: keyof Requirement,
    val: any
  ) => {
    const copy = value.map((item, idx) =>
      idx === i ? { ...item, [key]: val } : item
    );

    onChange(copy);
  };

  const add = () => onChange([...value, {}]);

  const remove = (i: number) =>
    onChange(value.filter((_, idx) => idx !== i));

  return (
    <>
      {value.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 8 }}>
          <select
            disabled={!raws?.length}
            value={r.cod_raw ?? ""}
            onChange={(e) =>
              update(i, "cod_raw", Number(e.target.value))
            }
          >
            <option value="" disabled hidden>
            selecione a matéria-prima
            </option>

            {raws?.length > 0 &&
              raws.map((raw) => (
                <option key={raw.cod} value={raw.cod}>
                  {raw.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            placeholder="quantidade"
            value={r.quantidade ?? ""}
            onChange={(e) =>
              update(i, "quantidade", Number(e.target.value))
            }
          />

          <button type="button" onClick={() => remove(i)}>
            x
          </button>
        </div>
      ))}

      <button type="button" onClick={add}>
        + requisito
      </button>
    </>
  );
}