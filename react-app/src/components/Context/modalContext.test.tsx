import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { PropsWithChildren, useEffect } from "react";
import {
  useModalContext,
  ModalProvider,
} from "@/components/Context/modalContext";
import { MemoryRouter } from "react-router-dom";

const wrapper = ({ children }: PropsWithChildren) => (
  <MemoryRouter>
    <ModalProvider>{children}</ModalProvider>
  </MemoryRouter>
);

describe("useAlertContext", () => {
  test("hook provides content values and setter", () => {
    const ctx = renderHook(useModalContext, { wrapper });
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
  test("hook provides switch for showing the modal, defaults to off", () => {
    const ctx = renderHook(useModalContext, { wrapper });
    expect(ctx.result.current.modalOpen).toBe(false);
    act(() => ctx.result.current.setModalOpen(true));
    expect(ctx.result.current.modalOpen).toBe(true);
  });
  test("hook provides onAccept action property and setter", () => {
    const ctx = renderHook(useModalContext, { wrapper });
    const action = vi.fn(() => console.log("test"));
    expect(ctx.result.current.onAccept).toBe(void {});
    act(() => ctx.result.current.setOnAccept(() => action));
    act(() => ctx.result.current.onAccept());
    expect(action).toHaveBeenCalledOnce();
  });
});

describe("ModalProvider", () => {
  test("accept button is operational", () => {
    const action = vi.fn(() => console.log("test"));
    const TestChild = () => {
      const modal = useModalContext();
      useEffect(() => {
        modal.setContent({
          header: "Test header",
          body: "Test body",
          acceptButtonText: "Accept",
          cancelButtonText: "Cancel",
        });
        modal.setOnAccept(() => action);
        modal.setModalOpen(true);
      }, []);
      return <h1>test</h1>;
    };
    render(<TestChild />, { wrapper });
    const accept = screen.getByText("Accept");
    accept.click();
    expect(action).toHaveBeenCalledOnce();
  });
});
