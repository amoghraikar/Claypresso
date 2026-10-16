'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '@/types/product';
import { ArtworkDossierModal } from '@/components/exhibition/ArtworkDossierModal';

interface DossierContextType {
  openDossier: (product: Product, productList?: Product[]) => void;
  closeDossier: () => void;
  selectedProduct: Product | null;
}

const DossierContext = createContext<DossierContextType | undefined>(undefined);

export const DossierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);

  const openDossier = useCallback((product: Product, list?: Product[]) => {
    setSelectedProduct(product);
    if (list && list.length > 0) {
      setProductList(list);
    } else {
      setProductList([product]);
    }
  }, []);

  const closeDossier = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (!selectedProduct || productList.length <= 1) return;
    const currIndex = productList.findIndex((p) => p.id === selectedProduct.id);
    const prevIndex = (currIndex - 1 + productList.length) % productList.length;
    setSelectedProduct(productList[prevIndex]);
  }, [selectedProduct, productList]);

  const handleNext = useCallback(() => {
    if (!selectedProduct || productList.length <= 1) return;
    const currIndex = productList.findIndex((p) => p.id === selectedProduct.id);
    const nextIndex = (currIndex + 1) % productList.length;
    setSelectedProduct(productList[nextIndex]);
  }, [selectedProduct, productList]);

  return (
    <DossierContext.Provider value={{ openDossier, closeDossier, selectedProduct }}>
      {children}
      <ArtworkDossierModal
        product={selectedProduct}
        onClose={closeDossier}
        onPrev={handlePrev}
        onNext={handleNext}
        hasNavigation={productList.length > 1}
      />
    </DossierContext.Provider>
  );
};

export const useDossier = () => {
  const context = useContext(DossierContext);
  if (!context) {
    throw new Error('useDossier must be used within a DossierProvider');
  }
  return context;
};
