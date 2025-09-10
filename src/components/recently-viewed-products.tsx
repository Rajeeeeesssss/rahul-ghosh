"use client"

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Product } from '@/lib/types';

interface RecentlyViewedContextType {
  recentlyViewedItems: string[];
  addRecentlyViewed: (product: Product) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

const MAX_RECENTLY_VIEWED = 10;

export const RecentlyViewedProvider = ({ children }: { children: ReactNode }) => {
  const [recentlyViewedItems, setRecentlyViewedItems] = useLocalStorage<string[]>('recently_viewed', []);

  // Use useCallback to memoize the function
  const addRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewedItems(prevItems => {
      const updatedItems = [product.id, ...prevItems.filter(id => id !== product.id)];
      return updatedItems.slice(0, MAX_RECENTLY_VIEWED);
    });
  }, [setRecentlyViewedItems]); // Dependency array includes the setter function

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewedItems, addRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};