import { FilterOption } from "../components/CheckboxFilterPopover";
import { Resource } from "./getAwsResources";

export function getTypeOptions(resources: Resource[]): FilterOption[] {
    const counts: Record<string, number> = {};
    for (const resource of resources) {
      const parts = resource.ResourceType.split("::");
      const type = parts[1];
      if (!counts[type]) {
        counts[type] = 0;
      }
      counts[type]++;
    }
    const result: FilterOption[] = [];
    for (const type in counts) {
      result.push({
        label: type,
        value: `AWS::${type}`,
        count: counts[type],
      });
    }
    return result;
  }
  
  export function getStackOptions(data: Resource[]): FilterOption[] {
    const resourceCounts = data.reduce(
      (counts: Record<string, number>, stack: Resource) => {
        const stackName = stack.StackName;
        if (!counts[stackName]) {
          counts[stackName] = 0;
        }
        counts[stackName]++;
        return counts;
      },
      {}
    );
  
    return Object.keys(resourceCounts).map((stackName: string) => {
      return {
        label: stackName,
        value: stackName,
        count: resourceCounts[stackName],
      };
    });
  }