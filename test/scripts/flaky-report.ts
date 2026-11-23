/**
 * Summarize flaky Playwright tests from a JSON report.
 *
 * - Always writes a GitHub step-summary table (when GITHUB_STEP_SUMMARY is set)
 *   and emits ::warning annotations for each flaky test.
 * - On main with a usable GITHUB_TOKEN: appends new flakes to quarantine.txt,
 *   opens a chore PR via `gh`, and opens/updates an issue labeled e2e-flaky.
 * - No-ops the quarantine/PR/issue path when not on main or when token/gh is missing.
 */

import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface JsonReportTest {
  projectName?: string;
  status: "skipped" | "expected" | "unexpected" | "flaky";
  results?: Array<{
    status?: string;
    retry?: number;
    attachments?: Array<{ name: string; path?: string }>;
  }>;
}

interface JsonReportSpec {
  title: string;
  file: string;
  line?: number;
  column?: number;
  ok: boolean;
  tests: JsonReportTest[];
}

interface JsonReportSuite {
  title: string;
  file: string;
  specs: JsonReportSpec[];
  suites?: JsonReportSuite[];
}

interface JsonReport {
  suites: JsonReportSuite[];
  stats?: {
    expected?: number;
    unexpected?: number;
    flaky?: number;
    skipped?: number;
  };
}

interface FlakyTest {
  projectName: string;
  file: string;
  title: string;
  line?: number;
  column?: number;
  /** Playwright --test-list style entry */
  testListEntry: string;
  traceHint?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(testRoot, "..");
const quarantinePath = path.join(testRoot, "quarantine.txt");

function resolveReportPath(): string {
  const fromEnv = process.env.PLAYWRIGHT_JSON_OUTPUT_FILE || process.env.E2E_JSON_REPORT;
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }

  const candidates = [
    path.join(testRoot, "playwright-reports", "results.json"),
    path.join(testRoot, "playwright-report", "results.json"),
    path.join(testRoot, "results.json"),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

function walkSuites(suites: JsonReportSuite[], titles: string[] = []): FlakyTest[] {
  const flakes: FlakyTest[] = [];

  for (const suite of suites) {
    const nextTitles = suite.title ? [...titles, suite.title] : titles;

    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        if (test.status !== "flaky") {
          continue;
        }

        const projectName = test.projectName || "default";
        const suitePath = [...nextTitles, spec.title].filter(Boolean).join(" › ");
        const location =
          spec.line !== undefined
            ? `${spec.file}:${spec.line}${spec.column !== undefined ? `:${spec.column}` : ""}`
            : spec.file;
        const testListEntry = `[${projectName}] › ${location} › ${suitePath}`;

        const trace = test.results
          ?.flatMap((result) => result.attachments ?? [])
          .find((attachment) => attachment.name === "trace");

        flakes.push({
          projectName,
          file: spec.file,
          title: suitePath,
          line: spec.line,
          column: spec.column,
          testListEntry,
          traceHint: trace?.path,
        });
      }
    }

    if (suite.suites?.length) {
      flakes.push(...walkSuites(suite.suites, nextTitles));
    }
  }

  return flakes;
}

function writeStepSummary(flakes: FlakyTest[], stats: JsonReport["stats"]): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  const lines = [
    "## Playwright flaky report",
    "",
    `| Expected | Unexpected | Flaky | Skipped |`,
    `| --- | --- | --- | --- |`,
    `| ${stats?.expected ?? 0} | ${stats?.unexpected ?? 0} | ${stats?.flaky ?? flakes.length} | ${stats?.skipped ?? 0} |`,
    "",
  ];

  if (flakes.length === 0) {
    lines.push("No flaky tests detected.");
  } else {
    lines.push("| Project | Test | Trace |");
    lines.push("| --- | --- | --- |");
    for (const flake of flakes) {
      lines.push(
        `| ${flake.projectName} | \`${flake.title}\` (${flake.file}) | ${flake.traceHint ? `\`${flake.traceHint}\`` : "—"} |`,
      );
    }
  }

  appendFileSync(summaryPath, `${lines.join("\n")}\n`);
}

function emitWarnings(flakes: FlakyTest[]): void {
  for (const flake of flakes) {
    const file = flake.file.startsWith("e2e/") ? `test/${flake.file}` : flake.file;
    const loc =
      flake.line !== undefined
        ? `${file}:${flake.line}${flake.column !== undefined ? `:${flake.column}` : ""}`
        : file;
    console.log(`::warning file=${loc}::Flaky e2e test: ${flake.title}`);
  }
}

function readExistingQuarantine(): Set<string> {
  if (!existsSync(quarantinePath)) {
    return new Set();
  }

  return new Set(
    readFileSync(quarantinePath, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#")),
  );
}

function appendQuarantine(entries: string[]): string[] {
  const existing = readExistingQuarantine();
  const added: string[] = [];

  for (const entry of entries) {
    const normalized = entry.trim();
    if (!normalized || existing.has(normalized)) {
      continue;
    }
    existing.add(normalized);
    added.push(normalized);
  }

  if (added.length === 0) {
    return [];
  }

  const block = [
    "",
    `# Auto-quarantined ${new Date().toISOString().slice(0, 10)}`,
    ...added,
    "",
  ].join("\n");

  appendFileSync(quarantinePath, block);
  return added;
}

function canMutateMain(): boolean {
  const ref = process.env.GITHUB_REF_NAME || process.env.GITHUB_REF || "";
  const onMain = ref === "main" || ref === "refs/heads/main";
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return onMain && Boolean(token);
}

function runGh(args: string[]): { ok: boolean; stdout: string; stderr: string } {
  const result = spawnSync("gh", args, {
    cwd: repoRoot,
    encoding: "utf8",
    env: process.env,
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
  };
}

function openQuarantinePr(added: FlakyTest[]): void {
  const branch = `chore/e2e-quarantine-${Date.now()}`;
  const titles = added.map((flake) => `- ${flake.title} (${flake.projectName})`).join("\n");

  const authCheck = runGh(["api", "user", "--jq", ".login"]);
  if (!authCheck.ok) {
    console.log(`Skipping quarantine PR (gh unavailable): ${authCheck.stderr || authCheck.stdout}`);
    return;
  }

  spawnSync("git", ["config", "user.name", "github-actions[bot]"], { cwd: repoRoot });
  spawnSync(
    "git",
    ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"],
    { cwd: repoRoot },
  );

  const branchResult = spawnSync("git", ["checkout", "-b", branch], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (branchResult.status !== 0) {
    console.log(`Skipping quarantine PR (branch create failed): ${branchResult.stderr}`);
    return;
  }

  spawnSync("git", ["add", "test/quarantine.txt"], { cwd: repoRoot });
  const commit = spawnSync("git", ["commit", "-m", "chore(e2e): quarantine flaky tests"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (commit.status !== 0) {
    console.log(`Skipping quarantine PR (commit failed): ${commit.stderr || commit.stdout}`);
    return;
  }

  const push = spawnSync("git", ["push", "-u", "origin", branch], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (push.status !== 0) {
    console.log(`Skipping quarantine PR (push failed): ${push.stderr || push.stdout}`);
    return;
  }

  const body = [
    "## Summary",
    "Auto-quarantine of flaky Playwright tests detected on `main`.",
    "",
    "### Flaky tests",
    titles,
    "",
    "## Next steps",
    "- Owner has 2 weeks to fix, prove stable in the nightly quarantine job, and remove from `test/quarantine.txt`.",
    "- Otherwise delete the test.",
  ].join("\n");

  const pr = runGh([
    "pr",
    "create",
    "--title",
    "chore(e2e): quarantine flaky tests",
    "--body",
    body,
    "--base",
    "main",
    "--head",
    branch,
  ]);

  if (!pr.ok) {
    console.log(`Failed to open quarantine PR: ${pr.stderr || pr.stdout}`);
    return;
  }

  console.log(`Opened quarantine PR: ${pr.stdout}`);

  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : "(see workflow run artifacts for traces)";

  const issueBody = [
    "Flaky e2e tests were auto-quarantined on `main`.",
    "",
    titles,
    "",
    `Workflow run: ${runUrl}`,
    "",
    "Label: `e2e-flaky`. Fix within 2 weeks or delete the test.",
  ].join("\n");

  const existing = runGh([
    "issue",
    "list",
    "--label",
    "e2e-flaky",
    "--state",
    "open",
    "--json",
    "number,title",
    "--jq",
    ".[0].number",
  ]);

  if (existing.ok && existing.stdout) {
    const comment = runGh(["issue", "comment", existing.stdout, "--body", issueBody]);
    if (!comment.ok) {
      console.log(`Failed to comment on e2e-flaky issue: ${comment.stderr || comment.stdout}`);
    } else {
      console.log(`Updated e2e-flaky issue #${existing.stdout}`);
    }
    return;
  }

  runGh([
    "label",
    "create",
    "e2e-flaky",
    "--description",
    "Flaky Playwright e2e tests",
    "--color",
    "E4E669",
  ]);

  const issue = runGh([
    "issue",
    "create",
    "--title",
    "chore(e2e): flaky tests quarantined",
    "--label",
    "e2e-flaky",
    "--body",
    issueBody,
  ]);

  if (!issue.ok) {
    console.log(`Failed to open e2e-flaky issue: ${issue.stderr || issue.stdout}`);
    return;
  }

  console.log(`Opened e2e-flaky issue: ${issue.stdout}`);
}

function main(): void {
  const reportPath = resolveReportPath();
  if (!existsSync(reportPath)) {
    console.log(`No Playwright JSON report at ${reportPath}; nothing to summarize.`);
    return;
  }

  const report = JSON.parse(readFileSync(reportPath, "utf8")) as JsonReport;
  const flakes = walkSuites(report.suites ?? []);

  writeStepSummary(flakes, report.stats);
  emitWarnings(flakes);

  console.log(`Found ${flakes.length} flaky test(s).`);

  if (flakes.length === 0) {
    return;
  }

  if (!canMutateMain()) {
    console.log(
      "Skipping quarantine.txt update / PR / issue (not on main or GITHUB_TOKEN/GH_TOKEN missing).",
    );
    return;
  }

  const addedEntries = appendQuarantine(flakes.map((flake) => flake.testListEntry));
  if (addedEntries.length === 0) {
    console.log("All flaky tests were already listed in quarantine.txt.");
    return;
  }

  openQuarantinePr(flakes.filter((flake) => addedEntries.includes(flake.testListEntry)));
}

main();
