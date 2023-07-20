export const getParsedObject = (obj: any) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      try {
        return [key, JSON.parse(value as string)];
      } catch (error) {
        return [key, value];
      }
    })
  );
