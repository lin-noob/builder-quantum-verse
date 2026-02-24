import OperationLogsView from "@/components/OperationLogsView";

interface OperationLogsTabProps {
  organizationId: string;
  organizationName: string;
}

export function OperationLogsTab({ organizationId }: OperationLogsTabProps) {
  return <OperationLogsView organizationId={organizationId} />;
}
