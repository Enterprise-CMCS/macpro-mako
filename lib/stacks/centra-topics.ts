/** Unprefixed Community Engagement topic. Ephemeral stages prepend `topicNamespace`. */
export const CENTRA_EVENTS_TOPIC = "aws.onemac.centra.events";

export const CENTRA_RETENTION_CONFIG = {
  name: "retention.ms",
  value: "-1",
} as const;

export function centraEventsTopicName(topicNamespace: string): string {
  return `${topicNamespace}${CENTRA_EVENTS_TOPIC}`;
}

export function centraCreateTopic(topicNamespace: string): {
  topic: string;
  configEntries: { name: string; value: string }[];
} {
  return {
    topic: centraEventsTopicName(topicNamespace),
    configEntries: [{ name: CENTRA_RETENTION_CONFIG.name, value: CENTRA_RETENTION_CONFIG.value }],
  };
}

/** Shared topic plus the stage-prefixed topic. Identical names collapse to one entry. */
export function centraReindexTopics(topicNamespace: string): string[] {
  return [...new Set([CENTRA_EVENTS_TOPIC, centraEventsTopicName(topicNamespace)])];
}

/**
 * Attachment-archive rebuilds run for the stage's OneMAC CDC topic and the CEntra topic.
 * Ephemeral stages pass a non-empty namespace, so only those prefixed topics match.
 */
export function attachmentArchiveRebuildTriggerTopics(topicNamespace: string): string {
  return [
    ...new Set([
      `${topicNamespace}aws.onemac.migration.cdc`,
      centraEventsTopicName(topicNamespace),
    ]),
  ].join(",");
}
