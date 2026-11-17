import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  attachmentArchiveRebuildTriggerTopics,
  CENTRA_EVENTS_TOPIC,
  centraCreateTopic,
  centraEventsTopicName,
  centraReindexTopics,
} from "./centra-topics";

const stackDir = dirname(fileURLToPath(import.meta.url));

describe("centra kafka topics", () => {
  it("uses infinite retention and the stage prefix", () => {
    expect(centraEventsTopicName("")).toBe(CENTRA_EVENTS_TOPIC);
    expect(centraEventsTopicName("--mako--init-centra--")).toBe(
      "--mako--init-centra--aws.onemac.centra.events",
    );
    expect(centraCreateTopic("--mako--init-centra--")).toEqual({
      topic: "--mako--init-centra--aws.onemac.centra.events",
      configEntries: [{ name: "retention.ms", value: "-1" }],
    });
  });

  it("subscribes reindex to the shared topic and the stage topic", () => {
    expect(centraReindexTopics("--mako--init-centra--")).toEqual([
      "aws.onemac.centra.events",
      "--mako--init-centra--aws.onemac.centra.events",
    ]);
    expect(centraReindexTopics("")).toEqual(["aws.onemac.centra.events"]);
  });

  it("rebuilds archives for the stage CDC topic and the centra topic", () => {
    expect(attachmentArchiveRebuildTriggerTopics("--mako--init-centra--")).toBe(
      "--mako--init-centra--aws.onemac.migration.cdc,--mako--init-centra--aws.onemac.centra.events",
    );
    expect(attachmentArchiveRebuildTriggerTopics("")).toBe(
      "aws.onemac.migration.cdc,aws.onemac.centra.events",
    );
  });

  it("wires the data and api stacks and leaves processEmails unsubscribed", () => {
    const dataSource = readFileSync(join(stackDir, "data.ts"), "utf8");
    const apiSource = readFileSync(join(stackDir, "api.ts"), "utf8");
    const emailSource = readFileSync(join(stackDir, "email.ts"), "utf8");

    expect(dataSource).toContain("centraCreateTopic(topicNamespace)");
    expect(dataSource.match(/centraReindexTopics\(topicNamespace\)/g)).toHaveLength(4);
    expect(dataSource).toContain("attachmentArchiveRebuildTriggerTopics(topicNamespace)");
    expect(dataSource).toContain("centraEventsTopic");
    expect(apiSource).toContain("centraTopicName");
    expect(apiSource).toContain("centraEventsTopicName(topicNamespace)");
    expect(emailSource).not.toContain("aws.onemac.centra.events");
    expect(emailSource).not.toContain("centraTopicName");
  });
});
