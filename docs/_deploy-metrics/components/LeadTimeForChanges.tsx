import { getPrsToBranch } from "../lib/getPrsToBranch";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { Heading, Text } from "@chakra-ui/react";

export const LeadTimeForChanges = (
  props: Awaited<ReturnType<typeof getPrsToBranch>>
) => {
  return (
    <>
      <Heading size={"md"} as="h3" textAlign={"center"}>
        Time to close PRs (Pull-Requests)
      </Heading>
      <Text fontWeight={"light"}>
        The red line in the below chart is an indicator of average time.
      </Text>
      <ResponsiveContainer height={400}>
        <LineChart width={600} height={300} data={props.timesToMergePrs}>
          <Tooltip />
          <Legend />
          <Line
            strokeWidth={2}
            type="monotone"
            dataKey="hours"
            stroke="#8884d8"
          />
          <ReferenceLine
            stroke="red"
            strokeWidth={2}
            y={props.averageTimeToMerge}
          />
          <CartesianGrid stroke="#ccc" />
          <YAxis />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};
