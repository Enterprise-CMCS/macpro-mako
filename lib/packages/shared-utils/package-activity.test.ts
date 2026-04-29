import { describe, expect, it } from "vitest";

import {
  getPackageActivityLabel,
  getPackageActivityLabelSlug,
  slugifyPackageActivityLabel,
} from "./package-activity";

describe("package activity helpers", () => {
  it("maps package activity events to user-visible labels", () => {
    expect(getPackageActivityLabel("respond-to-rai")).toBe("RAI Response Submitted");
    expect(getPackageActivityLabel("upload-subsequent-documents")).toBe(
      "Subsequent Document(s) Uploaded",
    );
  });

  it("slugifies labels for archive naming", () => {
    expect(slugifyPackageActivityLabel("Subsequent Document(s) Uploaded")).toBe(
      "subsequent-documents-uploaded",
    );
    expect(getPackageActivityLabelSlug("respond-to-rai")).toBe("rai-response-submitted");
  });
});
