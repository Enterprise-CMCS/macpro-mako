import React from "react";
import { helpDeskContact } from "./helpDeskContact";
export const stateSystemOverviewTranscript: JSX.Element = (
  <div>
    <p>
      The purpose of this video is to provide state users with an overview of
      OneMAC's new and improved submission package dashboard. We will
      demonstrate the new view along with some additional features and
      functionality that it provides.
    </p>
    <p>
      Please note, this video was recorded in a training environment and does
      not reflect actual data. Additionally, some screens may look different
      than what you will see in OneMAC.
    </p>
    <p>
      Upon logging in, you land on the Package Dashboard. State Plan Amendments
      and waivers are now displayed separately on the Package Dashboard. As you
      can see here, we are currently viewing only the State Plan Amendments. In
      order to switch the view to show waivers, you can select the Waivers tab
      at the top of the dashboard. Similarly, you can switch back to viewing
      State Plan Amendments by selecting the SPAs tab.
    </p>                           
    <p>
      Submissions are now structured into submission packages, which include the
      initial submission and any associated formal RAI responses. Previously,
      formal RAI responses would have been reflected as a separate record on the
      dashboard. Now, if a formal RAI response was submitted through OneMAC, it
      will appear as part of the submission package.
    </p>
    <p>
      The view of the Package Dashboard can also be customized by selecting
      Show/Hide Columns. From the dropdown list, you can deselect columns to
      remove them from your current Package Dashboard view.
    </p>
    <p>
      OneMAC now has several ways to make finding submitted State Plan
      Amendments and waivers easier. You can now filter the Package Dashboard by
      selecting the Filter button. Once the button is clicked, a box on the
      right-hand side of the dashboard will appear and provides you with options
      to filter by State, Type, Status, and Initial Submission Date. You will
      only have the option to filter by states that you have an approved role
      for.
    </p>
    <p>
      Initially, all options are selected and you can narrow your dashboard down
      by deselecting options in the Filter By list. If you wish to remove all
      filters from the dashboard, you can select the Reset button. Additionally,
      at the top of the Package Dashboard, there is a search field that you can
      use to search for a submission package by either the Package ID or the
      Submitter Name. As you type in the search text box, the list of
      submissions will automatically narrow to those that match. To view a
      submission package, which includes the initial submission and any
      associated formal RAI responses, select the link to the SPA ID or waiver
      number from the Package Dashboard. This page contains all of the
      information that was submitted through OneMAC about the submission
      package.
    </p>
    <p>
      At the top of the page, the Status is displayed along with applicable
      Package Actions. The status reflects where in the adjudication process the
      State Plan Amendment or waiver is.
    </p>
    <p>
      As a note, Temporary Extension Requests will only reflect the status of
      Submitted at this time.
    </p>
    <p>
      Package Actions that are available for a submission package are dependent
      on what status the package is in. Both State Plan Amendments and waiver
      submissions have Package Actions. We will discuss Package Actions shortly.
    </p>
    <p>
      The Package Details section includes the Type, State, Initial Submission
      Date, and Proposed Effective Date. The Attachments section contains all of
      the documents uploaded with the initial submission.
    </p>
    <p>
      If a formal RAI response was submitted, the documentation will appear as
      an attachment in the Formal RAI Responses section.
    </p>
    <p>
      Looping back to Package Actions, we mentioned previously how the available
      actions are dependent on the status of a submission package. If your
      submission package is in the RAI Issued status, it indicates that CMS has
      requested additional information from the state, and you will have an
      available action to Respond to RAI. This functionality should only be used
      when submitting your state's official formal RAI response, not a draft RAI
      response.
    </p>
    <p>
      Selecting the Respond to RAI link under Package Actions will bring you to
      a page where you can add the required formal RAI response attachments as
      well as any additional information for CMS. After all required information
      has been added, you can click Submit to send the formal RAI response to
      CMS.
    </p>
    <p>
      As a note, please be sure to check your entries as it is not possible to
      edit the RAI response submission in OneMAC after being submitted.
    </p>
    <p>
      Another Package Action available to you is the Withdraw Package action.
      This gives you the ability to withdraw an entire submission package that
      has been submitted to CMS. You will have this option available as a
      Package Action if your submission package is in either the Under Review or
      the RAI Issued status.
    </p>
    <p>
      Selecting the Withdraw Package link under Package Actions will bring up a
      warning message letting you know that if the package is withdrawn, the
      package cannot be resubmitted. If you are certain that you wish to
      withdraw the submission, select "Yes, withdraw package" to complete the
      task.
    </p>
    <p>
      This functionality cannot be used to withdraw a Formal RAI response. To
      withdraw a Formal RAI response, you will need to work with your CMS Point
      of Contact directly. Additionally, Package Actions can also be taken
      directly from the Package Dashboard. While on the Package Dashboard, the
      right most column is the Actions column. For submission packages with
      available actions, the three dots icon can be selected and a dropdown list
      will appear showing the actions that can be taken.
    </p>
    <p>
      As a reminder, available Package Actions for both State Plan Amendments
      and waivers will be dependent on the Package Status.
    </p>
    <p>
      Thank you for watching this overview of the latest OneMAC updates. If you
      have any questions, please free to contact the OneMAC Help Desk at{" "}
      <a href={`mailto: ${helpDeskContact.email}`}>{helpDeskContact.email}</a>
    </p>
  </div>
);
