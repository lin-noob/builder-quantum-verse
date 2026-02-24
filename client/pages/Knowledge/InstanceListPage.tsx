import React from "react";
import { useParams } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const InstanceListPage: React.FC = () => {
  const { typeId } = useParams<{ typeId: string }>();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FB] text-center">
      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4 border border-purple-200">
        <PackageOpen className="w-10 h-10 text-purple-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{typeId} 实例列表</h1>
      <p className="text-slate-500 max-w-md mb-6">
        此页面将显示对象类型 <b>{typeId}</b> 的实例列表。
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        返回
      </Button>
    </div>
  );
};

export default InstanceListPage;
