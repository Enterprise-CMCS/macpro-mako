import type { InferGetStaticPropsType } from "next";
import { Cards } from "../../components/Cards";
import { getMeanTimeToRecover } from "../../lib/getMeanTimeToRecover";
import { getPrsToBranch } from "../../lib/getPrsToBranch";
import { getSuccessfulDeploys } from "../../lib/getSuccessfulDeploys";
import {
  Divider,
  Container,
  Heading,
  Text,
  Select,
  HStack,
} from "@chakra-ui/react";
import { LeadTimeForChanges } from "../../components/LeadTimeForChanges";
import { DeploymentFrequency } from "../../components/DeploymentFrequency";
import { octokitBranchesToUse } from "../../lib/octokit";
import { useState } from "react";
import packageJson from "../../../../package.json";

export const getStaticProps = async () => {
  const branchData: {
    [name: string]: {
      meanTimeToRecover: Awaited<ReturnType<typeof getMeanTimeToRecover>>;
      prsToBranch: Awaited<ReturnType<typeof getPrsToBranch>>;
      successfulDeploys: Awaited<ReturnType<typeof getSuccessfulDeploys>>;
    };
  } = {};

  for (const branch of octokitBranchesToUse!) {
    const meanTimeToRecover = await getMeanTimeToRecover(branch);
    const prsToBranch = await getPrsToBranch(branch);
    const successfulDeploys = await getSuccessfulDeploys(branch);

    branchData[branch] = {
      meanTimeToRecover,
      prsToBranch,
      successfulDeploys,
    };
  }

  return {
    props: {
      branchData,
      branches: octokitBranchesToUse,
      repoName: process.env?.REPO_NAME ?? packageJson.name.toUpperCase(),
    },
  };
};

const Dora = ({
  branchData,
  repoName,
  branches,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [selectedBranch, setSelectedBranch] = useState<string>(branches![0]);

  const dataForBranch = branchData[selectedBranch];

  return (
    <Container centerContent>
      <Heading as="h1">Deployment Metrics for {repoName}</Heading>
      <HStack pt={"4"}>
        <Text flex={2}>Currently viewing data for</Text>
        <Select
          flex={1}
          maxW={"md"}
          value={selectedBranch}
          onChange={(newValue) =>
            setSelectedBranch(newValue.currentTarget.value)
          }
        >
          {branches?.map((branch, index) => (
            <option key={index} value={branch}>
              {branch.toUpperCase()}
            </option>
          ))}
        </Select>
      </HStack>
      <Divider my={5} />
      <Cards
        cards={[
          {
            questionAnswer: `On average it takes ${dataForBranch.prsToBranch.averageTimeToMerge.toFixed(
              2
            )} hours`,
            questionText: `How long does it take to get code successfully running in ${selectedBranch.toLowerCase()}?`,
          },
          {
            questionAnswer: `${dataForBranch.successfulDeploys?.passedRuns.toString()} times per year`,
            questionText: `How often is code deployed to ${selectedBranch.toLowerCase()}?`,
          },
          {
            questionAnswer: `On average it takes ${dataForBranch.meanTimeToRecover} hours`,
            questionText:
              "How long does it take to recover from bad code being released?",
          },
          {
            questionAnswer: `${(
              (dataForBranch.successfulDeploys.failedRuns /
                (dataForBranch.successfulDeploys.failedRuns +
                  dataForBranch.successfulDeploys.passedRuns)) *
              100
            ).toFixed(2)} %`,
            questionText:
              "What percent of changes to the code result in a degraded service?",
          },
        ]}
      />
      <Divider my={4} />
      <LeadTimeForChanges {...dataForBranch.prsToBranch} />
      <DeploymentFrequency
        selectedBranch={selectedBranch}
        successfulDeploys={{ ...dataForBranch.successfulDeploys }}
      />
    </Container>
  );
};

export default Dora;
