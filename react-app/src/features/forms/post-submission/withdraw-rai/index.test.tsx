// import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeAll } from "vitest";
import { WithdrawRaiForm } from "@/features/forms/post-submission/withdraw-rai";
import { useNavigate } from "react-router-dom";
import { renderForm } from "@/utils/test-helpers/renderForm";
// import { documentPoller } from "@/utils/Poller/documentPoller";
// use container globally for tests to use same render and let each test fill out inputs
let container: HTMLElement;

// vi.mock(import("react-router-dom"), async (importOriginal) => {
//   const actual = await importOriginal();
//   return {
//     ...actual,
//     useParams: vi.fn().mockReturnValue({
//       id: "test-id",
//       authority: "Medicaid SPA",
//     }),
//     useNavigate: vi.fn().mockReturnValue({
//       pathname: "/dashboard",
//       search: "tab=spas",
//     }),
//   };
// });
// vi.mock("@/utils/Poller/documentPoller", () => ({
//   documentPoller: vi.fn().mockReturnValue({
//     correctDataStateFound: true,
//     maxAttemptsReached: false,
//   }),
// }));

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
        documentChecker({ recordExists: false });
        if (documentChecker({ recordExists: false })) {
          return <div>Document exists</div>;
        }
        return <div>No document</div>;
      },
    }));
    expect(screen.getByText("No document")).toBeInTheDocument();
  });

  // test("user should be redirected after submitting RAI withdrawal", async () => {
  //   const title = screen.getByText(
  //     /Medicaid SPA Withdraw Formal RAI Response Details/,
  //   );
  //   expect(title).toBeInTheDocument();

  //   const additionalInfo = screen.getByText(
  //     /Explain your need for withdrawal./,
  //   );
  //   userEvent.type(additionalInfo, "example withdraw reason");

  //   const submitBtn = screen.getByTestId("submit-action-form");
  //   await userEvent.click(submitBtn);

  //   const navigateMock = useNavigate();

  //   waitFor(() =>
  //     expect(navigateMock).toBeCalledWith({
  //       pathname: "/dashboard",
  //       search: "tab=spas",
  //     }),
  //   );
  // });
});
