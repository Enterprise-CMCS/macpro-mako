import * as React from "react";
import { Authority, RaiResponse } from "shared-types";
import { CommonVariables } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
} from "./emailTemplate";
import { render } from "@react-email/components";

export const respondToRai = {
  [Authority.MED_SPA]: {
    cms: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `Medicaid SPA RAI Response for ${variables.id} Submitted`,
        html: render(<MedSpaCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<MedSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`,
        html: render(<MedSpaStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<MedSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `CHIP SPA RAI Response for ${variables.id} Submitted`,
        html: render(<ChipSpaCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<ChipSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `Your CHIP SPA RAI Response for ${variables.id} has been submitted to CMS`,
        html: render(<ChipSpaStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<ChipSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `Waiver RAI Response for ${variables.id} Submitted`,
        html: render(<Waiver1915bCMSEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<Waiver1915bCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (variables: RaiResponse & CommonVariables) => {
      return {
        subject: `Your ${variables.authority} ${variables.authority} Response for ${variables.id} has been submitted to CMS`,
        html: render(<Waiver1915bStateEmail variables={variables} />, {
          pretty: true,
        }),
        text: render(<Waiver1915bStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
};
