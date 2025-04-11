import ReactGA from "react-ga4";

export function sendGAEvent(eventTitle: string, userRoles: string, userState: string) {
  if (userState) {
    ReactGA.event({
      action: eventTitle,
      category: userState,
      user_role: userRoles,
    });
  } else {
    ReactGA.event({
      action: eventTitle,
      user_role: userRoles,
    });
  }
}
