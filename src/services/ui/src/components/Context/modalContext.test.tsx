import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { PropsWithChildren, useEffect } from "react";
import {
  useModalContext,
  ModalProvider,
} from "@/components/Context/modalContext";

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter>
    <ModalProvider>{children}</ModalProvider>
  </MemoryRouter>
);

describe("useAlertContext", () => {
  test("hook provides content values and setter", () => {
    const ctx = renderHook(useModalContext, { wrapper });
  });
  test("hook provides switch for showing the banner, defaults to off", () => {
    const ctx = renderHook(useModalContext, { wrapper });
  });
  test("hook provides route-specific display criteria and setter", () => {
    const ctx = renderHook(useModalContext, { wrapper });
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
