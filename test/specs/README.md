# Specs

Markdown test plans produced by the Playwright planner agent live here (`test/specs/*.md`).
The generator turns those plans into deterministic journey specs under `test/e2e/journeys/`.

## Agent replay cache

If a journey uses `page.perform(...)`, run it locally with `--run-agents=missing` so Playwright can populate the agent cache, then commit the generated cache artifacts. CI keeps `runAgents: 'none'` and replays from that cache without LLM calls.
