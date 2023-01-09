import { Table, Td, Text, Th, Thead, Tbody, Tr } from "@chakra-ui/react";
import { CardProps } from "./Card";

interface CardsProps {
  cards: CardProps[];
}

export const Cards: React.FC<CardsProps> = ({ cards }) => {
  return (
    <Table variant={"simple"}>
      <Thead>
        <Tr>
          <Th>Metric Tracked</Th>
          <Th>Result</Th>
        </Tr>
      </Thead>
      <Tbody>
        {cards.map((card, index) => (
          <Tr key={index}>
            <Td>
              <Text>{card.questionText}</Text>
            </Td>
            <Td>
              <Text>{card.questionAnswer}</Text>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
