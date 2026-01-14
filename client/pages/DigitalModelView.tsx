import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

// Define the Module interface
export interface Module {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
  status: string;
  mainText: string;
  hoverText: string;
}

interface DigitalModelViewProps {
  modules: Module[];
  onNavigate: (id: string) => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "";
  if (status === "完成") colorClass = "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
  if (status === "部分完成") colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
  if (status === "未配置") colorClass = "text-gray-500 border-gray-200";

  return (
    <Badge variant="outline" className={`${colorClass} font-normal`}>
      {status}
    </Badge>
  );
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const DigitalModelView: React.FC<DigitalModelViewProps> = ({ modules, onNavigate }) => {
  return (
    <TooltipProvider>
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
      >
        {modules.map((module) => (
          <motion.div key={module.id} variants={item} className="h-full">
            <Card className="hover:shadow-lg transition-all duration-300 border-gray-100 bg-white/80 backdrop-blur-sm hover:-translate-y-1 flex flex-col h-full text-left">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <StatusBadge status={module.status} />
                </div>
                <CardTitle className="text-lg mt-2">{module.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] cursor-help hover:text-gray-800 transition-colors">
                        {module.mainText}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="start" className="max-w-xs bg-gray-900 text-white border-gray-800 p-4">
                      <p className="text-sm leading-relaxed">
                        {module.hoverText}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{module.count}</span>
                    <span className="text-xs text-gray-400">项配置</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 justify-between group text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => onNavigate(module.id)}
                >
                  进入建模
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </TooltipProvider>
  );
};
