import type { InferGetStaticPropsType } from "next";
import {
  Divider,
  Container,
  Heading,
} from "@chakra-ui/react";
import { getAllFormData } from "./utils";

export const getStaticProps = async () => {

    const response = await fetch(`${process.env.API_REST_URL}/allForms)`);
    const allFormsWithVersion = await response.json();
    let data
      try {
        data = await getAllFormData(allFormsWithVersion)
      }catch (e) {
        console.log(e)
      }

  return {
    props: {
        allFormsWithVersion,
        data
    },
  };
};

const WebformsDocs = ({
    allFormsWithVersion,
    data
}: InferGetStaticPropsType<typeof getStaticProps>) => {

    console.log(process.env.API_REST_URL)
    console.log(data)

  return (
    <Container centerContent>
      <Heading as="h1">Available Webforms</Heading>
      <Divider my={5} />
      {JSON.stringify(allFormsWithVersion)}
      <Divider my={4} />
    </Container>
  );
};

export default WebformsDocs;
