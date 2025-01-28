export async function retry<T>(fn: () => Promise<T>, retries: number, delay: number): Promise<T> {
  try {
    console.log("am I here 1");
    return await fn();
  } catch (error) {
    console.log("am I here 2");
    if (retries <= 1) {
      throw error;
    }
    console.log("am I here 3");
    console.warn(`Retrying... (${retries - 1} attempts left)`);
    await new Promise((res) => setTimeout(res, delay));
    return retry(fn, retries - 1, delay);
  }
}
