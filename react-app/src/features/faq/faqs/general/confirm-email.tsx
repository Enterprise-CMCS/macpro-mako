import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { helpDeskContact } from "../utils";

export const ConfirmEmail = () => (
  <p>
    Refresh your inbox, check your SPAM filters, then contact the OneMAC Help Desk{" "}
    <a
      className="text-primary underline hover:no-underline"
      href={`mailto:${helpDeskContact.email}`}
      onClick={() => sendGAEvent("support_contact_email")}
    >
      {helpDeskContact.email}
    </a>{" "}
    or call {helpDeskContact.phone} or contact your state lead.
  </p>
);
