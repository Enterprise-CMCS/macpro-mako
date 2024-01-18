import type { InferGetStaticPropsType } from "next";
import {
  Box,
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
          <Heading size={{ base: "md", md: "lg" }} fontWeight="medium">
            Webforms Documentation
          </Heading>
          <Text>
            The purpose of this page is provide developers and anyone who might
            need to use the data collected in these forms infomation about how
            the data collected from the user connects to the form schema itself.
          </Text>
          <Text color="fg.muted">
            Choose a form and version to see all possible fields
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
    generateDocs(selectedFormData?.data, resultsArray);

  return <>
    <Text fontSize='2xl'>{selectedFormData?.data?.header}</Text>
    {resultsArray.map((d: any, ind: number) => (
      <div key={d.name + ind}>
        <Text fontSize='sm' fontWeight="extrabold">Name: {d.name}</Text>
        <Text fontSize='sm' fontWeight="bold">Type: {d.rhf}</Text>
        {d.prompt && <Text fontSize='sm' fontWeight="bold">Prompt: {d.prompt}</Text>}
        {d.label && <Text fontSize='sm' fontWeight="bold">Label: {d.label}</Text>}
        {d.parentName && <Text fontSize='sm'>Parent: {d.parentName}</Text>}
        {d.options && <Text fontSize='sm'> options: {d.options.join(', ')}</Text>}
        <hr style={{ marginTop: 16}}/>
      </div>
    ))}
  </>
};
export default WebformsDocs;
