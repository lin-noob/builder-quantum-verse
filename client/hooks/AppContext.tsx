import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { type Target, type TicketPost, type User } from "../types";
import { request } from "@/lib/request";

interface StepState extends Record<string, any> {
  loading: boolean;
  analysisResult?: string;
  confidence?: "high" | "medium" | "low";
}

export interface Step2ResponseData {
  response_strategy: {
    tone: string;
    key_points: string[];
    strategy_logic: string;
  };
  suggested_draft: {
    subject: string;
    salutation: string;
    body_content: string;
    closing: string;
  };
  professional_tips: string[];
}

export interface Project {
  id: string;
  projectName: string;
  tenantId?: string;
  gmtCreate?: string;
  gmtModified?: string;
}

interface AppContextType {
  // Navigation State
  currentStep: number;
  setStep: (step: number) => void;

  // Email Data State
  incomingEmails: TicketPost[];
  outgoingEmails: TicketPost[];
  loading: boolean;
  selectedEmail: TicketPost | null;
  setSelectedEmail: (email: TicketPost | null) => void;
  isCheckingStatus: boolean;
  setIsCheckingStatus: (val: boolean) => void;
  hasExistingData: boolean;
  setHasExistingData: (val: boolean) => void;

  // Analysis/Wizard State
  triggerAnalysis: number;
  setTriggerAnalysis: (val: number | ((prev: number) => number)) => void;
  localTargets: Target[];
  setLocalTargets: (targets: Target[]) => void;
  stepStates: Record<string, StepState>;
  updateStepState: (stepKey: string, partialState: Partial<StepState>) => void;
  resetAnalysis: () => void;

  // Step 2 API State
  step2Data: Step2ResponseData | null;
  step2Loading: boolean;
  fetchStep2Data: () => Promise<void>;

  // Auth State
  user: User | null;
  logout: () => void;
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
  syncPermissions: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  activeFeature: "home" | "email" | "profile";
  setActiveFeature: (feature: "home" | "email" | "profile") => void;

  // Project State
  projects: Project[];
  currentProjectId: string | null;
  viewData: any;
  setViewData: (data: any) => void;
  setStep2Data: (data: any) => void;
  step3Data: any;
  setStep3Data: (data: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [incomingEmails, setIncomingEmails] = useState<TicketPost[]>([]);
  const [outgoingEmails, setOutgoingEmails] = useState<TicketPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggerAnalysis, setTriggerAnalysis] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<TicketPost | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [activeFeature, setActiveFeature] = useState<"home" | "email" | "profile">("home");

  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [viewData, setViewData] = useState(null);
  const [step3Data, setStep3Data] = useState<any>(null);

  const handleLogout = useCallback(() => {
    setUser(null);
    setPermissions([]);
    setCurrentProjectId(null);
    setProjects([]);
    localStorage.removeItem("xd_user");
    localStorage.removeItem("xd_permissions");
    localStorage.removeItem("xd_current_project_id");
  }, []);

  const syncPermissions = useCallback(async () => {
    try {
      const response = await request.get("/admin/api/v1/menus/new/route");
      const menus = response?.data?.data || [];
      if (menus.length > 0 && menus[0]?.meta?.permissions) {
        const perms = menus[0].meta.permissions;
        setPermissions(perms);
        localStorage.setItem("xd_permissions", JSON.stringify(perms));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Session invalid or permission fetch failed:", error);
      handleLogout();
      return false;
    }
  }, [handleLogout]);

  const hasPermission = useCallback((permission: string) => permissions.includes(permission), [permissions]);

  const handleSetPermissions = useCallback((newPerms: string[]) => {
    setPermissions(newPerms);
    localStorage.setItem("xd_permissions", JSON.stringify(newPerms));
  }, []);

  const [localTargets, setLocalTargets] = useState<Target[]>([]);
  const [stepStates, setStepStates] = useState<Record<string, StepState>>({
    step0: { loading: false, analysisResult: "", confidence: "high" },
    step1: { loading: false, dataReady: false },
    step2: { loading: false, reviewComplete: false },
  });

  // Step 2 API State
  const [step2Data, setStep2Data] = useState<Step2ResponseData | null>(null);
  const [step2Loading, setStep2Loading] = useState(false);

  const fetchStep2Data = useCallback(async () => {
    setStep2Data(null);
    if (!viewData?.id) {
      return;
    }

    const parseExpertBriefing = (value: unknown) => {
      if (!value) {
        return null;
      }

      try {
        if (typeof value === "string") {
          return JSON.parse(value.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
        }

        return value;
      } catch (error) {
        console.error("Failed to parse expertBriefing for event:", error);
        return null;
      }
    };

    const existingBriefing = parseExpertBriefing(viewData?.expertBriefing);
    if (existingBriefing) {
      setStep2Data(existingBriefing as Step2ResponseData);
      return;
    }

    setStep2Loading(true);
    try {
      const res = await request.post("/quote/api/v1/instance/action", {
        id: viewData.id,
      });

      const parsedBriefing = parseExpertBriefing(res.data?.data?.expertBriefing);
      setStep2Data((parsedBriefing || null) as Step2ResponseData | null);
    } catch (error) {
      console.error("Failed to fetch expertBriefing for event:", error);
      setStep2Data(null);
    } finally {
      setStep2Loading(false);
    }
  }, [viewData]);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSetSelectedEmail = useCallback((email: TicketPost | null) => {
    setSelectedEmail(email);
    setTriggerAnalysis(0);
    setIsCheckingStatus(!!email); // Only true if we have an email
    setHasExistingData(false);
  }, []);

  const updateStepState = useCallback((stepKey: string, partialState: Partial<StepState>) => {
    setStepStates((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], ...partialState },
    }));
  }, []);

  const resetAnalysis = useCallback(() => {
    setStepStates({
      step0: { loading: false, analysisResult: "", confidence: "high" },
      step1: { loading: false, dataReady: false },
      step2: { loading: false, reviewComplete: false },
    });
    setLocalTargets([]);
    setStep(0);
  }, []);

  const value: AppContextType = {
    currentStep,
    setStep,
    incomingEmails,
    outgoingEmails,
    loading,
    triggerAnalysis,
    setTriggerAnalysis,
    selectedEmail,
    setSelectedEmail: handleSetSelectedEmail,
    isCheckingStatus,
    setIsCheckingStatus,
    hasExistingData,
    setHasExistingData,
    localTargets,
    setLocalTargets,
    stepStates,
    updateStepState,
    resetAnalysis,
    step2Data,
    step2Loading,
    viewData,
    setViewData,
    user,
    logout: handleLogout,
    permissions,
    setPermissions: handleSetPermissions,
    syncPermissions,
    hasPermission,
    activeFeature,
    setActiveFeature,
    projects,
    currentProjectId,
    fetchStep2Data,
    setStep2Data,
    step3Data,
    setStep3Data,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
