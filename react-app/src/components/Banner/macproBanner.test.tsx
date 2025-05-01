import { render, screen } from "@testing-library/react";
import { isCmsUser, isStateUser } from "shared-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useGetUser } from "@/api";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import TopBanner from "./macproBanner";

// Mock the user as a state user
vi.mock("@/api", () => ({
  useGetUser: () => ({
    data: {
      user: {
        "custom:ismemberof": "ONEMAC_USER",
        "custom:cms-roles": "", // Not a CMS role
      },
    },
  }),
}));

// Mock modules
vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(),
}));

vi.mock("@/api", () => ({
  useGetUser: vi.fn(),
}));

vi.mock("shared-utils", () => ({
  isCmsUser: vi.fn(),
  isStateUser: vi.fn(),
}));

describe("TopBanner", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders CMS banner when CMS user and CMS flag are true", () => {
    (useGetUser as any).mockReturnValue({ data: { user: {} } });
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "CMS_HOMEPAGE_FLAG");
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "STATE_HOMEPAGE_FLAG");
    (isCmsUser as any).mockReturnValue(true);
    (isStateUser as any).mockReturnValue(false);

    render(<TopBanner />);

    expect(screen.getByText("SEA TOOL")).toBeInTheDocument();
    expect(screen.getByText("eRegs")).toBeInTheDocument();
    expect(screen.queryByText("WMS")).toBeInTheDocument();
  });

  it("renders State banner when State user and State flag are true", () => {
    (useGetUser as any).mockReturnValue({ data: { user: {} } });
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "CMS_HOMEPAGE_FLAG");
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "STATE_HOMEPAGE_FLAG");
    (isCmsUser as any).mockReturnValue(false);
    (isStateUser as any).mockReturnValue(true);

    render(<TopBanner />);

    expect(screen.getByText("MACPro")).toBeInTheDocument();
    expect(screen.getByText("WMS")).toBeInTheDocument();
    expect(screen.getByText("MMDL")).toBeInTheDocument();
    expect(screen.queryByText("SEA TOOL")).not.toBeInTheDocument();
  });

  it("renders nothing when neither flag is on", () => {
    (useGetUser as any).mockReturnValue({ data: { user: {} } });
    (useFeatureFlag as any).mockReturnValue(false);
    (isCmsUser as any).mockReturnValue(false);
    (isStateUser as any).mockReturnValue(false);

    const { container } = render(<TopBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
