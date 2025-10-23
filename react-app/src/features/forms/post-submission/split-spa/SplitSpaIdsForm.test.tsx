import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { SplitSpaIdsForm } from "./SplitSpaIdsForm";

const SPA_ID = "MD-25-0009";

const WrappedSplitSpaIdsForm = ({ spaId, splitCount }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <form>
        <SplitSpaIdsForm control={methods.control} splitCount={splitCount} spaId={spaId} />
      </form>
    </FormProvider>
  );
};

describe("SplitSpaIdsForm", () => {
  it("should render nothing if the spaId is undefined", () => {
    // @ts-ignore intentionally missing split count
    const { container } = render(<WrappedSplitSpaIdsForm splitCount={3} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it("should render nothing if the splitCount is undefined", () => {
    // @ts-ignore intentionally missing split count
    const { container } = render(<WrappedSplitSpaIdsForm spaId={SPA_ID} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it("should render nothing if the splitCount is less than 2", () => {
    const { container } = render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={1} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it("should render nothing if the splitCount is greater than 8", () => {
    const { container } = render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={9} />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <form />
      </div>
    `);
  });

  it("should render the form with a base SPA and an editable SPA Id, if the split count is 2", () => {
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={2} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.queryByTestId(`3. ${SPA_ID}-B`)).toBeNull();
    expect(screen.queryByTestId(`4. ${SPA_ID}-C`)).toBeNull();
    expect(screen.queryByTestId(`5. ${SPA_ID}-D`)).toBeNull();
    expect(screen.queryByTestId(`6. ${SPA_ID}-E`)).toBeNull();
    expect(screen.queryByTestId(`7. ${SPA_ID}-F`)).toBeNull();
    expect(screen.queryByTestId(`8. ${SPA_ID}-G`)).toBeNull();
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toEqual(1);
  });

  it("should render the form with a base SPA and an editable SPA Id, if the split count is 3", () => {
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={3} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.queryByTestId(`4. ${SPA_ID}-C`)).toBeNull();
    expect(screen.queryByTestId(`5. ${SPA_ID}-D`)).toBeNull();
    expect(screen.queryByTestId(`6. ${SPA_ID}-E`)).toBeNull();
    expect(screen.queryByTestId(`7. ${SPA_ID}-F`)).toBeNull();
    expect(screen.queryByTestId(`8. ${SPA_ID}-G`)).toBeNull();
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toEqual(2);
  });

  it("should render the form with a base SPA and an editable SPA Id, if the split count is 8", () => {
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={8} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();
    expect(screen.getByTestId(`5. ${SPA_ID}-D`)).toBeInTheDocument();
    expect(screen.getByTestId(`6. ${SPA_ID}-E`)).toBeInTheDocument();
    expect(screen.getByTestId(`7. ${SPA_ID}-F`)).toBeInTheDocument();
    expect(screen.getByTestId(`8. ${SPA_ID}-G`)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toEqual(7);
  });

  it("should handle clicking the edit button for one of the suffices", async () => {
    const user = userEvent.setup();
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={4} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();

    const spaId3 = screen.getByTestId(`3. ${SPA_ID}-B`);
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    expect(within(spaId3).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(spaId3).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(within(spaId3).queryByRole("button", { name: "Edit" })).toBeNull();

    expect(screen.getAllByRole("button", { name: "Save" }).length).toEqual(1);
    expect(screen.getAllByRole("button", { name: "Cancel" }).length).toEqual(1);
    expect(screen.getAllByRole("button", { name: "Edit" }).length).toEqual(2);
  });

  it("should handle editing one of the suffices", async () => {
    const user = userEvent.setup();
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={4} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();

    const spaId3 = screen.getByTestId(`3. ${SPA_ID}-B`);
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    const input = within(spaId3).getByLabelText(`${SPA_ID} split number 3`);
    await user.clear(input);
    await user.type(input, "Z");
    await user.click(within(spaId3).getByRole("button", { name: "Save" }));

    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-Z`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();
  });

  it("should handle canceling the edit of one of the suffices", async () => {
    const user = userEvent.setup();
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={4} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();

    const spaId3 = screen.getByTestId(`3. ${SPA_ID}-B`);
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    const input = within(spaId3).getByLabelText(`${SPA_ID} split number 3`);
    await user.clear(input);
    await user.type(input, "Z");
    await user.click(within(spaId3).getByRole("button", { name: "Cancel" }));

    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();
  });

  it("should handle editing all of the suffices at once", async () => {
    const user = userEvent.setup();
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={4} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();

    const spaId2 = screen.getByTestId(`2. ${SPA_ID}-A`);
    const spaId3 = screen.getByTestId(`3. ${SPA_ID}-B`);
    const spaId4 = screen.getByTestId(`4. ${SPA_ID}-C`);

    await user.click(within(spaId2).getByRole("button", { name: "Edit" }));
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    await user.click(within(spaId4).getByRole("button", { name: "Edit" }));

    await user.type(within(spaId2).getByLabelText(`${SPA_ID} split number 2`), "pple");
    await user.type(within(spaId3).getByLabelText(`${SPA_ID} split number 3`), "anana");
    await user.type(within(spaId4).getByLabelText(`${SPA_ID} split number 4`), "arrot");

    await user.click(within(spaId2).getByRole("button", { name: "Save" }));
    await user.click(within(spaId3).getByRole("button", { name: "Save" }));
    await user.click(within(spaId4).getByRole("button", { name: "Save" }));

    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-Apple`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-Banana`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-Carrot`)).toBeInTheDocument();
  });

  it("should handle editing all of the suffices at once and saving one and canceling the others", async () => {
    const user = userEvent.setup();
    render(<WrappedSplitSpaIdsForm spaId={SPA_ID} splitCount={4} />);
    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-B`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();

    const spaId2 = screen.getByTestId(`2. ${SPA_ID}-A`);
    const spaId3 = screen.getByTestId(`3. ${SPA_ID}-B`);
    const spaId4 = screen.getByTestId(`4. ${SPA_ID}-C`);

    await user.click(within(spaId2).getByRole("button", { name: "Edit" }));
    await user.click(within(spaId3).getByRole("button", { name: "Edit" }));
    await user.click(within(spaId4).getByRole("button", { name: "Edit" }));

    await user.type(within(spaId2).getByLabelText(`${SPA_ID} split number 2`), "pple");
    await user.type(within(spaId3).getByLabelText(`${SPA_ID} split number 3`), "anana");
    await user.type(within(spaId4).getByLabelText(`${SPA_ID} split number 4`), "arrot");

    await user.click(within(spaId2).getByRole("button", { name: "Cancel" }));
    await user.click(within(spaId3).getByRole("button", { name: "Save" }));
    await user.click(within(spaId4).getByRole("button", { name: "Cancel" }));

    expect(screen.getByText(/SPAs after split/)).toBeInTheDocument();
    expect(screen.getByTestId(`1. ${SPA_ID} (Base SPA)`)).toBeInTheDocument();
    expect(screen.getByTestId(`2. ${SPA_ID}-A`)).toBeInTheDocument();
    expect(screen.getByTestId(`3. ${SPA_ID}-Banana`)).toBeInTheDocument();
    expect(screen.getByTestId(`4. ${SPA_ID}-C`)).toBeInTheDocument();
  });
});
