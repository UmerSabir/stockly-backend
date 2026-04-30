import { z } from "zod";

export const addSaleSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  customerName: z.string().min(2).optional(),
  quantitySold: z.number().min(1, "Quantity sold must be at least 1"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  saleDate: z.string().optional()
});

export const updateSaleSchema = z.object({
  customerName: z.string().min(2).optional(),
  quantitySold: z.number().min(1).optional(),
  sellingPrice: z.number().min(0).optional(),
  saleDate: z.string().optional()
});
