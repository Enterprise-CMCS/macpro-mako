import { useEffect, useState } from "react";
import { useLDClient } from "launchdarkly-react-client-sdk";
import {LegacyFaq} from "./LegacyFaq"
import {NewFaq} from "./NewFaq"

export const Faq = () => {
  const ldClient = useLDClient();
  const [flagValue, setFlagValue] = useState(false);
  useEffect(() => {
    const updateFlagValue = () => {
      const updatedFlagValue = ldClient.allFlags()['toggleFaq'] || false;
      setFlagValue(updatedFlagValue);
    };

    updateFlagValue();

    // Set up a periodic interval to check for flag changes every 5 seconds
    const intervalId = setInterval(() => {
      updateFlagValue();
    }, 7000); // 5000 ms = 5 seconds

    // Cleanup the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
    };
  }, [ldClient]);

  return (
    <>
      {flagValue ? <LegacyFaq flagValue={flagValue} /> : <NewFaq />}
    </>
  );
};
