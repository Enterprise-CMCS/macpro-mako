import { handleSupportLinkClick } from "../utils";

export const WaiverIdHelp = () => (
  <p>
    Email{" "}
    <a
      className="text-primary"
      href="mailto:MCOGDMCOActions@cms.hhs.gov"
      onClick={handleSupportLinkClick("general")}
    >
      MCOGDMCOActions@cms.hhs.gov
    </a>{" "}
    to get support with determining the correct 1915(b) Waiver Number.
  </p>
);
