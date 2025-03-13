import { useLDClient } from "launchdarkly-react-client-sdk";
import { useEffect, useState } from "react";

import { LegacyFaq } from "./LegacyFaq";
import { SupportPage } from "./SupportPage";

export const Faq = () => {
  const ldClient = useLDClient();
  const [flagValue, setFlagValue] = useState(false);

  useEffect(() => {
    const isFlagOn = ldClient?.variation("toggleFaq");
    setFlagValue(isFlagOn);
  }, [ldClient]);

  return <>{flagValue ? <SupportPage /> : <LegacyFaq flagValue={flagValue} />}</>;
};
