export const ONEMAC_PRODUCTION_LIKE_ENVIRONMENTS = ["dev", "val", "prod"] as const;

export type OnemacProductionLikeEnvironment = (typeof ONEMAC_PRODUCTION_LIKE_ENVIRONMENTS)[number];

export const ONEMAC_VALIDATION_ERROR_SOURCE = "onemac" as const;
export const ONEMAC_VALIDATION_ERROR_TYPE = "validation" as const;
export const ONEMAC_VALIDATION_ERROR_ENVIRONMENT_ATTR = "environment" as const;
export const ONEMAC_VALIDATION_ERROR_LOCATION = "smart-validation/sinkSmart" as const;

export const ONEMAC_VALIDATION_ERROR_MESSAGE_ATTRIBUTES = {
  source: ONEMAC_VALIDATION_ERROR_SOURCE,
  errorType: ONEMAC_VALIDATION_ERROR_TYPE,
} as const;

export function isOnemacProductionLikeEnvironment(
  environment: string,
): environment is OnemacProductionLikeEnvironment {
  return (ONEMAC_PRODUCTION_LIKE_ENVIRONMENTS as readonly string[]).includes(environment);
}

export function onemacEnvironmentFromStage(
  stage = process.env.stage,
): OnemacProductionLikeEnvironment {
  switch (stage) {
    case "val":
      return "val";
    case "production":
      return "prod";
    default:
      return "dev";
  }
}

export interface OnemacValidationErrorBody {
  source: typeof ONEMAC_VALIDATION_ERROR_SOURCE;
  errorType: typeof ONEMAC_VALIDATION_ERROR_TYPE;
  environment: OnemacProductionLikeEnvironment;
  location: string;
  nature: string;
  message: string;
  occurredAt: string;
  details?: Record<string, unknown>;
}
