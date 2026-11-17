import { seaToolFriendlyTimestamp } from "shared-utils/seatool-date-helper";
import { describe, expect, it } from "vitest";

import {
  CE_PROPOSED_EFFECTIVE_DATE,
  CE_TIMESTAMP,
  ceRecordInput,
} from "../../../events/ce-test-fixtures";
import { transform } from "./ce-record-submitted";

describe("ce-record-submitted main transform", () => {
  it("indexes a submitted CEntra package", () => {
    const result = transform().parse(ceRecordInput());
    const timestampDate = new Date(CE_TIMESTAMP);

    expect(result).toMatchObject({
      id: "MD-CE-26-001",
      authority: "CE_HARDSHIP_EXCEPTION",
      hardshipKind: "CE_UNEMPLOYMENT",
      origin: "OneMAC",
      seatoolStatus: "Submitted",
      stateStatus: "Submitted",
      cmsStatus: "Submitted - Intake Needed",
      state: "MD",
      proposedDate: CE_PROPOSED_EFFECTIVE_DATE,
      submissionDate: timestampDate.toISOString(),
      changedDate: timestampDate.toISOString(),
      makoChangedDate: timestampDate.toISOString(),
      statusDate: new Date(seaToolFriendlyTimestamp(timestampDate)).toISOString(),
      submitterEmail: "alex.rivera@maryland.gov",
      submitterName: "Alex Rivera",
      additionalInformation: "High unemployment attestation for MD counties.",
      initialIntakeNeeded: true,
      raiWithdrawEnabled: false,
    });
  });
});
