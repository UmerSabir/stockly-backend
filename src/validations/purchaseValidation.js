import { z } from "zod";

export const addPurchaseSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  supplierName: z.string().min(2, "Supplier name must be at least 2 characters"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  batchNumber: z.string().optional(),
  purchaseDate: z.string().optional()
});

export const updatePurchaseSchema = z.object({
  supplierName: z.string().min(2).optional(),
  quantity: z.number().min(1).optional(),
  costPrice: z.number().min(0).optional(),
  batchNumber: z.string().optional(),
  purchaseDate: z.string().optional()
});