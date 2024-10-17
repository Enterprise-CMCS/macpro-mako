import { screen } from "@testing-library/react";
import { vi, describe, test, expect, beforeAll } from "vitest";
import { WithdrawRaiForm } from "@/features/forms/post-submission/withdraw-rai";
import { renderForm } from "@/utils/test-helpers/renderForm";

let container: HTMLElement;

describe("Withdraw RAI for Medicaid SPAs", () => {
  beforeAll(() => {
    const { container: renderedContainer } = renderForm(<WithdrawRaiForm />);
    container = renderedContainer;
  });

  test('should display "No document" when documentChecker returns false', () => {
    vi.mock("@/components/ActionForm", () => ({
      ActionForm: ({ documentPollerArgs }: any) => {
        // extract documentChecker from documentPollerArgs prop
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
