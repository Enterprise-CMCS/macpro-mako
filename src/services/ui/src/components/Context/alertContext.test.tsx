import { act, render, renderHook, screen } from "@testing-library/react";
import {
  AlertProvider,
  useAlertContext,
} from "@/components/Context/alertContext";
import { describe, test, expect } from "vitest";
import { PropsWithChildren, useEffect } from "react";
import { MemoryRouter } from "react-router-dom";

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter>
    <AlertProvider>{children}</AlertProvider>
  </MemoryRouter>
);

describe("useAlertContext", () => {
  test("hook provides content values and setter", () => {
    const ctx = renderHook(useAlertContext, { wrapper });
    expect(ctx.result.current.content).toStrictEqual({
      header: "No header given",
      body: "No body given",
    });
    act(() =>
      ctx.result.current.setContent({
        header: "New header",
        body: "New body",
      })
    );
    expect(ctx.result.current.content).toStrictEqual({
      header: "New header",
      body: "New body",
    });
  });
  test("hook provides switch for showing the banner, defaults to off", () => {
    const ctx = renderHook(useAlertContext, { wrapper });
    expect(ctx.result.current.bannerShow).toBe(false);
    act(() => ctx.result.current.setBannerShow(true));
    expect(ctx.result.current.bannerShow).toBe(true);
  });
  test("hook provides route-specific display criteria and setter", () => {
    const ctx = renderHook(useAlertContext, { wrapper });
    expect(ctx.result.current.bannerDisplayOn).toBe("/");
    act(() => ctx.result.current.setBannerDisplayOn("/dashboard"));
    expect(ctx.result.current.bannerDisplayOn).toBe("/dashboard");
  });
});

const TestChild = () => {
  const alert = useAlertContext();
  useEffect(() => {
    alert.setBannerShow(true);
  }, []);
  return <h1>test</h1>;
};
describe("AlertProvider", () => {
  test("renders alert component above children", () => {
    render(<TestChild />, { wrapper });
    const child = screen.getByText("test");
    const alert = screen.getByText("No header given");
    expect(child.compareDocumentPosition(alert)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});
