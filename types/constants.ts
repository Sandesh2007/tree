import { NodeLevel, RelationType } from "@/types/types";

/**
 * for now we will be adding some const data but in future user will be able to add their own data
 */
export const levelConfig: Record<
  NodeLevel,
  { color: string; bgColor: string; borderColor: string; label: string }
> = {
  executive: {
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    label: "Executive",
  },
  manager: {
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Manager",
  },
  lead: {
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Lead",
  },
  member: {
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    label: "Member",
  },
};

export const relationConfig: Record<
  RelationType,
  { color: string; label: string; dashed: boolean }
> = {
  reports_to: { color: "#6366f1", label: "Reports To", dashed: false },
  manages: { color: "#3b82f6", label: "Manages", dashed: false },
  collaborates: { color: "#10b981", label: "Collaborates", dashed: true },
  mentors: { color: "#f59e0b", label: "Mentors", dashed: true },
};

export const levelOptions = [
  { value: "executive", label: "Executive" },
  { value: "manager", label: "Manager" },
  { value: "lead", label: "Lead" },
  { value: "member", label: "Member" },
];

export const relationOptions = [
  { value: "reports_to", label: "Reports To" },
  { value: "manages", label: "Manages" },
  { value: "collaborates", label: "Collaborates With" },
  { value: "mentors", label: "Mentors" },
];
