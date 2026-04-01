import { UseQueryResult } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import {
  ADMIN_CHANGE_ITEM,
  ADMIN_ITEM_ID,
  helpDeskUser,
  mockUseGetUser,
  setMockUsername,
} from "mocks";
import { SEATOOL_STATUS } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as rootApi from "@/api";
import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient, renderWithQueryClientAndMemoryRouter } from "@/utils/test-helpers";

import { DetailsContent, packageDetailsLoader } from ".";

const itemExistsSpy = vi.spyOn(rootApi, "itemExists");
const useGetPackageActionsSpy = vi.spyOn(rootApi, "useGetPackageActions");
const useRootGetUserSpy = vi.spyOn(rootApi, "useGetUser");
const useGetItemSpy = vi.spyOn(rootApi, "useGetItem");

const makeMockUserResult = () => {
  const response = mockUseGetUser();
  return response as UseQueryResult<OneMacUser, unknown>;
};

describe("package details", () => {
  beforeEach(() => {
    itemExistsSpy.mockResolvedValue(false);
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

  it("redirects to dashboard when a preferred draft refetch returns not found while stale data is still cached", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    useGetItemSpy.mockReturnValue({
      data: ADMIN_CHANGE_ITEM,
      isLoading: false,
      error: {
        response: {
          data: {
            message: "No record found for the given id",
          },
        },
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

  it("shows the locked-draft alert on package details when a matching SEA package exists", async () => {
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    itemExistsSpy.mockResolvedValue(true);
    useGetItemSpy.mockReturnValue({
      data: {
        _id: ADMIN_ITEM_ID,
        found: true,
        _source: {
          id: ADMIN_ITEM_ID,
          authority: "Medicaid SPA",
          state: "MD",
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          stateStatus: "Draft",
          cmsStatus: "Draft",
          changedDate: "2026-03-20T00:00:00.000Z",
          makoChangedDate: "2026-03-20T00:00:00.000Z",
          statusDate: "2026-03-20T00:00:00.000Z",
          origin: "OneMAC",
          submitterName: "State Submitter",
          submitterEmail: "submitter@example.com",
          changelog: [],
          draft: {
            savedAt: "2026-03-20T00:00:00.000Z",
            draftOwnerEmail: "submitter@example.com",
            draftOwnerName: "State Submitter",
            data: { id: ADMIN_ITEM_ID },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithQueryClient(<DetailsContent id={ADMIN_ITEM_ID} preferDraft />);

    expect(await screen.findByText("This package is locked")).toBeInTheDocument();
    expect(
      screen.getByText(
        `A package with ID ${ADMIN_ITEM_ID} has already been submitted to CMS. This draft can no longer be saved or submitted in OneMAC. Delete this draft if you no longer need it.`,
      ),
    ).toBeInTheDocument();
  });

  it("shows the locked-draft alert to helpdesk users on package details", async () => {
    await setMockUsername(helpDeskUser);
    vi.spyOn(api, "useGetUser").mockImplementation(() => makeMockUserResult());
    itemExistsSpy.mockResolvedValue(true);
    useGetItemSpy.mockReturnValue({
      data: {
        _id: ADMIN_ITEM_ID,
        found: true,
        _source: {
          id: ADMIN_ITEM_ID,
          authority: "Medicaid SPA",
          state: "MD",
          seatoolStatus: SEATOOL_STATUS.DRAFT,
          stateStatus: "Draft",
          cmsStatus: "Draft",
          changedDate: "2026-03-20T00:00:00.000Z",
          makoChangedDate: "2026-03-20T00:00:00.000Z",
          statusDate: "2026-03-20T00:00:00.000Z",
          origin: "OneMAC",
          submitterName: "State Submitter",
          submitterEmail: "submitter@example.com",
          changelog: [],
          draft: {
            savedAt: "2026-03-20T00:00:00.000Z",
            draftOwnerEmail: "submitter@example.com",
            draftOwnerName: "State Submitter",
            data: { id: ADMIN_ITEM_ID },
          },
        },
      },
      isLoading: false,
      error: null,
    } as any);

    renderWithQueryClient(<DetailsContent id={ADMIN_ITEM_ID} preferDraft />);

    expect(await screen.findByText("This package is locked")).toBeInTheDocument();
    expect(
      screen.getByText(
        `A package with ID ${ADMIN_ITEM_ID} has already been submitted to CMS. This draft can no longer be saved or submitted in OneMAC. Delete this draft if you no longer need it.`,
      ),
    ).toBeInTheDocument();
  });
});
