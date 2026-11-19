import { CE_HARDSHIP_KIND_LABELS } from "shared-types";

export const CentraIdFormat = () => (
  <div className="space-y-2">
    <p>
      Enter the Community Engagement Short-Term Hardship Exception submission ID. The ID must follow
      the format SS-CE-YY-### (for example, MD-CE-26-001).
    </p>
    <ul className="list-disc ml-7 space-y-2" role="list">
      <li>SS = 2 alpha characters (State Abbreviation)</li>
      <li>CE = Community Engagement</li>
      <li>YY = 2 numeric digits (Year)</li>
      <li>### = 3 numeric digits (Serial number)</li>
    </ul>
    <p>Choose one request type:</p>
    <ul className="list-disc ml-7 space-y-2" role="list">
      <li>{CE_HARDSHIP_KIND_LABELS.CE_SADE}</li>
      <li>{CE_HARDSHIP_KIND_LABELS.CE_UNEMPLOYMENT}</li>
      <li>{CE_HARDSHIP_KIND_LABELS.CE_NEA}</li>
    </ul>
  </div>
);
