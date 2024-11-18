import { render, screen } from "@testing-library/react";
import { Amendment } from "../amend";
import { describe, expect, test, vi, Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetItem } from "@/api";

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
    useGetUser: vi.fn().mockImplementation(() => {
      return { data: { user: { ["custom:cms-roles"]: "onemac-micro-statesubmitter" } } };
    }),
    useGetItem: vi.fn(),
  };
});

describe("POST SUBMISSION AMENDMENT COMPONENT", () => {
  test("RENDERS CAPITATED FORM WHEN CHANGELOG CONTAINS CAPITATED-INITIAL EVENT", async () => {
    (useGetItem as Mock).mockImplementation(() => {
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

  test("RENDERS CONTRACTING FORM WHEN CHANGELOG CONTAINS CONTRACTING-INITIAL EVENT", async () => {
    (useGetItem as Mock).mockImplementation(() => {
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

  test("RENDERS DASHBOARD WHEN CHANGELOG DOESN'T CONTAIN A RELEVANT EVENT", async () => {
    (useGetItem as Mock).mockImplementation(() => {
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
