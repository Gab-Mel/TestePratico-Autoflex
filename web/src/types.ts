export type Product = {
  cod: number;
  name: string;
  value: number;
};

export type Material = {
  cod: number;
  name: string;
  amount: number;
};

export type Relation = {
  cod_product: number;
  cod_raw: number;
  amount: number;
};

export type Suggestion = {
  product: Product;
  possible: number;
};