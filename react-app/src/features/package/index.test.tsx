import { describe, expect, it, vi } from "vitest";
import { DetailsContent } from ".";
import { INITIAL_RELEASE_APPK_ITEM_ID, mockUseGetUser } from "mocks";
import * as api from "@/api/useGetUser";
import { UseQueryResult } from "@tanstack/react-query";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

describe("package details", () => {
  const renderComponent = () => {
    return renderWithQueryClient(<DetailsContent id={INITIAL_RELEASE_APPK_ITEM_ID} />);
  };

  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });

    const compo = await renderComponent();
    expect(compo).toMatchSnapshot();
  });
});
