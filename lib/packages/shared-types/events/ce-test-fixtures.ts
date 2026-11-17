import type { CeRecordSubmitted, CeSubsequentDocuments } from "../centra";

export const CE_TIMESTAMP = 1762452000000;
export const CE_PROPOSED_EFFECTIVE_DATE = 1762400000000;

export function ceFile(filename: string, key: string) {
  return {
    filename,
    title: filename,
    bucket: "mako-attachments",
    key,
    uploadDate: CE_TIMESTAMP,
  };
}

export function ceRecordInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "MD-CE-26-001",
    state: "MD",
    hardshipKind: "CE_UNEMPLOYMENT",
    proposedEffectiveDate: CE_PROPOSED_EFFECTIVE_DATE,
    additionalInformation: null,
    attachments: {
      ceTemplate: {
        files: [ceFile("request.pdf", "MD-CE-26-001/ceTemplate/request.pdf")],
      },
      other: {
        files: [ceFile("support.pdf", "MD-CE-26-001/other/support.pdf")],
      },
    },
    submitterName: "Alex Rivera",
    submitterEmail: "alex.rivera@maryland.gov",
    timestamp: CE_TIMESTAMP,
    ...overrides,
  };
}

export function ceSubsequentInput(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "MD-CE-26-001",
    state: "MD",
    hardshipKind: "CE_SADE",
    additionalInformation: "Labor table and declaration added.",
    attachments: {
      ceTemplate: { files: [] },
      other: {
        files: [ceFile("labor-table.xlsx", "MD-CE-26-001/other/labor-table.xlsx")],
      },
    },
    submitterName: "Alex Rivera",
    submitterEmail: "alex.rivera@maryland.gov",
    timestamp: CE_TIMESTAMP,
    ...overrides,
  };
}

export function expectRecordContract(value: CeRecordSubmitted): CeRecordSubmitted {
  return value;
}

export function expectSubsequentContract(value: CeSubsequentDocuments): CeSubsequentDocuments {
  return value;
}
