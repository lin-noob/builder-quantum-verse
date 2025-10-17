import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ApprovalMonitor from "@/pages/Approval/ApprovalMonitor";
import ApprovalStatistics from "@/pages/Approval/ApprovalStatistics";

export default function ApprovalCenter() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">审批中心</h1>
          <p className="text-muted-foreground">将审批流程从实时事件流中独立出来，集中查看与管理。</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/approval/config">流程配置</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/approval/templates">模板管理</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>概览</CardTitle>
          <CardDescription>监控审批实例、查看统计报表</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monitor">
            <TabsList>
              <TabsTrigger value="monitor">审批监控</TabsTrigger>
              <TabsTrigger value="statistics">统计分析</TabsTrigger>
            </TabsList>
            <TabsContent value="monitor" className="mt-4">
              <ApprovalMonitor />
            </TabsContent>
            <TabsContent value="statistics" className="mt-4">
              <ApprovalStatistics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}