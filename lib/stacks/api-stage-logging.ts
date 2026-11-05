/** Full request/response tracing is limited to ephemeral and local stages. */
export function apiStageDataTraceEnabled(isDev: boolean): boolean {
  return isDev;
}
