import { useEffect, useState } from 'react';
import { Incident } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AICopilotSidebarProps {
  incident: Incident | null;
  suggestions?: { id: string; title: string }[];
  open: boolean;
  onClose: () => void;
}

export default function AICopilotSidebar({ incident, suggestions = [], open, onClose }: AICopilotSidebarProps) {
  const [notes, setNotes] = useState('');
  const [localOpen, setLocalOpen] = useState(open);

  useEffect(() => setLocalOpen(open), [open]);

  const handleLearningConfirm = (mode: 'followed' | 'different') => {
    localStorage.setItem('ai_learning_complete', 'true');
    onClose();
  };

  if (!localOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-800 shadow-2xl border-l border-slate-200 dark:border-slate-700 z-50 animate-in slide-in-from-right">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">AI副驾驶</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">{incident?.title || '当前案例'}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI原始分析</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="analysis">
                  <AccordionTrigger>展开/收起分析摘要</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {incident?.aiAnalysis.summary || '该案例由系统自动识别，建议按AI计划执行。'}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI建议清单</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map(s => (
                <label key={s.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox />
                  <span>{s.title}</span>
                </label>
              ))}
              {suggestions.length === 0 && (
                <div className="text-sm text-slate-500">暂无建议清单</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">手动操作记录仪</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-24 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent p-2 text-sm"
                placeholder="记录关键步骤..."
              />
              <div className="mt-2">
                <Button variant="outline" size="sm">+ 记录我的操作</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">✓ 我已手动解决此案例</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>请确认解决方案</AlertDialogTitle>
                <AlertDialogDescription>
                  为了帮助AI学习和改进，请告诉我们您是如何解决的：
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-3 text-sm">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="learn-mode" defaultChecked />
                  <span>我基本遵循了AI的建议清单。</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="learn-mode" />
                  <span>我采取了与AI建议完全不同的方案。</span>
                </label>
                <textarea className="w-full h-24 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent p-2" placeholder="可选：简单描述" />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleLearningConfirm('followed')}>确认并关闭案例</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
