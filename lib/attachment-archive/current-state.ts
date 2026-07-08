import {
  getAttachmentArchiveFailureMessage,
  isTerminalAttachmentArchiveFailure,
} from "./failure-state";
import { AttachmentArchiveCurrent } from "./types";

export const LEGACY_IN_PROGRESS_STALE_AFTER_MS = 30 * 60 * 1000;

export type AttachmentArchiveCurrentResolution =
  | { action: "ready" }
  | {
      action: "in_progress";
      status: "PENDING" | "RUNNING";
      pendingReason?: AttachmentArchiveCurrent["pendingReason"];
      pendingMessage?: string;
    }
  | { action: "failed"; message: string }
  | { action: "rebuild"; reason: string };

function getUpdatedAtMs(current: AttachmentArchiveCurrent): number | undefined {
  const updatedAtMs = Date.parse(current.updatedAt);
  return Number.isNaN(updatedAtMs) ? undefined : updatedAtMs;
}

function buildInProgressResolution(
  current: AttachmentArchiveCurrent,
): Extract<AttachmentArchiveCurrentResolution, { action: "in_progress" }> {
  return {
    action: "in_progress",
    status: current.status as "PENDING" | "RUNNING",
    ...(current.pendingReason ? { pendingReason: current.pendingReason } : {}),
    ...(current.pendingMessage ? { pendingMessage: current.pendingMessage } : {}),
  };
}

export function resolveAttachmentArchiveCurrentState({
  expectedHash,
  current,
  artifactExists,
  hasRunningExecution,
  nowMs = Date.now(),
  staleAfterMs = LEGACY_IN_PROGRESS_STALE_AFTER_MS,
}: {
  expectedHash: string;
  current?: AttachmentArchiveCurrent;
  artifactExists: boolean;
  hasRunningExecution?: boolean;
  nowMs?: number;
  staleAfterMs?: number;
}): AttachmentArchiveCurrentResolution {
  if (!current) {
    return { action: "rebuild", reason: "missing_current" };
  }

  if (current.hash !== expectedHash) {
    return { action: "rebuild", reason: "hash_mismatch" };
  }

  if (current.status === "READY") {
    return artifactExists ? { action: "ready" } : { action: "rebuild", reason: "missing_artifact" };
  }

  if (current.status === "FAILED") {
    if (isTerminalAttachmentArchiveFailure(current)) {
      return {
        action: "failed",
        message: getAttachmentArchiveFailureMessage(current),
      };
    }

    return { action: "rebuild", reason: "failed" };
  }

  if (current.executionArn) {
    return hasRunningExecution
      ? buildInProgressResolution(current)
      : { action: "rebuild", reason: "execution_not_running" };
  }

  const updatedAtMs = getUpdatedAtMs(current);
  if (updatedAtMs === undefined) {
    return { action: "rebuild", reason: "invalid_updated_at" };
  }

  return nowMs - updatedAtMs >= staleAfterMs
    ? { action: "rebuild", reason: "legacy_in_progress_stale" }
    : buildInProgressResolution(current);
}
