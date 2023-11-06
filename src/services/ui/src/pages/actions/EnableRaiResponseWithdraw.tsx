import { Navigate, useParams } from "react-router-dom";
import { SimplePageContainer } from "@/components";
import { BreadCrumbs } from "@/components/BreadCrumb";
import { BREAD_CRUMB_CONFIG_PACKAGE_DETAILS } from "@/components/BreadCrumb/bread-crumb-config";
import { ROUTES } from "@/routes";
import { Action } from "shared-types";
import { Button } from "@/components/Inputs";
import { useGetItem } from "@/api";
import { removeUnderscoresAndCapitalize } from "@/utils";

export const EnableRaiResponseWithdraw = () => {
  const { id, type } = useParams<{
    id: string;
    type: Action;
  }>();
  const { data, isLoading, error } = useGetItem(id!);

  // Keeps aria stuff and classes condensed
  const SectionTemplate = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <div className="flex flex-col my-8">
      <label className="font-semibold" id="package-id-label">
        {label}
      </label>
      <span aria-labelledby="package-id-label">{value}</span>
    </div>
  );

  return !id || !type ? (
    <Navigate to={ROUTES.DASHBOARD} />
  ) : (
    <SimplePageContainer>
      <BreadCrumbs
        options={BREAD_CRUMB_CONFIG_PACKAGE_DETAILS({ id: id, action: type })}
      />
      <h1>Enable RAI Response Withdraw</h1>
      <p>
        Once you submit this form, the most recent Formal RAI Response for this
        package will be able to be withdrawn by the state.{" "}
        <b>If you leave this page, you will lose your progress on this form.</b>
      </p>
      <section>
        <SectionTemplate label={"Package ID"} value={id} />
        <SectionTemplate
          label={"Type"}
          value={
            removeUnderscoresAndCapitalize(data?._source.planType) ||
            "No package type found"
          }
        />
      </section>
      <Button>Cancel</Button>
      <Button>Submit</Button>
    </SimplePageContainer>
  );
};
