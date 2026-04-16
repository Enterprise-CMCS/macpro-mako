import { UseQueryResult } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { ADMIN_CHANGE_ITEM, ADMIN_ITEM_ID, mockUseGetUser } from "mocks";
import { SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as rootApi from "@/api";
import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient, renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { DetailsContent, packageDetailsLoader } from ".";

const useGetPackageActionsSpy = vi.spyOn(rootApi, "useGetPackageActions");
const useRootGetUserSpy = vi.spyOn(rootApi, "useGetUser");
const useGetItemSpy = vi.spyOn(rootApi, "useGetItem");

const makeMockUserResult = () => {
  const response = mockUseGetUser();
  return response as UseQueryResult<OneMacUser, unknown>;
};

describe("package details", () => {
  beforeEach(() => {
    useGetPackageActionsSpy.mockReturnValue({
      data: { actions: [] },
      isLoading: false,
      error: null,
    } as any);
    useRootGetUserSpy.mockReturnValue(makeMockUserResult() as any);
    useGetItemSpy.mockReturnValue({
      data: ADMIN_CHANGE_ITEM,
      isLoading: false,
      error: null,
    } as any);
  });

  it("renders package detail sections when the record is loaded", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    useGetItemSpy.mockReturnValue({
      data: {
        ...ADMIN_CHANGE_ITEM,
        _source: {
          ...ADMIN_CHANGE_ITEM._source,
          seatoolStatus: SEATOOL_STATUS.SUBMITTED,
        },
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithQueryClient(<DetailsContent id={ADMIN_ITEM_ID} />);

    expect(await screen.findByRole("heading", { name: "Status" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Package Actions" })).toBeInTheDocument();
    expect(
      screen.getByText("No actions are currently available for this submission."),
    ).toBeInTheDocument();
  });

  it("requests draft-first package details when preferDraft is enabled", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());

    renderWithQueryClient(<DetailsContent id={ADMIN_ITEM_ID} preferDraft />);

    await waitFor(() => {
      expect(useGetItemSpy).toHaveBeenCalledWith(
        ADMIN_ITEM_ID,
        undefined,
        expect.objectContaining({
          includeDraft: true,
          preferDraft: true,
        }),
      );
    });
  });

  it("passes preferDraft to the loader request when present in the URL", async () => {
    const getItemSpy = vi.spyOn(rootApi, "getItem");

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

  it("redirects to dashboard when a preferred draft record no longer exists", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    useGetItemSpy.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    const { router } = renderWithQueryClientAndMemoryRouter(
      <DetailsContent id={ADMIN_ITEM_ID} preferDraft />,
      [
        {
          path: "/details/:authority/:id",
          element: <DetailsContent id={ADMIN_ITEM_ID} preferDraft />,
        },
        {
          path: "/dashboard",
          element: <div>dashboard test</div>,
        },
      ],
      {
        initialEntries: [
          `/details/${encodeURIComponent("Medicaid SPA")}/${encodeURIComponent(ADMIN_ITEM_ID)}?preferDraft=true`,
        ],
      },
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
    expect(screen.getByText("dashboard test")).toBeInTheDocument();
  });

  it("redirects to dashboard when a preferred draft has a query error", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    useGetItemSpy.mockReturnValue({
      data: ADMIN_CHANGE_ITEM,
      isLoading: false,
      error: {
        message: "Request failed with status code 404",
      },
    } as any);

    const { router } = renderWithQueryClientAndMemoryRouter(
      <DetailsContent id={ADMIN_ITEM_ID} preferDraft />,
      [
        {
          path: "/details/:authority/:id",
          element: <DetailsContent id={ADMIN_ITEM_ID} preferDraft />,
        },
        {
          path: "/dashboard",
          element: <div>dashboard test</div>,
        },
      ],
      {
        initialEntries: [
          `/details/${encodeURIComponent("Medicaid SPA")}/${encodeURIComponent(ADMIN_ITEM_ID)}?preferDraft=true`,
        ],
      },
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
    expect(screen.getByText("dashboard test")).toBeInTheDocument();
  });
});
