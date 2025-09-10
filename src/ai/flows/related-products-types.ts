import { z } from 'zod';

export const RelatedProductsInputSchema = z.object({
  productDescription: z.string().describe('The description of the product.'),
  productCategory: z.string().describe('The category of the product.'),
  currentProductId: z.string().describe('The ID of the current product to exclude from suggestions.'),
  numberOfProducts: z.number().default(4).describe('The number of related products to retrieve.'),
});

export type RelatedProductsInput = z.infer<typeof RelatedProductsInputSchema>;

const RelatedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  brand: z.string(),
  rating: z.number(),
  reviews: z.number(),
  stock: z.number(),
  image: z.string(),
  images: z.array(z.string()),
});

export const RelatedProductsOutputSchema = z.array(RelatedProductSchema);
export type RelatedProductsOutput = z.infer<typeof RelatedProductsOutputSchema>;
