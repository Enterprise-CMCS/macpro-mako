import type { InferGetStaticPropsType } from "next";
import {
  Divider,
  Container,
  Heading,
} from "@chakra-ui/react";

export const getStaticProps = async () => {
    const webformsAvailable = [{id: 1234, name: 'abp', version: 1}]
  return {
    props: {
      webformsAvailable,
    },
  };
};

const WebformsDocs = ({
    webformsAvailable,
}: InferGetStaticPropsType<typeof getStaticProps>) => {

  return (
    <Container centerContent>
      <Heading as="h1">Available Webforms</Heading>
      <Divider my={5} />
      {JSON.stringify(webformsAvailable)}
      <Divider my={4} />
    </Container>
  );
};

export default WebformsDocs;
