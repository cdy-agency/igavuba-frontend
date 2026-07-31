'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CertificateTab = 'default' | 'courses';

interface CertificateTabContextValue {
  activeTab: CertificateTab;
  setActiveTab: (tab: CertificateTab) => void;
}

const CertificateTabContext = createContext<CertificateTabContextValue | undefined>(undefined);

export function CertificateTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<CertificateTab>('default');

  // Load from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeCertificateTab') as CertificateTab | null;
    if (savedTab) setActiveTabState(savedTab);
  }, []);

  // Update state and localStorage together
  const setActiveTab = (tab: CertificateTab) => {
    setActiveTabState(tab);
    localStorage.setItem('activeCertificateTab', tab);
  };

  return (
    <CertificateTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </CertificateTabContext.Provider>
  );
}

// Custom hook for easier consumption
export function useCertificateTab() {
  const context = useContext(CertificateTabContext);
  if (!context) throw new Error('useCertificateTab must be used within CertificateTabProvider');
  return context;
}
