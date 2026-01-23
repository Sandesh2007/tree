"use client";

import { useState, useEffect } from "react";
import { CustomLevel, CustomRelation } from "@/types/types";
import axios from "axios";

interface UserConfig {
  customLevels: CustomLevel[];
  customRelations: CustomRelation[];
}

export function useUserConfig() {
  const [config, setConfig] = useState<UserConfig>({
    customLevels: [],
    customRelations: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/config");
      if (response.data.success) {
        setConfig({
          customLevels: response.data.data.customLevels || [],
          customRelations: response.data.data.customRelations || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch user config:", err);
      setError("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    customLevels: config.customLevels,
    customRelations: config.customRelations,
    isLoading,
    error,
    refetch: fetchConfig,
  };
}
