import { Fragment, useEffect } from "react";
import { FieldValues, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { RHFSlotProps, TableGroupProps } from "shared-types";
import { Button, FormField } from "../Inputs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../Table";
import { slotInitializer } from "./utils";
import { RHFSlot } from "./Slot";
import { cn } from "@/lib";

const FieldRow = <TFields extends FieldValues>(
  props: { onTrashClick: () => void } & TableGroupProps<TFields>
) => {
  return (
    <TableRow>
      {props.fields.map((SLOT, i) => {
        const name = props.name + SLOT.name;
        return (
          <TableCell key={`${props.name}cell.${i}`}>
            <FieldCell {...{ ...props, SLOT, name: name as never }} />
          </TableCell>
        );
      })}
      {props.scalable && (
        <TableCell className="p-0 pr-2 py-4 w-14">
          <Button
            onClick={props.onTrashClick}
            variant={"ghost"}
            className="hover:text-destructive text-primary"
          >
            <Trash2 />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
};

const FieldCell = <TFields extends FieldValues>({
  name,
  SLOT,
  ...props
}: { SLOT: RHFSlotProps } & TableGroupProps<TFields>) => {
  return (
    <FormField
      key={name}
      control={props.control}
      name={name as never}
      {...(SLOT.rules && { rules: SLOT.rules })}
      render={RHFSlot({
        ...SLOT,
        control: props.control,
        name: name,
        removeFormDecoration: true,
        formItemStyling: "gap-0 py-0",
        props: {
          ...SLOT.props,
          className: cn("border-slate-300", (SLOT?.props as any)?.classname),
        } as any,
      })}
    />
  );
};

const TableError = (props: { fieldName: string; row: number }) => {
  const { getFieldState, formState } = useFormContext();
  const { error } = getFieldState(props.fieldName, formState);
  const body =
    error && !Array.isArray(error)
      ? String(error?.message) + ` - Row ${props.row}`
      : undefined;

  if (!body) return null;

  return (
    <p
      id={`${props.fieldName}-form-item-message`}
      key={`${props.fieldName}-form-item-message`}
      className={"text-[0.8rem] font-medium text-destructive"}
    >
      {body}
    </p>
  );
};

export const TableGroup = <TFields extends FieldValues>({
  initNumRows = 1,
  scalable = true,
  ...props
}: TableGroupProps<TFields>) => {
  const fieldArr = useFieldArray({
    control: props.control,
    name: props.name,
    shouldUnregister: true,
  });

  const onAppend = () => {
    fieldArr.append(props.fields.reduce(slotInitializer, {}) as never);
    console.log("fieldArr", fieldArr);
  };

  useEffect(() => {
    if (fieldArr.fields.length) return;

    do {
      fieldArr.append(props.fields.reduce(slotInitializer, {}) as never);
    } while (fieldArr.fields.length === initNumRows);
  }, []);

  return (
    <>
      <Table className="table-auto">
        <TableHeader>
          <TableRow>
            {props.fields.map((v) => {
              return (
                <TableHead key={`tableHeader.${v.label}`}>
                  <div className={cn("max-w-xs", v.tbColumnStyle)}>
                    {v.label}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fieldArr.fields.map((v, i) => {
            const fieldName = `${props.name}.${i}.`;
            return (
              <FieldRow
                key={v.id}
                {...props}
                name={fieldName as never}
                scalable={i !== 0 && scalable}
                onTrashClick={() => {
                  fieldArr.remove(i);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
      {scalable && (
        <div className="w-full items-end mt-2 flex justify-end my-2">
          <Button type="button" size="sm" onClick={onAppend} variant="default">
            <Plus className="h-5 w-5 mr-2" />
            {"Add Row"}
          </Button>
        </div>
      )}
      {props.fields.map((field) => {
        return (
          <Fragment key={"error-wrapper-" + field.name}>
            {fieldArr.fields.map((_v, j) => {
              const fieldName = `${props.name}.${j}.${field.name}`;
              return (
                <TableError fieldName={fieldName} key={fieldName} row={j + 1} />
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
};
