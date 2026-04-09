export const RESOURCE_CATEGORY_VALUES = [
  "orgs",
  "hiring",
  "charities",
  "communities",
  "support",
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORY_VALUES)[number];

export const RESOURCE_CATEGORY_OPTIONS: ReadonlyArray<{
  label: string;
  value: ResourceCategory;
}> = [
  { label: "Good Neighbor Orgs", value: "orgs" },
  { label: "Work Worth Doing", value: "hiring" },
  { label: "Giveback Picks", value: "charities" },
  { label: "Homes & Habitats", value: "communities" },
  { label: "Sliding Scale & Support", value: "support" },
];
