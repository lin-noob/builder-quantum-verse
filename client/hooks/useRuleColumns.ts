import { useState, useEffect, useCallback } from "react";
import { userProfileService, ColumnSetting } from "@/services/userProfileService";

export const useRuleColumns = () => {
  const [ruleColumns, setRuleColumns] = useState<ColumnSetting[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuleColumns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userProfileService.getColumnSettings();
      if (response.data && response.data.length) {
        // Filter for columns where columnKey is numeric
        // User specified: "只拿到columnKey能转换成number类型的数据"
        const filtered = response.data
          .filter((setting) => {
            const keyAsNumber = Number(setting.columnKey);
            return !isNaN(keyAsNumber) && setting.enabled;
          })
          .sort((a, b) => a.sortOrder - b.sortOrder);
        
        setRuleColumns(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch rule column settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRuleColumns();
  }, [fetchRuleColumns]);

  return { ruleColumns, loading };
};
