
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Product } from './types';

const PRODUCTS_COLLECTION = 'products';

// The initialProducts can be used to seed the database if it's empty.
export const initialProducts: Omit<Product, 'id'>[] = [];

// Helper to seed the database
export const seedDatabase = async () => {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsCollection);
    if (snapshot.empty && initialProducts.length > 0) {
        console.log('Seeding database with initial products...');
        for (const product of initialProducts) {
            await addDoc(productsCollection, product);
        }
    }
};


export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products from Firestore:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsCollection, product);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching product by ID ${id}:`, error);
        return undefined;
    }
}

export const getProductByName = async (name: string): Promise<Product | undefined> => {
    try {
        const productsCollection = collection(db, PRODUCTS_COLLECTION);
        const q = query(productsCollection, where("name", "==", name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Product;
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching product by name ${name}:`, error);
        return undefined;
    }
}

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const allProducts = await getProducts();
    const filteredProducts = allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return filteredProducts;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
};


export const removeProduct = async (productId: string) => {
    try {
        const docRef = doc(db, PRODUCTS_COLLECTION, productId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error removing product ${productId}:`, error);
        throw error;
    }
};
