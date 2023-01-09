import { Container, Heading, Text } from "@chakra-ui/react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { capitalizeFirstLetter } from "../lib/capitalizeLetter";
import type { getSuccessfulDeploys } from "../lib/getSuccessfulDeploys";

type Props = {
  successfulDeploys: Awaited<ReturnType<typeof getSuccessfulDeploys>>;
  selectedBranch: string;
};

export const DeploymentFrequency = ({
  selectedBranch,
  successfulDeploys,
}: Props) => {
  const pieChartData = [
    { name: "passed", value: successfulDeploys.passedRuns },
    { name: "failed", value: successfulDeploys.failedRuns },
  ];

  const colors = ["#0088FE", "#FF8042"];

  return (
    <Container mt={4}>
      <Heading textAlign={"center"} as="h3" size="md">
        {capitalizeFirstLetter(selectedBranch)} Deployments
      </Heading>
      <Text fontWeight={"light"}>
        The amount of successful deploys compared to unsuccessful deploys.
      </Text>
      <ResponsiveContainer height={200}>
        <PieChart>
          <Legend />
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={pieChartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {pieChartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Container>
  );
};
