import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crosshair, 
  UserPlus, 
  Brain, 
  AlertTriangle,
  Loader2,
  Clock,
  List,
  Check
} from 'lucide-react';
import { mockDecisionRecords, getStatusIcon, getStatusText, DecisionRecord } from '@shared/aiMarketingData';

const getIconComponent = (iconName: string, className: string = "h-5 w-5") => {
  switch (iconName) {
    case 'crosshairs':
      return <Crosshair className={className} />;
    case 'user-plus':
      return <UserPlus className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'alert-triangle':
      return <AlertTriangle className={className} />;
    default:
      return <AlertTriangle className={className} />;
  }
};

const getStatusIconComponent = (status: DecisionRecord['status'], className: string = "h-4 w-4") => {
  switch (status) {
    case 'generating':
      return <Loader2 className={`${className} animate-spin`} />;
    case 'ready':
      return <Clock className={className} />;
    case 'queued':
      return <List className={className} />;
    case 'executed':
      return <Check className={className} />;
    default:
      return <Clock className={className} />;
  }
};

const getStatusColor = (status: DecisionRecord['status']) => {
  switch (status) {
    case 'generating':
      return 'text-blue-600';
    case 'ready':
      return 'text-yellow-600';
    case 'queued':
      return 'text-purple-600';
    case 'executed':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export default function LiveMonitoring() {
  const [records, setRecords] = useState(mockDecisionRecords);
  const [animatedRecords, setAnimatedRecords] = useState<string[]>([]);

  // Simulate new records being added with animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Add animation class to the first record to simulate new entry
      setAnimatedRecords([records[0]?.id]);
      
      // Remove animation class after animation completes
      setTimeout(() => {
        setAnimatedRecords([]);
      }, 500);
    }, 10000); // Simulate new record every 10 seconds

    return () => clearInterval(interval);
  }, [records]);

  return (
    <div className="p-6 space-y-6">

      {/* AI Real-time Decision Feed */}
      <Card>
        <CardHeader>
          <CardTitle>AI实时决策流</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record, index) => (
              <div
                key={record.id}
                className={`
                  border rounded-lg p-4 transition-all duration-500 ease-in-out
                  ${animatedRecords.includes(record.id) 
                    ? 'transform -translate-y-2 shadow-lg border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${index === 0 ? 'border-l-4 border-l-blue-500' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIconComponent(record.icon, "h-5 w-5 text-gray-600")}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-gray-500">{record.timestamp}</span>
                      <span className="text-sm font-medium text-blue-600">
                        用户ID: {record.userId} ({record.userName})
                      </span>
                      <span className="text-sm px-2 py-1 bg-gray-100 rounded text-gray-700">
                        [{record.actionType}]
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">
                      {record.description}
                    </p>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIconComponent(record.status, `h-4 w-4 ${getStatusColor(record.status)}`)}
                      <span className={`text-sm font-medium ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading indicator for more records */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              监听AI决策中...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
