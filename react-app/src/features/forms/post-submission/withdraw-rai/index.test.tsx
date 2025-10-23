import { screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { WithdrawRaiForm } from "@/features/forms/post-submission/withdraw-rai";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers/renderForm";

describe("Withdraw RAI for Medicaid SPAs", () => {
  beforeAll(async () => {
    await renderFormWithPackageSectionAsync(<WithdrawRaiForm />);
  });

  // test documentChecker function from ActionForm in isolation
  it('should display "No document" when documentChecker returns false', () => {
    vi.mock("@/components/ActionForm", () => ({
      ActionForm: ({ documentPollerArgs }: any) => {
        const { documentChecker } = documentPollerArgs;
        if (documentChecker({ recordExists: false })) {
          return <div>Document exists</div>;
        }
        return <div>No document</div>;
      },
    }));
    expect(screen.getByText("No document")).toBeInTheDocument();
  });
});
