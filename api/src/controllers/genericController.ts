import { Request, Response } from "express";
import * as crud from "../services/genericCrud";

export const createItem = (req: Request, res: Response) => {
  const { table } = req.params;

  const result = crud.create(table, req.body);
  res.json(result);
};

export const getAllItems = (req: Request, res: Response) => {
  const { table } = req.params;

  const data = crud.findAll(table);
  res.json(data);
};

export const updateItem = (req: Request, res: Response) => {
  const { table, id } = req.params;

  const result = crud.update(table, Number(id), req.body);
  res.json(result);
};

export const deleteItem = (req: Request, res: Response) => {
  const { table, id } = req.params;

  const result = crud.remove(table, Number(id));
  res.json(result);
};