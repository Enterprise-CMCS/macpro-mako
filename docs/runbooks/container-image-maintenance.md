# Container Image Maintenance

## What is automated

- Dependabot opens dependency update PRs for:
  - `lib/attachment-archive`
  - `lib/local-constructs/clamav-scanning`
- The shared refresh values in `lib/config/container-image-refresh.ts` give CDK a single place to force image rebuilds when the base OS packages need to refresh.

## What still stays manual

- Production deploy decisions
- Bumping the image refresh value when Inspector findings come from the base image or OS packages rather than a `package.json` dependency

## How to force a rebuild

1. Update the relevant value in `lib/config/container-image-refresh.ts`.
2. Deploy the environment that uses the image.
3. Recheck Inspector after the new image is built and deployed.

## GitHub setup

- No separate bot token is required for Dependabot in this repository.
- Dependabot configuration lives in `.github/dependabot.yml`.
