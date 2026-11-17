import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

import { PackageSection } from "./PackageSection";

describe("PackageSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows CEntra submission id, authority, request type, and submission date", async () => {
    vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: "MD-CE-26-001",
        found: true,
        _source: {
          id: "MD-CE-26-001",
          authority: "CE_HARDSHIP_EXCEPTION",
          hardshipKind: "CE_SADE",
          proposedDate: 1774396800000,
        },
      },
    } as ReturnType<typeof api.useGetItem>);

    await renderFormWithPackageSectionAsync(
      <PackageSection />,
      "MD-CE-26-001",
      "CE_HARDSHIP_EXCEPTION",
    );

    expect(screen.getByText("Submission ID")).toBeInTheDocument();
    expect(screen.getByText("MD-CE-26-001")).toBeInTheDocument();
    expect(screen.getByText("CE Hardship Exception")).toBeInTheDocument();
    expect(screen.getByText("Request Type")).toBeInTheDocument();
    expect(screen.getByText("Stafford Act Disaster and Emergency Requests")).toBeInTheDocument();
    expect(screen.getByText("Submission Date")).toBeInTheDocument();
    expect(screen.getByText("March 25, 2026")).toBeInTheDocument();
  });

  it("reads a CEntra draft request type and submission date", async () => {
    vi.spyOn(api, "useGetItem").mockReturnValue({
      data: {
        _id: "MD-CE-26-002",
        found: true,
        _source: {
          id: "MD-CE-26-002",
          authority: "CE_HARDSHIP_EXCEPTION",
          draft: {
            savedAt: "2026-03-06T00:00:00.000Z",
            data: {
              hardshipKind: "CE_UNEMPLOYMENT",
              proposedEffectiveDate: 1774396800000,
            },
          },
        },
      },
    } as ReturnType<typeof api.useGetItem>);

    await renderFormWithPackageSectionAsync(
      <PackageSection />,
      "MD-CE-26-002",
      "CE_HARDSHIP_EXCEPTION",
    );

    expect(screen.getByText("High Unemployment Requests")).toBeInTheDocument();
    expect(screen.getByText("March 25, 2026")).toBeInTheDocument();
  });

  it("keeps the Medicaid SPA summary", async () => {
    await renderFormWithPackageSectionAsync(<PackageSection />, "MD-00-0001", "Medicaid SPA");

    expect(screen.getByText("Package ID")).toBeInTheDocument();
    expect(screen.getByText("Medicaid SPA")).toBeInTheDocument();
    expect(screen.queryByText("Request Type")).not.toBeInTheDocument();
    expect(screen.queryByText("Submission Date")).not.toBeInTheDocument();
  });
});
