export const STORAGE_MAP_SYMBOL = Symbol("map");

export class Storage<Key extends string = string> {
  private [STORAGE_MAP_SYMBOL]: Map<Key, string>;

  constructor() {
    this[STORAGE_MAP_SYMBOL] = new Map<Key, string>();
  }

  /**
   * Returns the number of key/value pairs.
   */
  get length(): number {
    return this[STORAGE_MAP_SYMBOL].size;
  }

  /**
   * Returns the current value associated with the given key, or null if the given key does not exist.
   */
  public getItem(key: Key): string | null {
    console.log(`getting item for key: ${key} value: ${this[STORAGE_MAP_SYMBOL].get(key) || null}`);
    return this[STORAGE_MAP_SYMBOL].get(key) || null;
  }

  /**
   * Returns the name of the nth key, or null if n is greater than or equal to the number of key/value pairs.
   */
  public key(index: number): string | null {
    console.log(`looking for key index: ${index}`);
    const keys = Array.from(this[STORAGE_MAP_SYMBOL].keys());
    return keys[index] || null;
  }

  /**
   * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
   *
   * Unlike the browser implementation, does not throw when the value cannot be set
   * because no such policy can be configured in Node.js. Does not emit the storage
   * event on Window because there's no window.
   */
  public setItem(key: Key, value: string): void {
    console.log(`setting ${key}: ${value}`);
    this[STORAGE_MAP_SYMBOL].set(key, value);
  }

  /**
   * Removes the key/value pair with the given key, if a key/value pair with the given key exists.
   *
   * Does not dispatch the storage event on Window.
   */
  public removeItem(key: Key): void {
    console.log(`removing item for key: ${key}`);
    this[STORAGE_MAP_SYMBOL].delete(key);
  }

  /**
   * Removes all key/value pairs, if there are any.
   *
   * Does not dispatch the storage event on Window.
   */
  public clear(): void {
    this[STORAGE_MAP_SYMBOL].clear();
  }
}
