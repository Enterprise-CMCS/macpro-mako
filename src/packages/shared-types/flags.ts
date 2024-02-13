import { featureFlags } from "shared-utils";

/**
 * Feature flags constants used in application. Uppercased and snake_cased
 */
export const featureFlagKeys = Object.keys(featureFlags).map(
  (flag): keyof typeof featureFlags => flag as FlagKey
);

/**
 * Feature flag constants used in Launch Darkly. Lowercased and kebab-cased
 */
type FeatureFlagLDConstant =
  typeof featureFlags[keyof typeof featureFlags]["flag"];

type FlagKey = keyof typeof featureFlags;
type FlagValue = boolean | string | number | object | []; // this is  an approximate mapping to available LD flag value types

type FeatureFlagSettings = Partial<Record<FeatureFlagLDConstant, FlagValue>>;

export type { FlagKey, FlagValue, FeatureFlagLDConstant, FeatureFlagSettings };
