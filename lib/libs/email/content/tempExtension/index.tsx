import { OneMac } from "shared-types";
import { CommonVariables } from "../..";
import { render } from "@react-email/components";
import * as React from "react";
import { TempExtCMSEmail, TempExtStateEmail } from "./emailTemplate";

export const tempExtention = {
  cms: async (variables: OneMac & CommonVariables) => {
    return {
      subject: `${variables.authority} Waiver Extension ${variables.id} Submitted`,
      html: render(<TempExtCMSEmail variables={variables} />, {
        pretty: true,
      }),
      text: render(<TempExtCMSEmail variables={variables} />, {
        plainText: true,
      }),
    };
  },
  state: async (variables: OneMac & CommonVariables) => {
    return {
      subject: `Your Request for the ${variables.authority} Waiver Extension ${variables.id} has been submitted to CMS`,
      html: render(<TempExtStateEmail variables={variables} />, {
        pretty: true,
      }),
      text: render(<TempExtStateEmail variables={variables} />, {
        plainText: true,
      }),
    };
  },
};
