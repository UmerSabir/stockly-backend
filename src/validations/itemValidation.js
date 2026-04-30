import { z } from "zod";

export const addItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  purchasePrice: z.number().min(0, "Purchase price cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  expiryDate: z.string().optional()
});

export const updateItemSchema = z.object({
  name: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  quantity: z.number().min(0).optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  expiryDate: z.string().optional()
});