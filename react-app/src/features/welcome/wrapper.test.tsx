import { render, screen } from "@testing-library/react";
import { isCmsUser, isStateUser } from "shared-utils";
import { describe, expect, it, vi } from "vitest";

import { useGetUser } from "@/api";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

import { WelcomeWrapper } from "./wrapper";

// Mock all dependencies
vi.mock("@/features", () => ({
  CMSWelcome: () => <div>CMS Welcome</div>,
  StateWelcome: () => <div>State Welcome</div>,
  Welcome: () => <div>Default Welcome</div>,
}));

vi.mock("@/hooks/useFeatureFlag", () => ({
  useFeatureFlag: vi.fn(),
}));

vi.mock("@/api", () => ({
  useGetUser: vi.fn(),
}));

vi.mock("shared-utils", async () => {
  return {
    isCmsUser: vi.fn(),
    isStateUser: vi.fn(),
  };
});

describe("WelcomeWrapper", () => {
  it("renders CMSWelcome for CMS user with flag", () => {
    (useGetUser as any).mockReturnValue({ data: { user: {} } });
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "CMS_HOMEPAGE_FLAG");
    (isCmsUser as any).mockReturnValue(true);
    (isStateUser as any).mockReturnValue(false);

    render(<WelcomeWrapper />);
    expect(screen.getByText("CMS Welcome")).toBeInTheDocument();
  });

  it("renders StateWelcome for State user with flag", () => {
    (useGetUser as any).mockReturnValue({ data: { user: {} } });
    (useFeatureFlag as any).mockImplementation((flag: string) => flag === "STATE_HOMEPAGE_FLAG");
    (isCmsUser as any).mockReturnValue(false);
    (isStateUser as any).mockReturnValue(true);

    render(<WelcomeWrapper />);
    expect(screen.getByText("State Welcome")).toBeInTheDocument();
  });

  it("renders default Welcome for no user", () => {
    (useGetUser as any).mockReturnValue({ data: null });
    (useFeatureFlag as any).mockReturnValue(false);
    (isCmsUser as any).mockReturnValue(false);
    (isStateUser as any).mockReturnValue(false);

    render(<WelcomeWrapper />);
    expect(screen.getByText("Default Welcome")).toBeInTheDocument();
  });
});
