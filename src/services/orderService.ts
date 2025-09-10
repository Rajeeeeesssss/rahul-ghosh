
import { db } from '@/lib/firestore';
import type { Order } from '@/lib/types';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

const ordersCol = collection(db, 'orders');

export async function createOrder(orderData: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(ordersCol, orderData);
    return docRef.id;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
    const q = query(ordersCol, where('userId', '==', userId));
    const orderSnapshot = await getDocs(q);
    const orderList = orderSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Order));
    return orderList.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllOrders(): Promise<Order[]> {
    const orderSnapshot = await getDocs(ordersCol);
    const orderList = orderSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Order));
    return orderList.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
}
