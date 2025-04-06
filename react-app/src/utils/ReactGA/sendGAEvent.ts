import ReactGA from "react-ga4";

export const  sendGAEvent = (eventTitle :string, userRoles: string, userState: string ) => {
    userState? 
    ReactGA.event({
        action:  eventTitle,
        category: userState,
        user_role: userRoles
      }) : 

      ReactGA.event({
        action:  eventTitle,
        user_role:  userRoles
      })
} 