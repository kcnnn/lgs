"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { InspectionData } from "@/lib/roof-inspection/types";
import { createEmptyInspection } from "@/lib/roof-inspection/storage";
import { useLocalStorageStore } from "@/lib/roof-inspection/useLocalStorageStore";

const INSPECTION_STORAGE_KEY = "roof-inspection:current";
const API_KEY_STORAGE_KEY = "roof-inspection:api-key";

type InspectionContextValue = {
  inspection: InspectionData;
  apiKey: string;
  hasApiKey: boolean;
  updateInspection: (updater: (draft: InspectionData) => InspectionData) => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  resetInspection: () => void;
};

const InspectionContext = createContext<InspectionContextValue | null>(null);

const DEFAULT_INSPECTION = createEmptyInspection();

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [inspection, setInspection, clearInspectionStore] = useLocalStorageStore<InspectionData>(
    INSPECTION_STORAGE_KEY,
    DEFAULT_INSPECTION
  );
  const [apiKey, setApiKeyStore, clearApiKeyStore] = useLocalStorageStore<string>(
    API_KEY_STORAGE_KEY,
    ""
  );

  const updateInspection = useCallback(
    (updater: (draft: InspectionData) => InspectionData) => {
      setInspection({ ...updater(inspection), updatedAt: new Date().toISOString() });
    },
    [inspection, setInspection]
  );

  const setApiKey = useCallback((key: string) => setApiKeyStore(key), [setApiKeyStore]);
  const clearApiKey = useCallback(() => clearApiKeyStore(), [clearApiKeyStore]);
  const resetInspection = useCallback(() => {
    clearInspectionStore();
    setInspection(createEmptyInspection());
  }, [clearInspectionStore, setInspection]);

  const value = useMemo<InspectionContextValue>(
    () => ({
      inspection,
      apiKey,
      hasApiKey: apiKey.trim().length > 0,
      updateInspection,
      setApiKey,
      clearApiKey,
      resetInspection,
    }),
    [inspection, apiKey, updateInspection, setApiKey, clearApiKey, resetInspection]
  );

  return <InspectionContext.Provider value={value}>{children}</InspectionContext.Provider>;
}

export function useInspection(): InspectionContextValue {
  const ctx = useContext(InspectionContext);
  if (!ctx) {
    throw new Error("useInspection must be used within an InspectionProvider");
  }
  return ctx;
}
