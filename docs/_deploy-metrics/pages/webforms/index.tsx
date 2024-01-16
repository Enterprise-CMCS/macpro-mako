import type { InferGetStaticPropsType } from "next";
import {
  Box,
  Divider,
  HStack,
  Heading,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  getAllFormData,
  ResultObject,
  generateDocs,
} from "../../lib/formData";
import React from "react";
import { FormSchema } from "shared-types";

export const getStaticProps = async () => {
  let allFormsWithData, allFormsAndVersions;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_REST_URL}/allForms`
    );
    allFormsAndVersions = await response.json();
    allFormsWithData = await getAllFormData(allFormsAndVersions);
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      allFormsAndVersions,
      allFormsWithData,
    },
  };
};

const WebformsDocs = ({
  allFormsAndVersions,
  allFormsWithData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [form, setForm] = React.useState("");
  const [version, setVersion] = React.useState("");

  if (!allFormsWithData) return;

  return (
    <Box
      as="section"
      bg="bg.surface"
      pt={{ base: "4", md: "8" }}
      pb={{ base: "12", md: "24" }}
      mx="10"
    >
      <Box maxW={"5xl"} m="auto">
        <Stack spacing="4">
          <Heading size={{ base: "xs", md: "sm" }} fontWeight="medium">
            Webforms Documentation
          </Heading>
          <Text color="fg.muted">
            Details about webforms available via the onemac forms api
          </Text>
          <HStack spacing={4}>
            <Select
              placeholder="Select a form"
              value={form}
              onChange={(e) => setForm(e.target.value)}
            >
              {Object.keys(allFormsAndVersions).map((form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              ))}
            </Select>
            <Select
              placeholder="version"
              disabled={!form}
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              {form &&
                allFormsWithData[form].map((val) => (
                  <option key={val?.version} value={val?.version}>
                    {val?.version}
                  </option>
                ))}
            </Select>
          </HStack>
          <Divider />
          <Text>
            The purpose of this page is provide developers and anyone who might
            need to use the data collected in these forms infomation about how
            the data collected from the user connects to the form schema itself.
          </Text>

          {allFormsWithData[form] && version && (
            <VersionDocs
              allFormsWithData={allFormsWithData}
              form={form}
              version={version}
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
};

const VersionDocs: React.FC<{
  allFormsWithData: ResultObject;
  form: string;
  version: string;
}> = ({ allFormsWithData, form, version }) => {
  const selectedFormData = allFormsWithData[form].find(
    (f) => f?.version === version
  );

    const resultsArray: any = []
    generateDocs(selectedFormData?.data as FormSchema, resultsArray);

  return <>
    <Text fontSize='2xl'>{selectedFormData?.data?.header}</Text>
    {resultsArray.map((d: any, ind: number) => (
      <div key={d.name + ind}>

      {d.prompt && <p>Prompt: {d.prompt}</p>}
      {d.label && <p>Label: {d.label}</p>}
      {d.parentName && <p>Parent: {d.parentName}</p>}
      <p>Name: {d.name}</p>
      <p>Type: {d.rhf}</p>
      {d.options && <p>options: {d.options.join(', ')}</p>}
      <hr style={{ marginTop: 16}}/>
      </div>
    ))}
  </>
};
export default WebformsDocs;
