import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

export const renderForm = (form: ReactElement) =>
  render(form, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
