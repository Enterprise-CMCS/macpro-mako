import { waitForElementToBeRemoved } from "@testing-library/react";
import React, { ReactElement } from "react";
import items from "mocks/data/items";
import { Authority } from "shared-types";
import { renderWithQueryClient, renderWithQueryClientAndMemoryRouter } from "./render";

export const renderFormAsync = async (form: ReactElement) => {
  const container = await renderWithQueryClient(form);

  // wait for loading
  if (container.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => container.queryAllByLabelText("three-dots-loading"));
  }

  return container;
};

export const renderFormWithPackageSectionAsync = async (
  form: ReactElement,
  id: string,
  authority?: string,
) => {
  const routes = [
    {
      path: "/dashboard",
      element: <h1>dashboard test</h1>,
    },
    {
      path: "/test/:id/:authority",
      element: form,
    },
  ];
  const routeOptions = {
    initialEntries: [
      `/test/${id}/${(authority || items[id]?._source?.authority || "Medicaid SPA") as Authority}`,
    ],
  };

  const container = await renderWithQueryClientAndMemoryRouter(form, routes, routeOptions);

  // wait for loading
  if (container.queryAllByLabelText("three-dots-loading")?.length > 0) {
    await waitForElementToBeRemoved(() => container.queryAllByLabelText("three-dots-loading"));
  }

  return container;
};
