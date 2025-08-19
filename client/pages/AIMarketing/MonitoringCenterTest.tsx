import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export default function MonitoringCenterTest() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">监控中心测试页面</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            AI实时决策流
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>如果您能看到这个页面，说明路由是正常的。</p>
          <p>正在排查原始监控中心组件的问题...</p>
        </CardContent>
      </Card>
    </div>
  );
}
