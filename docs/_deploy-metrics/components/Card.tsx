import { Box, Spacer, Text } from "@chakra-ui/react";
import React from "react";

export interface CardProps {
  questionText: string;
  questionAnswer: string;
}

export const Card: React.FC<CardProps> = ({ questionAnswer, questionText }) => {
  return (
    <Box shadow="lg" borderRadius="md" py="4" px="5">
      <Text fontSize={"lg"}>{questionText}</Text>
      <Spacer height={"2"} />
      <Text textAlign={"left"} fontSize="sm" fontWeight={"semibold"}>
        {questionAnswer}
      </Text>
    </Box>
  );
};
