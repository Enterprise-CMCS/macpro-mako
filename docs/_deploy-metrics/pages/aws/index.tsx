import type { InferGetStaticPropsType } from "next";
import { getAwsResources } from "../../lib/getAwsResources";
import * as UI from "@chakra-ui/react";
import { Resources } from "../../components/Resources";
import { octokitBranchesToUse } from "../../lib/octokit";
import { useState } from "react";
import packageJson from "../../../../package.json";

export const getStaticProps = async () => {
  const branchData: {
    [name: string]: {
      resources: Awaited<ReturnType<typeof getAwsResources>>;
    };
  } = {};

  for (const branch of octokitBranchesToUse!) {
    const resources = await getAwsResources(branch);

    branchData[branch] = {
      resources,
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

const Aws = ({
  branchData,
  repoName,
  branches,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [selectedBranch, setSelectedBranch] = useState<string>(branches![0]);

  const { resources } = branchData[selectedBranch];

  return (
    <UI.Container centerContent maxW="8xl" pb="24">
      <UI.Stack
        w="100%"
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        p="10"
        pb="4"
      >
        <div>
          <UI.Heading as="h1" size={"lg"}>
            AWS Resources
          </UI.Heading>
          <UI.Heading as="h2" size={"md"}>
            {repoName}
          </UI.Heading>
        </div>
        <UI.HStack>
          <UI.Text flex={2}>Currently viewing data for</UI.Text>
          <UI.Select
            w="max-content"
            value={selectedBranch}
            onChange={(newValue) => {
              setSelectedBranch(newValue.currentTarget.value);
            }}
          >
            {branches?.map((branch, index) => (
              <option key={index} value={branch}>
                {branch.toUpperCase()}
              </option>
            ))}
          </UI.Select>
        </UI.HStack>
      </UI.Stack>
      <UI.Divider m={5} />
      {resources && (
        <Resources
          data={resources}
          downloadFileName={`${repoName}-${selectedBranch}-aws-resources.csv`}
        />
      )}
    </UI.Container>
  );
};

export default Aws;
