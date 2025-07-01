export const sendGAEvent = (eventName, eventObject = {}) => {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, eventObject);
};
