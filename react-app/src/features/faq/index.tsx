import { useEffect, useState } from "react";
import { useLDClient } from "launchdarkly-react-client-sdk";
import {LegacyFaq} from "./LegacyFaq"
import {NewFaq} from "./NewFaq"

export const Faq = () => {
  const ldClient = useLDClient();
  const [flagValue, setFlagValue] = useState(false);

  useEffect(() => {
    const isFlagOn = ldClient?.variation("toggleFaq");
    setFlagValue(isFlagOn)
  }, [ldClient.allFlags()]);

  return (
    <>
      {flagValue ? <NewFaq />: <LegacyFaq flagValue={flagValue} /> }
    </>
  );
};

