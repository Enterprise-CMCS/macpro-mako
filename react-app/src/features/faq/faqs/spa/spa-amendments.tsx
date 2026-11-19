import { CE_HARDSHIP_EXCEPTION_LABEL, CE_HARDSHIP_KIND_LABELS } from "shared-types";

const faqLinks = [
  {
    text: "What format is used to enter a Community Engagement Short-Term Hardship Exception ID?",
    href: "#centra-id-format",
  },
  {
    text: "What are the attachments for a Community Engagement Short-Term Hardship Exception?",
    href: "#centra-attachments",
  },
  {
    text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA templates?",
    href: "#abp-spa-templates",
  },
  {
    text: "Where can I download Medicaid Alternative Benefit Plan (ABP) SPA implementation guides?",
    href: "#abp-implementation-guides-spa",
  },
  {
    text: "Where can I download Medicaid Premiums and Cost Sharing SPA templates?",
    href: "#mpc-spa-templates",
  },
  {
    text: "Where can I download Medicaid Premiums and Cost Sharing SPA implementation guides?",
    href: "#mpc-spa-implementation-guides",
  },
  {
    text: "Where can I download CHIP eligibility SPA templates?",
    href: "#chip-spa-templates",
  },
  {
    text: "Where can I download CHIP eligibility SPA implementation guides?",
    href: "#chip-spa-implementation-guides",
  },
];

export const SpaAmendments = () => (
  <div className="w-full space-y-2">
    <p>
      All Medicaid and CHIP state plan amendments (SPAs), <b>except </b>
      Medicaid SPA submissions processed in the Medicaid & CHIP Program System portal (MACPro), must
      be submitted in OneMac.
    </p>
    <p>
      Starting July 28, 2025 Medicaid Model Data Lab (MMDL) no longer accepts new submissions for
      these SPAs, including:
    </p>
    <ul className="ml-8 list-disc space-y-2" role="list">
      <li>Medicaid Alternative Benefit Plan (ABP)</li>
      <li>Medicaid Premiums & Cost Sharing</li>
      <li>CHIP Eligibility</li>
    </ul>
    <p>
      Pending SPAs submitted in MMDL before July 28, 2025 including those on RAI (request for
      additional information) status, will continue to be processed through MMDL.
    </p>
    <p>
      Community Engagement Short-Term Hardship Exception requests are submitted in OneMAC from the
      Medicaid SPA submission flow. Choose {CE_HARDSHIP_KIND_LABELS.CE_SADE},{" "}
      {CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT}, or {CE_HARDSHIP_KIND_LABELS.CE_NEA}. Submitted
      requests appear on the SPAs dashboard as {CE_HARDSHIP_EXCEPTION_LABEL}.
    </p>
    <p>
      Templates and implementation guides for OneMAC SPAs can be downloaded from the respective FAQ:
    </p>
    <ul className="ml-8 list-disc space-y-2 text-primary" role="list">
      {faqLinks.map(({ href, text }) => (
        <li key={href}>
          <a
            href={href}
            onClick={(e) => {
              e.preventDefault();
              const targetElement = document.getElementById(href.substring(1));
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

                const buttonElement = targetElement.querySelector("button");
                if (buttonElement?.dataset.state === "closed") {
                  buttonElement.click();
                }
              }
            }}
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
