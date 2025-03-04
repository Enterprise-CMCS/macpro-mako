import { useState, useEffect } from "react";

export const removeItemLocalStorage = (key?: string) => {
  if (key) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.clear();
  }
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.log("Error while getting local storage:", e);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (e) {
        console.log("Error setting local storage:", e);
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
};
