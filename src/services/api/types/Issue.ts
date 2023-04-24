enum IssuePriority {
  high = "high",
  medium = "medium",
  low = "low",
}

enum IssueType {
  look = "look",
  functionality = "functionality",
  other = "other",
}

export type Issue = {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  createdAt: string;
  updatedAt: string;
};
