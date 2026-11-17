import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useLabelMapping } from "./useLabelMappings";

describe("useLabelMapping", () => {
  it("maps CEntra authority and request type codes for filters and chips", () => {
    const { result } = renderHook(() => useLabelMapping());

    expect(result.current.CE_HARDSHIP_EXCEPTION).toBe("CE Hardship Exception");
    expect(result.current.CE_UNEMPLOYMENT).toBe("High Unemployment Requests");
    expect(result.current.CE_SADE).toBe("Stafford Act Disaster and Emergency Requests");
    expect(result.current.CE_NEA).toBe("National Emergencies Act Requests");
  });
});
