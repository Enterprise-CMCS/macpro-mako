export const sendGAEvent = (eventName, eventObject) => { 
  if (eventObject && typeof window.gtag == "function" ) {
    window.gtag("event", eventName, eventObject)
  } else {
    window.gtag("event", eventName);
  }
}