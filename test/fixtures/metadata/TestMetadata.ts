export interface TestMetadata {
  id: string;
  title: string;
  file: string;
  feature: string;
  type: "smoke" | "ci" | "e2e";
  tags: string[];
  jira?: string;
  testrail_case_id?: number;
}
