import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { opensearch } from "shared-types";
import { z } from "zod";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";
import {
  getTimestampInMilliseconds,
  isoDateTime,
  latestIsoDate,
  reportSmartValidationFailure,
  requiredString,
} from "./smartEventHelpers";

const srtMemberSchema = z
  .object({
    srtAssignmentId: requiredString,
    contactId: z.string().nullish(),
    fullName: requiredString,
    email: z.string().nullish(),
    division: z.string().nullish(),
    group: z.string().nullish(),
    isCpoc: z.boolean(),
    isConsultantSme: z.boolean(),
    isActive: z.boolean(),
    assignmentNotes: z.string().nullish(),
  })
  .passthrough();

const assignmentUpdatedSchema = z
  .object({
    authority: z.literal("Medicaid SPA"),
    createdAt: isoDateTime,
    id: requiredString,
    operationType: z.literal("MSP_ASSIGNMENT_UPDATED"),
    origin: z.literal("SMART"),
    spaWaiverId: requiredString,
    srtMember: z.array(srtMemberSchema),
  })
  .passthrough();

type SrtMember = z.infer<typeof srtMemberSchema>;

const normalizedRoster = (
  members: SrtMember[],
): NonNullable<opensearch.main.Document["smartSrtRoster"]> =>
  members
    .map((member) => ({
      srtAssignmentId: member.srtAssignmentId,
      contactId: member.contactId ?? null,
      fullName: member.fullName,
      email: member.email ?? null,
      division: member.division ?? null,
      group: member.group ?? null,
      isCpoc: member.isCpoc,
      isConsultantSme: member.isConsultantSme,
      isActive: member.isActive,
      assignmentNotes: member.assignmentNotes ?? null,
    }))
    .sort((left, right) => left.srtAssignmentId.localeCompare(right.srtAssignmentId));

export const handleMspAssignmentUpdated = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const parsedEvent = assignmentUpdatedSchema.safeParse(context.event);
  if (!parsedEvent.success) {
    await reportSmartValidationFailure(context, parsedEvent.error);
    return;
  }

  const event = parsedEvent.data;
  const roster = normalizedRoster(event.srtMember);
  const assignmentIds = roster.map((member) => member.srtAssignmentId);
  if (new Set(assignmentIds).size !== assignmentIds.length) {
    await reportSmartValidationFailure(
      context,
      new Error("SRT roster contains duplicate assignment IDs"),
    );
    return;
  }

  const activeCpocs = roster.filter((member) => member.isActive && member.isCpoc);
  if (activeCpocs.length > 1) {
    await reportSmartValidationFailure(
      context,
      new Error("SRT roster contains multiple active CPOCs"),
    );
    return;
  }

  // The shared identity path associates an existing package by SPA ID or
  // creates a hidden reservation if SMART sends the assignment first.
  if (!(await persistSmartOnemacEvent(context))) return;

  const { domain, index } = getDomainAndNamespace("main");
  const documentId = event.id.toUpperCase();
  const packageResult = await os.getItem(domain, index, documentId);
  const document = packageResult?._source;
  if (!document || document.deleted === true || document.authority !== event.authority) {
    await reportSmartValidationFailure(
      context,
      new Error("assignment update requires a non-deleted package with matching authority"),
    );
    return;
  }

  const incomingTimestamp = Date.parse(event.createdAt);
  const storedTimestamp = getTimestampInMilliseconds(document.smartAssignmentChangedAt);
  if (storedTimestamp !== undefined && storedTimestamp > incomingTimestamp) {
    console.info(
      JSON.stringify({
        message: "Skipping stale SMART assignment update",
        packageId: documentId,
        eventTimestamp: incomingTimestamp,
        latestTimestamp: storedTimestamp,
      }),
    );
    return;
  }
  if (storedTimestamp === incomingTimestamp) {
    if (JSON.stringify(document.smartSrtRoster) !== JSON.stringify(roster)) {
      await reportSmartValidationFailure(
        context,
        new Error("SMART assignment conflicts with an event at the same createdAt timestamp"),
      );
    }
    return;
  }

  const activeCpoc = activeCpocs[0];
  const changedAt = new Date(event.createdAt).toISOString();
  await os.updateItem(domain, index, documentId, {
    smartAssignmentChangedAt: changedAt,
    smartSrtRoster: roster,
    leadAnalystName: activeCpoc?.fullName ?? null,
    leadAnalystEmail: activeCpoc?.email ?? null,
    // SMART's contact ID is not a legacy SEATool officer ID.
    leadAnalystOfficerId: null,
    smartCpocContactId: activeCpoc?.contactId ?? null,
    reviewTeam: roster
      .filter((member) => member.isActive)
      .map((member) => ({ name: member.fullName, email: member.email ?? "" })),
    makoChangedDate: latestIsoDate(document.makoChangedDate, changedAt),
    changedDate: latestIsoDate(document.changedDate, changedAt),
    operationType: event.operationType,
  });
};
