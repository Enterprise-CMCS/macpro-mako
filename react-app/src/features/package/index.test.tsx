import { UseQueryResult } from "@tanstack/react-query";
import { ADMIN_ITEM_ID, mockUseGetUser } from "mocks";
import { describe, expect, it, vi } from "vitest";

import * as itemApi from "@/api/useGetItem";
import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderFormWithPackageSectionAsync } from "@/utils/test-helpers";

import { DetailsContent, packageDetailsLoader } from ".";

describe("package details", () => {
  it("makes a package", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });
    const { asFragment } = await renderFormWithPackageSectionAsync(
      <DetailsContent id={ADMIN_ITEM_ID} />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("requests draft-first package details when preferDraft is enabled", async () => {
    const useGetItemSpy = vi.spyOn(itemApi, "useGetItem");

    vi.spyOn(api, "useGetUser").mockImplementation(() => {
      const response = mockUseGetUser();
      return response as UseQueryResult<OneMacUser, unknown>;
    });

    await renderFormWithPackageSectionAsync(<DetailsContent id={ADMIN_ITEM_ID} preferDraft />);

    expect(useGetItemSpy).toHaveBeenCalledWith(
      ADMIN_ITEM_ID,
      undefined,
      expect.objectContaining({
        includeDraft: true,
        preferDraft: true,
      }),
    );
  });

  it("passes preferDraft to the loader request when present in the URL", async () => {
    const getItemSpy = vi.spyOn(itemApi, "getItem");

    await packageDetailsLoader({
      params: {
        id: ADMIN_ITEM_ID,
        authority: "Medicaid SPA",
      },
      request: new Request(
        `http://localhost/details/Medicaid%20SPA/${encodeURIComponent(ADMIN_ITEM_ID)}?preferDraft=true`,
      ),
      context: undefined as any,
    } as any);

    expect(getItemSpy).toHaveBeenCalledWith(ADMIN_ITEM_ID, {
      includeDraft: true,
      preferDraft: true,
    });
  });
});
