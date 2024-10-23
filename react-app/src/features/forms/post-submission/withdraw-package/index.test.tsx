import { screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  WithdrawPackageActionWaiver,
  WithdrawPackageAction,
  WithdrawPackageActionChip,
} from "@/features/forms/post-submission/withdraw-package";
import { renderForm } from "@/utils/test-helpers/renderForm";

describe("Withdraw package", () => {
  // test documentChecker function from ActionForm in isolation
  beforeEach(() => {
    vi.mock("@/components/ActionForm", () => ({
      ActionForm: ({ documentPollerArgs }: any) => {
        const { documentChecker } = documentPollerArgs;
        if (documentChecker({ recordExists: false })) {
          return <div>Document exists</div>;
        }
        return <div>No document</div>;
      },
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display "No document" when documentChecker returns false for waivers', () => {
    renderForm(<WithdrawPackageActionWaiver />);
    vi.mock("@/api", () => ({
      useGetItem: vi.fn().mockReturnValue({
        data: {
          _source: {
            actionType: "",
          },
        },
      }),
    }));
    expect(screen.getByText("No document")).toBeInTheDocument();
  });

  it('should display "No document" when documentChecker returns false for Medicaid SPAs', () => {
    renderForm(<WithdrawPackageAction />);
    expect(screen.getByText("No document")).toBeInTheDocument();
  });

  it('should display "No document" when documentChecker returns false for CHIP SPAs', () => {
    renderForm(<WithdrawPackageActionChip />);
    expect(screen.getByText("No document")).toBeInTheDocument();
  });
});
