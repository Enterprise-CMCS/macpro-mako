import { screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeAll } from "vitest";
import { RespondToRaiWaiver } from "@/features/forms/post-submission/respond-to-rai";
import { renderForm } from "@/utils/test-helpers/renderForm";

describe("Respond To RAI Forms", () => {
  beforeAll(() => {
    renderForm(<RespondToRaiWaiver />);
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