export const sendGAEvent = (eventName, eventObject) => { 
  if (eventObject && typeof window.gtag == "function" ) {
    window.gtag("event", eventName, eventObject)
  } else if (typeof window.gtag == "function") {
    window.gtag("event", eventName);
  }
}