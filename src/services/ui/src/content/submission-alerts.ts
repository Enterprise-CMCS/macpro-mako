type SubmissionAlert = {
  header: string;
  body: string;
};
type SubmissionAlertGenerator = (id: string) => SubmissionAlert;

const INITIAL_SUBMISSION_SUCCESS_BANNER: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "Package submitted",
  body: "Your submission has been received.",
});

const ISSUE_RAI_SUCCESS_BANNER: SubmissionAlertGenerator = (id: string) => ({
  header: "RAI issued",
  body: `The RAI for ${id} has been submitted. An email confirmation will be sent to you and the state.`,
});

const RESPOND_TO_RAI_SUCCESS_BANNER: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "RAI response submitted",
  body: `The RAI response for ${id} has been submitted.`,
});

const ENABLE_RAI_WITHDRAW_SUCCESS_BANNER: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "RAI response withdrawal enabled",
  body: "The state will be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
});

const DISABLE_RAI_WITHDRAW_SUCCESS_BANNER: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "RAI response withdrawal disabled",
  body: "The state will not be able to withdraw its RAI response. It may take up to a minute for this change to be applied.",
});

const RAI_WITHDRAW_CONFIRM_MODAL: SubmissionAlertGenerator = (id: string) => ({
  header: "Withdraw RAI response?",
  body: `The RAI response for ${id} will be withdrawn, and CMS will be notified.`,
});

const RAI_WITHDRAW_SUCCESS_BANNER: SubmissionAlertGenerator = (id: string) => ({
  header: "RAI response withdrawn",
  body: `The RAI response for ${id} has been withdrawn. CMS may follow up if additional information is needed.`,
});

const WITHDRAW_PACKAGE_CONFIRM_MODAL: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "Withdraw package?",
  body: `The package ${id} will be withdrawn.`,
});

const WITHDRAW_PACKAGE_SUCCESS_BANNER: SubmissionAlertGenerator = (
  id: string
) => ({
  header: "Package withdrawn",
  body: `The package ${id} has been withdrawn.`,
});

const CANCEL_CONFIRM_MODAL: SubmissionAlertGenerator = (id: string) => ({
  header: "Stop form submission?",
  body: "All information you've entered on this form will be lost if you leave this page.",
});
