import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { RHFDocument } from "@/components/RHF";
import { Link, useParams } from "react-router-dom";
import { SubNavHeader } from "@/components";
import { documentInitializer, documentValidator } from "@/components/RHF/utils";
import { useGetForm } from "@/api";
import { LoadingSpinner } from "@/components";
export const Webforms = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1">
          <Link to="/webform/ABP1/1">ABP1 v1</Link>
        </div>
      </section>
    </>
  );
};

export function Webform() {
  const { id, version } = useParams<{
    id: string;
    version: string;
  }>();
  console.log({ id, version });
  const { data, isLoading, error } = useGetForm(id as string, version);
  const defaultValues = documentInitializer(data);

  const form = useForm({
    defaultValues,
  });

  const onSubmit = form.handleSubmit(
    () => {
      const validate = documentValidator(data);
      const isValid = validate({
        alt_benefit_plan_population_name:
          "agadgasdfg2f2fdsfascvcvaeqfwf22fasdfasdfsd",
        is_enrollment_available: "no",
        income_target: "income_target_below",
        federal_poverty_level_percentage: "",
        ssi_federal_benefit_percentage: "",
        other_percentage: "",
        other_describe: "",
        income_definition_percentage: "other",
        is_incremental_amount: false,
        doller_incremental_amount: "",
        income_definition_region_statewide_group: [
          {
            income_definition_region_statewide_arr: [
              {
                household_size: "",
                standard: "",
              },
            ],
            is_incremental_amount: false,
            doller_incremental_amount: "",
          },
        ],
        income_definition_specific: "other_standard",
        income_definition: "income_definition_specific",
        other_description: "asdfasdf",
        health_conditions: ["physical_disability", "brain_injury", "hiv_aids"],
        other_targeting_criteria_description: "",
        target_criteria: [
          "income_standard",
          "health",
          "other_targeting_criteria",
        ],
        is_geographic_area: "no",
        specify_counties: "",
        specify_regions: "",
        specify_cities_towns: "",
        specify_other: "",
        geographic_variation: "other",
        additional_information: "",
        eligibility_groups: [
          {
            eligibility_group: "parents_caretaker_relatives",
            mandatory_voluntary: "voluntary",
          },
        ],
        income_definition_specific_statewide_group_other: [
          {
            name_of_group: "",
            group_description: "",
            is_incremental_amount: false,
            doller_incremental_amount: "",
            income_definition_specific_statewide_arr: [
              {
                household_size: "",
                standard: "",
              },
            ],
          },
        ],
      });
      console.log({ isValid });
    },
    (err) => {
      console.log({ err });
    }
  );
  return isLoading ? (
    // <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
    //   {`Currently Loading ${id}...`}
    // </div>
    <LoadingSpinner />
  ) : error ? (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      {`There was an error loading ${id}`}
    </div>
  ) : (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={data} {...form} />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

export * from "../../pages/form/medicaid-form";
