import { levelConfig, relationConfig } from "@/types/constants";
import { CustomLevel, CustomRelation } from "@/types/types";
import axios from "axios";

/**
 * Fetch user's custom configurations and merge with predefined ones
 */
export async function fetchUserConfig() {
  try {
    const response = await axios.get("/api/config");
    if (response.data.success) {
      return response.data.data;
    }
    return { customLevels: [], customRelations: [] };
  } catch (error) {
    console.error("Failed to fetch user config:", error);
    return { customLevels: [], customRelations: [] };
  }
}

/**
 * Get all level options (predefined + custom)
 */
export function getAllLevelOptions(customLevels: CustomLevel[] = []) {
  const predefinedLevels = Object.keys(levelConfig).map((key) => ({
    value: key,
    label: levelConfig[key as keyof typeof levelConfig].label,
  }));

  const customLevelOptions = customLevels.map((level) => ({
    value: level.value,
    label: level.label,
  }));

  return [...predefinedLevels, ...customLevelOptions];
}

/**
 * Get all relation options (predefined + custom)
 */
export function getAllRelationOptions(customRelations: CustomRelation[] = []) {
  const predefinedRelations = Object.keys(relationConfig).map((key) => ({
    value: key,
    label: relationConfig[key as keyof typeof relationConfig].label,
  }));

  const customRelationOptions = customRelations.map((relation) => ({
    value: relation.value,
    label: relation.label,
  }));

  return [...predefinedRelations, ...customRelationOptions];
}

/**
 * Get level configuration (predefined or custom)
 */
export function getLevelConfig(
  level: string,
  customLevels: CustomLevel[] = []
) {
  // Check predefined levels first
  if (level in levelConfig) {
    return levelConfig[level as keyof typeof levelConfig];
  }

  // Check custom levels
  const customLevel = customLevels.find((l) => l.value === level);
  if (customLevel) {
    return {
      color: customLevel.color,
      bgColor: customLevel.bgColor,
      borderColor: customLevel.borderColor,
      label: customLevel.label,
    };
  }

  // Fallback to default
  return {
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: level,
  };
}

/**
 * Get relation configuration (predefined or custom)
 */
export function getRelationConfig(
  relation: string,
  customRelations: CustomRelation[] = []
) {
  // Check predefined relations first
  if (relation in relationConfig) {
    return relationConfig[relation as keyof typeof relationConfig];
  }

  // Check custom relations
  const customRelation = customRelations.find((r) => r.value === relation);
  if (customRelation) {
    return {
      color: customRelation.color,
      label: customRelation.label,
      dashed: customRelation.dashed,
    };
  }

  // Fallback to default
  return {
    color: "#6366f1",
    label: relation,
    dashed: false,
  };
}

/**
 * Get all level configurations merged
 */
export function getAllLevelConfigs(customLevels: CustomLevel[] = []) {
  const configs: Record<
    string,
    {
      color: string;
      bgColor: string;
      borderColor: string;
      label: string;
    }
  > = { ...levelConfig };

  customLevels.forEach((level) => {
    configs[level.value] = {
      color: level.color,
      bgColor: level.bgColor,
      borderColor: level.borderColor,
      label: level.label,
    };
  });

  return configs;
}

/**
 * Get all relation configurations merged
 */
export function getAllRelationConfigs(customRelations: CustomRelation[] = []) {
  const configs: Record<
    string,
    {
      color: string;
      label: string;
      dashed: boolean;
    }
  > = { ...relationConfig };

  customRelations.forEach((relation) => {
    configs[relation.value] = {
      color: relation.color,
      label: relation.label,
      dashed: relation.dashed,
    };
  });

  return configs;
}
