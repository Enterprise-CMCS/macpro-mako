import * as React from "react";
import { Authority, EmailAddresses, RaiResponse } from "shared-types";
import {
  CommonVariables,
  AuthoritiesWithUserTypesTemplate,
  getAllStateUsers,
} from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  Waiver1915bCMSEmail,
  Waiver1915bStateEmail,
} from "./emailTemplate";
import { render } from "@react-email/render";

export const getContent = async (item: any) => {
  if (!item._source.leadAnalystOfficerId) {
    throw new Error("Invalid rai response");
  }

  const cpocName = item._source.leadAnalystName;
  const cpocId = item._source.leadAnalystOfficerId;
  console.log({ cpocName, cpocId });

  // gptta get the email from somewhere
};

export const respondToRai: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail, // TODO: CPOC and SRT should be added
        subject: `Medicaid SPA RAI Response for ${variables.id} Submitted`,
        html: await render(<MedSpaCMSEmail variables={variables} />),
        text: await render(<MedSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: RaiResponse &
        CommonVariables & { emails: EmailAddresses } & {
          emails: EmailAddresses;
        },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`,
        html: await render(<MedSpaStateEmail variables={variables} />),
        text: await render(<MedSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipInbox, // TODO: CPOC and SRT should be added
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA RAI Response for ${variables.id} Submitted`,
        html: await render(<ChipSpaCMSEmail variables={variables} />),
        text: await render(<ChipSpaCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        subject: `Your CHIP SPA RAI Response for ${variables.id} has been submitted to CMS`,
        html: await render(<ChipSpaStateEmail variables={variables} />),
        text: await render(<ChipSpaStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      // const item = await os.getItem(
      //   process.env.osDomain!,
      //   `${process.env.indexNamespace}main`,
      //   variables.id,
      // );

      // console.log("hits");
      // console.log(JSON.stringify(item, null, 2));

      // getContent();
      // const cpocName = item._source.leadAnalystName;
      // const cpocId = item._source.leadAnalystOfficerId;

      // const srts = item._source.reviewTeam.map((SRT) => {
      //   console.log("cpoc", JSON.stringify(cpoc, null, 2));
      //   console.log("single srt", JSON.stringify(SRT, null, 2));
      // });
      // console.log("srts", JSON.stringify(srts, null, 2));
      return {
        to: [...variables.emails.osgEmail, ...variables.emails.dmcoEmail], // TODO: Should be also sent to CPOC and SRT
        subject: `Waiver RAI Response for ${variables.id} Submitted`,
        html: await render(<Waiver1915bCMSEmail variables={variables} />),
        text: await render(<Waiver1915bCMSEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
    state: async (
      variables: RaiResponse & CommonVariables & { emails: EmailAddresses },
    ) => {
      const stateUsers = await getAllStateUsers(variables.territory);

      return {
        to: [`"${variables.submitterName}" <${variables.submitterEmail}>`],
        cc: stateUsers,
        subject: `Your ${variables.authority} ${variables.authority} Response for ${variables.id} has been submitted to CMS`,
        html: await render(<Waiver1915bStateEmail variables={variables} />),
        text: await render(<Waiver1915bStateEmail variables={variables} />, {
          plainText: true,
        }),
      };
    },
  },
};
