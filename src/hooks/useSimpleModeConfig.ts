import { useState, useEffect } from "react";
import { SimpleModeConfig } from "../types/simpleTransaction";

export const useSimpleModeConfig = () => {
  const [config, setConfig] = useState<SimpleModeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/simple-mode-config.json");
        if (!response.ok) {
          throw new Error("Failed to fetch simple mode configuration");
        }
        const data = await response.json();
        setConfig(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, isLoading, error };
};
