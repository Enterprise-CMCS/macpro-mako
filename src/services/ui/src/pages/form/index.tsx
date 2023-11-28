import { useForm } from "react-hook-form";
import { Button, Form } from "@/components/Inputs";
import { RHFDocument } from "@/components/RHF";
import { ABP1 } from "./proto";
import { documentInitializer, documentValidator } from "@/components/RHF/utils";
import { Link, useParams } from "react-router-dom";
import { SubNavHeader } from "@/components";
import { Footer } from "./footer";

export const Webforms = () => {
  return (
    <>
      <SubNavHeader>
        <h1 className="text-xl font-medium">Webforms</h1>
      </SubNavHeader>
      <section className="block md:flex md:flex-row max-w-screen-xl m-auto px-4 lg:px-8 pt-8 gap-10">
        <div className="flex-1">
          <Link to="/webform/abp1/1.0">ABP1 1.0</Link>
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

  const defaultValues = documentInitializer(ABP1);

  const form = useForm({
    defaultValues,
  });

  const onSubmit = form.handleSubmit(
    (data) => {
      const validate = documentValidator(ABP1);
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
  return (
    <div className="max-w-screen-xl mx-auto p-4 py-8 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <RHFDocument document={ABP1} {...form} />
          <div className="flex justify-between">
            <Button variant="link">Save Draft</Button>
            <div className="flex flex-row gap-4">
              {/* <Button variant="outline">Back</Button> */}
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>
      <Footer />
    </div>
  );
}

export * from "./medicaid-form";
