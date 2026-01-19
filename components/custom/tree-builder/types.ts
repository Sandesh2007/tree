import type { Node, Edge } from "@xyflow/react";

export type NodeLevel = "executive" | "manager" | "lead" | "member";

/**
 * Represents the relation type in the tree
 * in future the user will need to add relations types by themselves
 */
export type RelationType =
  | "reports_to"
  | "manages"
  | "collaborates"
  | "mentors";

/**
 * Represents the data of a person in the tree.
 */
export interface PersonData extends Record<string, unknown> {
  name: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  image?: string;
  level: NodeLevel;
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
/**
 * Custom node data
 */
export interface TreeNode extends Node<PersonData> {
  type: string;
}

export interface TreeEdge extends Edge<{
  relationType: RelationType;
  label?: string;
}> {
  type: string;
}
