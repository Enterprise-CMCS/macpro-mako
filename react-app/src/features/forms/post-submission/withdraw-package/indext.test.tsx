import { CAPITATED_AMEND_ITEM_ID } from "mocks";
import { describe, expect, it, vi } from "vitest";

import { WithdrawPackageActionWaiver } from ".";

import { renderFormAsync } from "@/utils/test-helpers/renderForm";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ authority: "1915(c)", id: CAPITATED_AMEND_ITEM_ID }),
}));
describe("WithdrawPackageAction components", () => {
  it("renders WithdrawPackageActionWaiver correctly", async () => {
    const container = renderFormAsync(<WithdrawPackageActionWaiver />);

    expect(await container).toMatchSnapshot();
  });
});
