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

  it("should return 'new-chip-submission' if GSI1pk is an chip spa submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitchipspa");
    expect(legacyEvent).toEqual("new-chip-submission");
  });

  it("should return 'new-medicaid-submission' if GSI1pk is a medicaid spa submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitmedicaidspa");
    expect(legacyEvent).toEqual("new-medicaid-submission");
  });

  it("should return 'capitated-amendment' if is a 1915(b) ammendment submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiveramendment", "1915(b)");
    expect(legacyEvent).toEqual("capitated-amendment");
  });

  it("should return 'contracting-amendment' if is a 1915(b)(4) ammendment submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiveramendment", "1915(b)(4)");
    expect(legacyEvent).toEqual("contracting-amendment");
  });

  it("should return 'app-k' if is an waiver app k submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverappk");
    expect(legacyEvent).toEqual("app-k");
  });

  it("should return 'temporary-extension' if GSI1pk is an waiver extension submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverextension");
    expect(legacyEvent).toEqual("temporary-extension");
  });

  it("should return 'capitated-initial' if is a 1915(b) initial submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaivernew", "1915(b)");
    expect(legacyEvent).toEqual("capitated-initial");
  });

  it("should return 'contracting-initial' if is a 1915(b)(4) initial submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaivernew", "1915(b)(4)");
    expect(legacyEvent).toEqual("contracting-initial");
  });

  it("should return 'capitated-renewal' if is a 1915(b) renewal submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverrenewal", "1915(b)");
    expect(legacyEvent).toEqual("capitated-renewal");
  });

  it("should return 'contracting-renewal' if is a 1915(b)(4) renewal submission type", () => {
    const legacyEvent = getLegacyEventType("OneMAC#submitwaiverrenewal", "1915(b)(4)");
    expect(legacyEvent).toEqual("contracting-renewal");
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
