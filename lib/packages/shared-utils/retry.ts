export async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
  try {
    return fn();
  } catch (error) {
    if (retries <= 1) {
      throw error;
    }
    console.warn(`Retrying... (${retries - 1} attempts left)`);
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay);
  }
}
