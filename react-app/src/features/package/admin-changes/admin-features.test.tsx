import { UseQueryResult } from "@tanstack/react-query";
import {
  ATTACHMENT_BUCKET_NAME,
  ADMIN_CHANGE_ITEM,
  mockUseGetUser,
  WITHDRAW_APPK_ITEM,
} from "mocks";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import * as api from "@/api/useGetUser";
import { OneMacUser } from "@/api/useGetUser";
import { renderWithQueryClient } from "@/utils/test-helpers";

import { AdminPackageActivities } from ".";
import * as packageActivityHooks from "../package-activity/hook";

describe("Admin Features test", () => {
  vi.spyOn(api, "useGetUser").mockImplementation(() => {
    const response = mockUseGetUser();
    response.data.isCms = false;
    return response as UseQueryResult<OneMacUser, unknown>;
  });

  it("finds no admin changes", () => {
    renderWithQueryClient(
      <AdminPackageActivities changelog={WITHDRAW_APPK_ITEM._source.changelog} />,
    );

    expect(screen.queryByText(/Administrative Package Changes/)).not.toBeInTheDocument();
  });

  it("finds an admin change admin changes", () => {
    renderWithQueryClient(
      <AdminPackageActivities changelog={ADMIN_CHANGE_ITEM._source.changelog} />,
    );

    expect(screen.getByText("Administrative Package Changes (9)")).toBeInTheDocument();
    expect(screen.getByText("Download all attachments")).toBeInTheDocument();
  });

  it("renders NOSO attachments and downloads them", async () => {
    const onUrl = vi.fn(() => Promise.resolve("http://example.com/noso.pdf"));
    const openSpy = vi.spyOn(window, "open").mockImplementation(vi.fn());

    vi.spyOn(packageActivityHooks, "useAttachmentService").mockImplementation(() => ({
      attachmentErrorMessage: undefined,
      archiveErrorMessage: undefined,
      archiveWarningMessage: undefined,
      loading: false,
      onArchive: vi.fn(),
      onUrl,
      error: null,
    }));

    const user = userEvent.setup();
    renderWithQueryClient(
      <AdminPackageActivities
        changelog={
          [
            {
              _id: "MD-25-0001-0001",
              _source: {
                id: "MD-25-0001-0001",
                packageId: "MD-25-0001",
                event: "NOSO",
                isAdminChange: true,
                timestamp: 1735689600000,
                changeMade: "Package added",
                changeReason: "Imported from legacy",
                attachments: [
                  {
                    bucket: ATTACHMENT_BUCKET_NAME,
                    filename: "cms-179.pdf",
                    key: "cms-179.pdf",
                    title: "CMS-179 Form",
                  },
                ],
              },
            },
          ] as any
        }
      />,
    );

    expect(screen.getByText("cms-179.pdf")).toBeInTheDocument();

    await user.click(screen.getByText("cms-179.pdf"));

    expect(onUrl).toHaveBeenCalledWith({
      bucket: ATTACHMENT_BUCKET_NAME,
      filename: "cms-179.pdf",
      key: "cms-179.pdf",
      title: "CMS-179 Form",
    });
    expect(openSpy).toHaveBeenCalledWith("http://example.com/noso.pdf");
  });
});
