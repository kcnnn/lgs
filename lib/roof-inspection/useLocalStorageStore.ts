"use client";

import { useSyncExternalStore } from "react";

type Listener = () => void;

type LocalStorageStore<T> = {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: Listener) => () => void;
  set: (value: T) => void;
  clear: () => void;
};

const stores = new Map<string, LocalStorageStore<unknown>>();

function createStore<T>(key: string, defaultValue: T): LocalStorageStore<T> {
  let cache: T = defaultValue;
  let loaded = false;
  const listeners = new Set<Listener>();

  function readFromStorage(): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function getSnapshot(): T {
    if (!loaded) {
      cache = readFromStorage();
      loaded = true;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return defaultValue;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function set(value: T) {
    cache = value;
    loaded = true;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error(`Failed to persist "${key}" to localStorage`, err);
      }
    }
    listeners.forEach((listener) => listener());
  }

  function clear() {
    cache = defaultValue;
    loaded = true;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    listeners.forEach((listener) => listener());
  }

  return { getSnapshot, getServerSnapshot, subscribe, set, clear };
}

function getStore<T>(key: string, defaultValue: T): LocalStorageStore<T> {
  let store = stores.get(key) as LocalStorageStore<T> | undefined;
  if (!store) {
    store = createStore(key, defaultValue);
    stores.set(key, store as LocalStorageStore<unknown>);
  }
  return store;
}

/**
 * Reads and writes a JSON-serializable value from localStorage, backed by
 * useSyncExternalStore so hydration stays consistent and updates propagate
 * to every component sharing the same key without a setState-in-effect.
 */
export function useLocalStorageStore<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  const store = getStore(key, defaultValue);
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.set, store.clear];
}
