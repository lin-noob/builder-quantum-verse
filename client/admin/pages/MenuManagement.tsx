import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MenuManagementComponent from "../components/MenuManagementComponent";

export default function MenuManagement() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>菜单管理</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuManagementComponent />
        </CardContent>
      </Card>
    </div>
  );
}