export const localStorageLoader = (storage: { [key: string]: any }) => {
  window.localStorage.clear();
  return async () => {
    Object.entries(storage).forEach(([key, value]) => {
      console.log({ key, value });
      window.localStorage.setItem(key, JSON.stringify(value));
    });
  };
};
