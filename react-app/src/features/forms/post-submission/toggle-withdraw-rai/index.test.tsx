import { describe, expect, it, vi } from "vitest";

import { WITHDRAW_RAI_ITEM_B } from "mocks";
import { EnableWithdrawRaiForm, DisableWithdrawRaiForm } from ".";
import { renderFormAsync } from "@/utils/test-helpers/renderForm";

vi.mock("react-router", async () => ({
  ...(await vi.importActual<Record<string, unknown>>("react-router")),
  useParams: vi.fn().mockReturnValue({ authority: "1915(b)", id: WITHDRAW_RAI_ITEM_B }),
}));
vi.mock("shared-utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    isCmsUser: vi.fn().mockReturnValue(true),
  };
});

describe("Toggle Withdraw Rai components", () => {
  it("renders disable withdraw rai correctly", async () => {
    const container = renderFormAsync(<EnableWithdrawRaiForm />);

    expect(await container).toMatchSnapshot();
  });
  it("renders disable withdraw rai correctly", async () => {
    const container = renderFormAsync(<DisableWithdrawRaiForm />);

    expect(await container).toMatchSnapshot();
  });
});
