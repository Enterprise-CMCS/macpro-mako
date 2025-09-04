import { PdfLink } from "../utils";

export const CrosswalkSystem = () => (
  <div className="space-y-2">
    <p>
      OneMAC supports all Medicaid SPAs, except SPAs submitted in MACPro. This includes CHIP SPAs,
      1915(b) waiver actions, 1915(c) Appendix K waiver amendments, and 1915(b) and (c) waiver
      temporary extension requests.
    </p>
    <p>Check which system to submit your state plan in with this crosswalk training document.</p>
    <ul>
      <li>
        <PdfLink
          href="/onboarding/eligibility-crosswalk-paper-based-state-plan-macpro.pdf"
          title="Crosswalk from Paper-based State Plan to MACPro and MMDL.pdf"
          label="general"
        />
      </li>
    </ul>
  </div>
);
