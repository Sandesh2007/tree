export type NodeLevel = "executive" | "manager" | "lead" | "member" | string;

export type RelationType =
  | "reports_to"
  | "manages"
  | "collaborates"
  | "mentors"
  | string;

/**
 * Represents the relation type in the tree
 * in future the user will need to add relations types by themselves
 */
export interface PersonData {
  key: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  image?: string;
  level: NodeLevel;
  loc?: string; // Position string "x y" for diagram layout
}

export interface LinkData {
  key: string;
  from: string;
  to: string;
  relationType: RelationType;
  label?: string;
}

/**
 * Represents the form data of a person in the tree.
 */
export interface PersonFormData {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  level: NodeLevel;
  parentId: string;
  relationType: RelationType;
}

export interface DiagramData {
  nodes: PersonData[];
  links: LinkData[];
}

/**
 * Custom level type configuration
 */
export interface CustomLevel {
  id: string;
  value: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Custom relation type configuration
 */
export interface CustomRelation {
  id: string;
  value: string;
  label: string;
  color: string;
  dashed: boolean;
  createdBy: string;
  createdAt: string;
}

/**
 * User configuration for custom levels and relations
 */
export interface UserConfig {
  customLevels: CustomLevel[];
  customRelations: CustomRelation[];
}
