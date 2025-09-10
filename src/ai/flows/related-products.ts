
'use server';

/**
 * @fileOverview An AI agent to suggest related products for a given product.
 *
 * - getRelatedProducts - A server action to call the flow from the client.
 */

import {ai} from '@/ai/genkit';
import { getProducts as getProductsFromDb } from '@/services/productService';
import type { Product } from '@/lib/types';
import { z } from 'zod';
import { RelatedProductsInputSchema, RelatedProductsOutputSchema, RelatedProductsInput, RelatedProductsOutput } from './related-products-types';


const relatedProductsPrompt = ai.definePrompt({
  name: 'relatedProductsPrompt',
  input: {
    schema: z.object({
      productDescription: z.string(),
      productCategory: z.string(),
      numberOfProducts: z.number(),
      allProductNames: z.array(z.string()),
    })
  },
  output: {
    schema: z.array(z.string()).describe('An array of related product names from the provided list.'),
  },
  prompt: `You are a helpful shopping assistant. Given a product description, category, and a list of all available products, you will suggest related products that the user might be interested in.

Product Description: {{{productDescription}}}
Product Category: {{{productCategory}}}
All Available Products: {{{json allProductNames}}}

Suggest {{numberOfProducts}} related products from the list of all available products. Only return the names of the products in an array. Do not include any additional explanation.`,
});

const relatedProductsFlow = ai.defineFlow(
  {
    name: 'relatedProductsFlow',
    inputSchema: RelatedProductsInputSchema,
    outputSchema: RelatedProductsOutputSchema,
  },
  async (input) => {
    const allProducts = await getProductsFromDb();
    const allProductNames = allProducts.map(p => p.name);

    const { output: relatedProductNames } = await relatedProductsPrompt({
      productDescription: input.productDescription,
      productCategory: input.productCategory,
      numberOfProducts: input.numberOfProducts,
      allProductNames: allProductNames
    });
    
    if (!relatedProductNames) {
        return [];
    }

    const foundProducts = relatedProductNames
      .map(name => allProducts.find(p => p.name.toLowerCase() === name.toLowerCase() && p.id !== input.currentProductId))
      .filter((p): p is Product => Boolean(p));

    return foundProducts.slice(0, input.numberOfProducts);
  }
);


export async function getRelatedProducts(input: RelatedProductsInput): Promise<RelatedProductsOutput> {
  return relatedProductsFlow(input);
}
