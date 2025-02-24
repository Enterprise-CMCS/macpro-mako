import { useState, useEffect } from "react";

interface LocalStorageData {
  osQuery?: string;
  spaOSColumns?: string[];
  waiversOSColumns?: string[];
  spaOSData?: object;
  waiversOSData?: object;
  [key: string]: any;
}

type LocalStorageKeys = Extract<keyof LocalStorageData, string>;

export const removeItemLocalStorage = (key?: LocalStorageKeys) => {
  if (key) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.removeItem("osData");
  }
};

export const useLocalStorage = (key: LocalStorageKeys, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem("osData");
      const data = item ? JSON.parse(item) : {};
      return data[key] ?? initialValue;
    } catch (e) {
      console.log("Error while getting local storage: ", e);
      return initialValue;
    }
  });

  useEffect(() => {
    const updateLocalStorage = () => {
      if (typeof window !== "undefined") {
        try {
          const item = window.localStorage.getItem("osData");
          const data = item ? JSON.parse(item) : {};

          data[key] = storedValue;

          localStorage.setItem("osData", JSON.stringify(data));
        } catch (e) {
          console.log("Error setting local storage", e);
        }
      }
    };

    updateLocalStorage();
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
