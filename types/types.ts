export type NodeLevel = "executive" | "manager" | "lead" | "member";

export type RelationType =
  | "reports_to"
  | "manages"
  | "collaborates"
  | "mentors";

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
  loc?: string; // GoJS location string "x y"
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
