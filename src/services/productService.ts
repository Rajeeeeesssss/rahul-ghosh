
import { db } from '@/lib/firestore';
import type { Product } from '@/lib/types';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, DocumentData } from 'firebase/firestore';

// A helper function to convert Firestore doc data to a Product object
const toProduct = (doc: DocumentData): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data
    } as Product;
}

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(toProduct);
  return productList;
}

export async function getProduct(id: string): Promise<Product | null> {
    const productDocRef = doc(db, 'products', id);
    const productSnapshot = await getDoc(productDocRef);
    if (productSnapshot.exists()) {
        return toProduct(productSnapshot);
    }
    return null;
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<string> {
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, {
      ...productData,
      isFeatured: false,
      isNew: true, // Default new products to be "New"
      isSale: false,
    });
    return docRef.id;
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    const productDocRef = doc(db, 'products', id);
    await updateDoc(productDocRef, productData);
}

export async function deleteProduct(id: string): Promise<void> {
    const productDocRef = doc(db, 'products', id);
    await deleteDoc(productDocRef);
}
