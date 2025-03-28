export class Observer<T> {
  private subscribers: Array<(observed: T) => void>;
  observed: T | null;

  constructor() {
    this.subscribers = [];
    this.observed = null;
  }

  subscribe = (subscriber: (newObserved: T | null) => void) => {
    this.subscribers.push(subscriber);

    // unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  publish = (data: T | null) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };
}
