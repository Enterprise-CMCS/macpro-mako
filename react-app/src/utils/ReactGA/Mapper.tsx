export function mapSubmissionTypeBasedOnActionFormTitle(actionFormTitle) {
  let mappedTitle;
  if (actionFormTitle.includes("CHIP SPA Details")) {
    mappedTitle = "chip spa";
  } else if (actionFormTitle.includes("Medicaid SPA Details")) {
    mappedTitle = "medicaid spa";
  } else if (actionFormTitle.includes("Temporary Extension Request Details")) {
    mappedTitle = "temporary extension";
  } else if (
    actionFormTitle.includes("1915(b)(4) FFS Selective Contracting Initial Waiver Details")
  ) {
    mappedTitle = "1915b(4) initial waiver";
  } else if (
    actionFormTitle.includes("1915(b)(4) FFS Selective Contracting Renewal Waiver Details")
  ) {
    mappedTitle = "1915b(4) waiver renewal";
  } else if (
    actionFormTitle.includes("1915(b)(4) FFS Selective Contracting Waiver Amendment Details")
  ) {
    mappedTitle = "1915b(4) waiver amendment";
  } else if (actionFormTitle.includes("1915(b) Comprehensive (Capitated) Initial Waiver Details")) {
    mappedTitle = "1915b capitated inital";
  } else if (actionFormTitle.includes("1915(b) Comprehensive (Capitated) Renewal Waiver Details")) {
    mappedTitle = "1915b capitated renewal";
  } else if (
    actionFormTitle.includes("1915(b) Comprehensive (Capitated) Waiver Amendment Details")
  ) {
    mappedTitle = "1915b capitated amendment";
  } else if (actionFormTitle.includes("1915(c) Appendix K Amendment Details")) {
    mappedTitle = "1915c app-k";
  }
  return mappedTitle;
}
