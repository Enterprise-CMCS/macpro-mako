import { useState, useEffect } from "react";

export const removeItemLocalStorage = () => {
  window.localStorage.removeItem("osQuery");
  window.localStorage.removeItem("osColumns");
};

interface GenericInitialValue {
  [index: number]: unknown;
}
type keyType = "osQuery" | "osColumns";

export const useLocalStorage = (key: keyType, initialValue: GenericInitialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.log("Error while getting local storage: ", e);
    }
  });

  useEffect(() => {
    const updateLocalStorage = () => {
      if (typeof window !== "undefined") {
        if (storedValue === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(storedValue));
        }
      }
    };
    try {
      updateLocalStorage();
    } catch (e) {
      console.log("Error setting local storage", e);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
