import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Target, Activity, BarChart3 } from 'lucide-react';

interface AIMarketingLayoutProps {
  children: ReactNode;
}

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

export default function AIMarketingLayout({ children }: AIMarketingLayoutProps) {
  const location = useLocation();

  const subMenuItems: SubMenuItem[] = [
    {
      id: 'strategy',
      label: '战略与目标',
      path: '/ai-marketing/strategy-goals',
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 'monitoring',
      label: '实时监控',
      path: '/ai-marketing/live-monitoring',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'analytics',
      label: '效果分析',
      path: '/ai-marketing/performance-analytics',
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  return (
    <div className="flex h-full">
      {/* Sub Navigation Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">AI全自动营销</h2>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {subMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
