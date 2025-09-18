import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuI18nManagement from "../../components/Template/MenuI18nManagement";
import BackendManagement from "../../components/Template/BackendManagement";

const I18nConfig: React.FC = () => {
  return (
    <div className="p-6">
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">菜单</TabsTrigger>
          <TabsTrigger value="backend">后台</TabsTrigger>
        </TabsList>
        
        <TabsContent value="menu" className="mt-6">
          <MenuI18nManagement />
        </TabsContent>
        
        <TabsContent value="backend" className="mt-6">
          <BackendManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default I18nConfig;
