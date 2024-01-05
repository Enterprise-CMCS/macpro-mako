import type { InferGetStaticPropsType } from "next";
import {
  Box,
  Container,
  Divider,
  HStack,
  Heading,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react'
import { generateFormDocumentation, getAllFormData, ResultObject } from "../../lib/formData";
import React from "react";

export const getStaticProps = async () => {

    let allFormsWithData, allFormsAndVersions
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_REST_URL}/allForms`);
      allFormsAndVersions = await response.json();
      allFormsWithData = await getAllFormData(allFormsAndVersions)
    }catch (e) {
      console.error(e)
    }
    
  return {
    props: {
        allFormsAndVersions,
        allFormsWithData
    },
  };
};

const WebformsDocs = ({
    allFormsAndVersions,
    allFormsWithData
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [form, setForm] = React.useState('')
  const [version, setVersion] = React.useState('')

  if (!allFormsWithData) return

  return (
    <Box as="section" bg="bg.surface" pt={{ base: '4', md: '8' }} pb={{ base: '12', md: '24' }}>
      <Container>
        <Stack spacing="4">
          <Heading size={{ base: 'xs', md: 'sm' }} fontWeight="medium">
            Webforms Documentation
          </Heading>
          <Text color="fg.muted">Details about webforms available via the onemac forms api</Text>
          <HStack spacing={4}>
          <Select placeholder='Select a form' value={form} onChange={(e) => setForm(e.target.value)}>
            {Object.keys(allFormsAndVersions).map((form) => <option key={form} value={form}>{form}</option>)}
          </Select>
          <Select placeholder='version' disabled={!form} value={version} onChange={(e) => setVersion(e.target.value)}>
          {form && allFormsWithData[form].map((val) => <option key={val?.version} value={val?.version}>{val?.version}</option>)}
          </Select>
          </HStack>
          <Divider/>
          <Text>The purpose of this page is provide developers and anyone who might need to use the data collected in these forms infomation about how the data collected from the user connects to the form schema itself.</Text>
          
          {allFormsWithData[form] && version && <VersionDocs allFormsWithData={allFormsWithData} form={form} version={version}/>}
        </Stack>
      </Container>
    </Box>
  );
};

const VersionDocs: React.FC<{allFormsWithData: ResultObject, form: string, version: string}> = ({allFormsWithData, form, version}) => {
  const selectedFormData = allFormsWithData[form].find((f) => f?.version === version)
  console.log({selectedFormData})
  const documentation = generateFormDocumentation(selectedFormData?.data);
  console.log(documentation);
  return (
    <p>
      {JSON.stringify(documentation)}
    </p>
  )

}
export default WebformsDocs;
