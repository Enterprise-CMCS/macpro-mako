import { z } from "zod";

import { requiredString } from "./smartEventHelpers";

export const smartTypeSelectionSchema = z.object({
  typeSelectionId: requiredString,
  type: requiredString,
  subType: requiredString.nullable(),
  isTypeActive: z.boolean(),
  isSubTypeActive: z.boolean(),
});

export type SmartTypeSelection = z.infer<typeof smartTypeSelectionSchema>;

interface SmartTypeSelectionSnapshot {
  typeSelections?: SmartTypeSelection[] | null;
}

const hasOwn = (value: object, field: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, field);

// OneMAC's legacy OpenSearch mapping requires numeric type IDs. SMART's IDs are
// Salesforce strings, while the UI only uses these values as stable list keys.
const numericTypeId = (value: string): number => {
  let hash = 2166136261;
  for (const character of value) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0 || 1;
};

export const getSmartTypeUpdates = (
  event: SmartTypeSelectionSnapshot,
): Record<string, unknown> | undefined => {
  if (!hasOwn(event, "typeSelections") || event.typeSelections == null) return undefined;

  const activeTypes = new Map<string, { SPA_TYPE_ID: number; SPA_TYPE_NAME: string }>();
  const activeSubTypes = new Map<string, { TYPE_ID: number; TYPE_NAME: string }>();
  for (const selection of event.typeSelections) {
    if (selection.isTypeActive && !activeTypes.has(selection.type)) {
      activeTypes.set(selection.type, {
        SPA_TYPE_ID: numericTypeId(selection.type),
        SPA_TYPE_NAME: selection.type,
      });
    }
    // SMART currently sends a type-only selection with subType: null when the
    // user keeps the type but clears all of its subtypes. The accompanying
    // isSubTypeActive flag may still be true, so the missing subtype value is
    // authoritative and must not invalidate the entire event.
    if (selection.isTypeActive && selection.isSubTypeActive && selection.subType !== null) {
      activeSubTypes.set(selection.typeSelectionId, {
        TYPE_ID: numericTypeId(selection.typeSelectionId),
        TYPE_NAME: selection.subType,
      });
    }
  }

  return { types: [...activeTypes.values()], subTypes: [...activeSubTypes.values()] };
};
