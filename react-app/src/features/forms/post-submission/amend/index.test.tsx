import { render, screen } from "@testing-library/react";
import { Amendment } from "../amend";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetItem, useGetUser } from "@/api";

const TestWrapper = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/amend"]}>
        <Routes>
          <Route path="/dashboard" element={<h1>dashboard test</h1>} />
          <Route path="/amend" element={<Amendment />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

vi.mock("@/api", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    useGetUser: vi.fn(),
    useGetItem: vi.fn(),
  };
});

describe("Amendment component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders CapitatedAmendmentForm when changelog contains capitated-initial", async () => {
    (useGetUser as vi.Mock).mockImplementation(() => {
      return {
        data: {
          user: {
            ["custom:cms-roles"]: "onemac-micro-statesubmitter",
          },
        },
      };
    });
    (useGetItem as vi.Mock).mockImplementation(() => {
      return {
        data: {
          _source: {
            changelog: [{ _source: { event: "capitated-initial" } }],
          },
        },
      };
    });

    render(<TestWrapper />);

    expect(
      screen.getByRole("heading", {
        name: "1915(b) Comprehensive (Capitated) Waiver Amendment Details",
      }),
    ).toBeInTheDocument();
  });

  it("renders CapitatedAmendmentForm when changelog contains capitated-initial", async () => {
    (useGetUser as vi.Mock).mockImplementation(() => {
      return {
        data: {
          user: {
            ["custom:cms-roles"]: "onemac-micro-statesubmitter",
          },
        },
      };
    });
    (useGetItem as vi.Mock).mockImplementation(() => {
      return {
        data: {
          _source: {
            changelog: [{ _source: { event: "contracting-initial" } }],
          },
        },
      };
    });

    render(<TestWrapper />);

    expect(
      screen.getByRole("heading", {
        name: "1915(b)(4) FFS Selective Contracting Waiver Amendment Details",
      }),
    ).toBeInTheDocument();
  });

  it("renders CapitatedAmendmentForm when changelog contains capitated-initial", async () => {
    (useGetUser as vi.Mock).mockImplementation(() => {
      return {
        data: {
          user: {
            ["custom:cms-roles"]: "onemac-micro-statesubmitter",
          },
        },
      };
    });
    (useGetItem as vi.Mock).mockImplementation(() => {
      return {
        data: {
          _source: {
            changelog: [],
          },
        },
      };
    });

    render(<TestWrapper />);

    expect(
      screen.getByRole("heading", {
        name: "dashboard test",
      }),
    ).toBeInTheDocument();
  });
});
