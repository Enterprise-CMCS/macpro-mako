import { Action } from "shared-types";
import { describe, expect, it } from "vitest";

import { getLegacyEventType } from "./legacy-event-type";
describe("getLegacyEventType", () => {
  it("should return undefined if GSI1pk is missing", () => {
    const legacyEvent = getLegacyEventType("");
    expect(legacyEvent).toBe(undefined);
  });

  it("should return undefined if GSI1pk does not contain 'submit', 'spa', or 'waiver'", () => {
    const legacyEvent = getLegacyEventType("OneMAC#invalidvalue");
    expect(legacyEvent).toBe(undefined);
  });

  it("should return 'new-legacy-submission' if GSI1pk is an initial submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitchipspa");
    expect(legacyEvent).toEqual("new-legacy-submission");
  });

  it("should return 'respond-to-rai' if GSI1pk is an RAI response submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverrai");
    expect(legacyEvent).toEqual(Action.RESPOND_TO_RAI);
  });

  it("should return 'withdraw-package' if GSI1pk is a withdraw package submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverrenewalwithdraw");
    expect(legacyEvent).toEqual(Action.WITHDRAW_PACKAGE);
  });

  it("should return 'legacy-withdraw-rai-request' if GSI1pk is a withdraw RAI submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitrairesponsewithdraw");
    expect(legacyEvent).toEqual(Action.LEGACY_WITHDRAW_RAI_REQUEST);
  });

  it("should return 'upload-subsequent-documents' if GSI1pk is an upload subsequent documents submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiveramendmentsubsequent");
    expect(legacyEvent).toEqual(Action.UPLOAD_SUBSEQUENT_DOCUMENTS);
  });

  it("should return undefined if GSI1pk submission type is invalid", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitinvalidtype");
    expect(legacyEvent).toEqual(undefined);
  });

  it("should return undefined if GSI1pk submission type is blank", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submit");
    expect(legacyEvent).toEqual(undefined);
  });
});
