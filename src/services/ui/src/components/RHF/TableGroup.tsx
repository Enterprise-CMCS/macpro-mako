import { Fragment, useEffect } from "react";
import { FieldValues, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import { RHFSlotProps, TableGroupProps } from "shared-types";
import { Button, FormControl, FormField } from "../Inputs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../Table";
import { slotInitializer } from "./utils";
import { UnwrappedFormSlot } from "./Slot";

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
      <TableCell>
        {props.scalable && (
          <Trash2
            className="cursor-pointer stroke-primary"
            onClick={props.onTrashClick}
          />
        )}
      </TableCell>
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
      name={name as never}
      control={props.control}
      {...(SLOT.rules && { rules: SLOT.rules })}
      render={({ field }) => {
        useEffect(() => {
          return () => {
            props.control.unregister(field.name);
          };
        }, []);
        return (
          <FormControl>
            <UnwrappedFormSlot
              control={props.control}
              field={field}
              {...SLOT}
              props={{ className: "border-slate-300", ...SLOT?.props } as any}
              name={name}
            />
          </FormControl>
        );
      }}
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
    <div className="flex flex-col gap-4 w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {props.fields.map((v) => {
              return (
                <TableHead key={`tableHeader.${v.label}`}>{v.label}</TableHead>
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
        <div className="flex items-center mt-2 self-end">
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
    </div>
  );
};
