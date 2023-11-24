export const PraDisclosure = () => {
  return (
    <div className="flex flex-col gap-2 my-6 text-sm text-slate-500">
      <b>{"PRA Disclosure Statement"}</b>
      <p>
        {
          "All State Medicaid agencies administering or supervising the \
        administration of 1915(c) home and community-based services (HCBS) \
        waivers are required to submit an annual Form CMS-372(S) Report for each \
        approved waiver. Section 1915(c)(2)(E) of the SocialSecurity Act \
        requires states to annually provide CMS with information on the waiver's \
        impact on the type, amount and cost of services provided under the state \
        plan in addition to the health and welgare of recipients. Under the \
        Privacy Act of 1974 any personally identifying information obatined will \
        be kept private to the extent of the law."
        }
      </p>
      <p>
        {
          "Accordint to the Paperwork Reduction Act of 1995, no persons are required to respond \
        to a collection of information unless it displays a valid OMB control number. The valid OMB \
        control number for this information colleciton is 0938-0272. The time required to complete \
        this information collection is estimated to average 44 hours per response, including the time to \
        review instructions, search existing data resources, gather the data needed, and complete and \
        review the information collection. If you have comments concerning the accuracy of the time \
        estimate(s) or suggestions for improving this form, please write to:"
        }
      </p>
      <p>
        {
          "CMS, 7500 Security Boulevard, Attn: PRA Reports Clearance Officer, Mail Stop C4-26-05, Baltimore, Maryland 21244-1850."
        }
      </p>
    </div>
  );
};
