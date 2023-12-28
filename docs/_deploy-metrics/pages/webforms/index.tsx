import type { InferGetStaticPropsType } from "next";
import {
  Divider,
  Container,
  Heading,
} from "@chakra-ui/react";

export const getStaticProps = async () => {

    const response = await fetch(`${process.env.API_REST_URL}/getAllForms)`);
    const allFormsWithVersion = await response.json();
    console.log(allFormsWithVersion);
  return {
    props: {
        allFormsWithVersion,
    },
  };
};

const WebformsDocs = ({
    allFormsWithVersion,
}: InferGetStaticPropsType<typeof getStaticProps>) => {

    console.log(process.env.API_REST_URL)
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
