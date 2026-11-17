import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getFAQLinkForAttachments } from "@/features/forms/faqLinks";

import { CentraAttachments } from "./centra-attachments";
import { CentraIdFormat } from "./centra-id-format";
import { spaContent } from "./index";
import { SpaAmendments } from "./spa-amendments";

describe("CEntra FAQ", () => {
  it("adds new SPA FAQ entries for the ID format and attachments", () => {
    expect(spaContent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          anchorText: "centra-id-format",
          question:
            "What format is used to enter a Community Engagement Short-Term Hardship Exception ID?",
          label: "New",
          labelColor: "blue",
        }),
        expect.objectContaining({
          anchorText: "centra-attachments",
          question:
            "What are the attachments for a Community Engagement Short-Term Hardship Exception?",
          label: "New",
          labelColor: "blue",
        }),
      ]),
    );
  });

  it("describes the submission ID, request types, and attachment slots", () => {
    render(
      <>
        <CentraIdFormat />
        <CentraAttachments />
        <SpaAmendments />
      </>,
    );

    expect(screen.getByText(/SS-CE-YY-###/)).toBeInTheDocument();
    expect(screen.getByText("MD-CE-26-001", { exact: false })).toBeInTheDocument();
    expect(
      screen.getAllByText("Stafford Act Disaster and Emergency Requests").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("High Unemployment Requests").length).toBeGreaterThan(0);
    expect(screen.getAllByText("National Emergencies Act Requests").length).toBeGreaterThan(0);
    expect(screen.getByText("Template")).toBeInTheDocument();
    expect(screen.getByText("Other Supporting Documentation")).toBeInTheDocument();
    expect(
      screen.getByText(/Submitted requests appear on the SPAs dashboard as CE Hardship Exception/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "What format is used to enter a Community Engagement Short-Term Hardship Exception ID?",
      }),
    ).toHaveAttribute("href", "#centra-id-format");
    expect(
      screen.getByRole("link", {
        name: "What are the attachments for a Community Engagement Short-Term Hardship Exception?",
      }),
    ).toHaveAttribute("href", "#centra-attachments");
  });

  it("links CEntra forms to the attachment FAQ", () => {
    expect(getFAQLinkForAttachments("ce-record-submitted")).toBe("/faq/centra-attachments");
    expect(getFAQLinkForAttachments("ce-subsequent-documents")).toBe("/faq/centra-attachments");
  });
});
