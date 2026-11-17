import { describe, expect, it } from "vitest";

import {
  daysSinceSubmission,
  easternCalendarDate,
  isPastMissingRecordCadence,
  parseSubmissionInstant,
} from "./cadence";

describe("seatool missing-record cadence", () => {
  it("excludes a 2023-08-01 ET submission on 2023-08-04 and includes it on 2023-08-05", () => {
    const submitted = "2023-08-01T12:00:00-04:00";

    expect(isPastMissingRecordCadence(submitted, new Date("2023-08-04T12:00:00-04:00"))).toBe(
      false,
    );
    expect(daysSinceSubmission(submitted, new Date("2023-08-04T12:00:00-04:00"))).toBe(3);
    expect(isPastMissingRecordCadence(submitted, new Date("2023-08-05T00:00:00-04:00"))).toBe(true);
    expect(daysSinceSubmission(submitted, new Date("2023-08-05T08:00:00-04:00"))).toBe(4);
  });

  it("counts America/New_York calendar days instead of 96 elapsed hours", () => {
    const lateSubmit = "2023-08-01T22:00:00-04:00";
    const earlyCheck = new Date("2023-08-05T01:00:00-04:00");

    expect((earlyCheck.getTime() - Date.parse(lateSubmit)) / 3_600_000).toBeLessThan(96);
    expect(isPastMissingRecordCadence(lateSubmit, earlyCheck)).toBe(true);

    const earlySubmit = "2023-08-01T01:00:00-04:00";
    const stillDayThree = new Date("2023-08-04T23:00:00-04:00");
    expect((stillDayThree.getTime() - Date.parse(earlySubmit)) / 3_600_000).toBeGreaterThan(90);
    expect(isPastMissingRecordCadence(earlySubmit, stillDayThree)).toBe(false);
  });

  it("keeps the Eastern calendar date across the spring-forward DST edge", () => {
    const submittedBeforeSpringForward = "2023-03-11T23:30:00-05:00";
    const fourthMorningAfter = new Date("2023-03-15T08:00:00-04:00");

    expect(easternCalendarDate(new Date(submittedBeforeSpringForward))).toEqual({
      year: 2023,
      month: 3,
      day: 11,
    });
    expect(daysSinceSubmission(submittedBeforeSpringForward, fourthMorningAfter)).toBe(4);
    expect(isPastMissingRecordCadence(submittedBeforeSpringForward, fourthMorningAfter)).toBe(true);
    expect(
      isPastMissingRecordCadence(
        submittedBeforeSpringForward,
        new Date("2023-03-14T23:30:00-04:00"),
      ),
    ).toBe(false);
  });

  it("keeps the Eastern calendar date across the fall-back DST edge", () => {
    const submittedBeforeFallBack = "2023-11-04T23:30:00-04:00";
    const fourthMorningAfter = new Date("2023-11-08T08:00:00-05:00");

    expect(easternCalendarDate(new Date(submittedBeforeFallBack))).toEqual({
      year: 2023,
      month: 11,
      day: 4,
    });
    expect(daysSinceSubmission(submittedBeforeFallBack, fourthMorningAfter)).toBe(4);
    expect(isPastMissingRecordCadence(submittedBeforeFallBack, fourthMorningAfter)).toBe(true);
    expect(
      isPastMissingRecordCadence(submittedBeforeFallBack, new Date("2023-11-07T23:30:00-05:00")),
    ).toBe(false);
  });

  it("treats numeric timestamps below 1e12 as seconds", () => {
    const submittedSeconds = 1690876800;
    const now = new Date("2023-08-05T12:00:00-04:00");

    expect(parseSubmissionInstant(submittedSeconds)?.toISOString()).toBe(
      new Date(submittedSeconds * 1000).toISOString(),
    );
    expect(isPastMissingRecordCadence(submittedSeconds, now)).toBe(true);
  });
});
