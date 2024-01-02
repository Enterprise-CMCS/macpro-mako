import type { InferGetStaticPropsType } from "next";
import {
  Divider,
  Container,
  Heading,
  Button,
} from "@chakra-ui/react";
import { getAllFormData } from "../../lib/formData";

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

  return (
    <Container centerContent>
      <Heading as="h1">Available Webforms</Heading>
      <Divider my={5} />
      {JSON.stringify(allFormsAndVersions)}
      <Divider my={5} />
      {JSON.stringify(allFormsWithData)}
      <Divider my={4} />
    </Container>
  );
};

export default WebformsDocs;
