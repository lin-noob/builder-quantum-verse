import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, Power, PowerOff, Trash2 } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'enable' | 'disable' | 'delete';
  actionName: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  actionName
}: ConfirmationModalProps) {
  
  const getModalConfig = () => {
    switch (type) {
      case 'enable':
        return {
          title: '确认启用',
          icon: <Power className="h-5 w-5 text-green-600" />,
          content: `您确定要启用动作"${actionName}"吗？启用后，AI将可能自动调用此动作。`,
          confirmText: '确认启用',
          confirmVariant: 'default' as const,
          confirmClass: 'bg-green-600 hover:bg-green-700'
        };
        
      case 'disable':
        return {
          title: '确认停用',
          icon: <PowerOff className="h-5 w-5 text-orange-600" />,
          content: `您确定要停用动作"${actionName}"吗？停用后，此动作将不再被触发。`,
          confirmText: '确认停用',
          confirmVariant: 'default' as const,
          confirmClass: 'bg-orange-600 hover:bg-orange-700'
        };
        
      case 'delete':
        return {
          title: '确认删除',
          icon: <Trash2 className="h-5 w-5 text-red-600" />,
          content: `您确定要永久删除动作"${actionName}"吗？此操作不可撤销。`,
          confirmText: '确认删除',
          confirmVariant: 'destructive' as const,
          confirmClass: ''
        };
        
      default:
        return {
          title: '确认操作',
          icon: <AlertTriangle className="h-5 w-5 text-gray-600" />,
          content: '您确定要执行此操作吗？',
          confirmText: '确认',
          confirmVariant: 'default' as const,
          confirmClass: ''
        };
    }
  };

  const config = getModalConfig();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 leading-relaxed">
            {config.content}
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            className={config.confirmClass}
          >
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
