import ReactGA from "react-ga4";

export function sendGAEvent(eventTitle: string, userRoles: string, userState: string) {
  if (userState) {
    ReactGA.event({
      action: eventTitle,
      category: userState,
    });
  } else {
    ReactGA.event({
      action: eventTitle,
      category: userRoles,
    });
  }
}
