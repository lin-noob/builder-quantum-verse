import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Lock } from "lucide-react";

const AIBoundaryWorkbench = () => {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Boundary & Permissions</h1>
          <p className="text-slate-500">Define what AI Agents are allowed and forbidden to do within the enterprise.</p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          Work in Progress
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Allowed Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Configure safe operations that AI can execute autonomously.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              Prohibited Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Strictly forbidden actions for any AI agent.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              High Risk Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Scenarios requiring human-in-the-loop confirmation.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIBoundaryWorkbench;
