import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Step2DataPreparation } from '../Step2DataPreparation';
import { DecisionTraceState } from '../types';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Database: () => <span data-testid="icon-database" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  Search: () => <span data-testid="icon-search" />,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: any) => <input type="checkbox" {...props} />,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Step2DataPreparation', () => {
  const mockState: DecisionTraceState = {
    currentStep: 2,
    triggerEvent: { id: 'evt_1', type: 'type', timestamp: '2023-01-01', source: 'source', severity: 'high' },
    intentAnalysis: {
      coreIntent: 'intent',
      goals: [{ id: 'goal_1', description: 'Goal 1', initialSuggestion: '', isConfirmed: true }],
      entities: []
    },
    dataPreparation: {
      requirements: [{ id: 'req_1', goalId: 'goal_1', objectType: 'Order', fields: ['id', 'status'], constraints: [] }],
      candidates: [{ id: 'cand_1', name: 'Order 123', type: 'Order', isSelected: true, data: {} }],
      integrityIssues: []
    },
    analysis: { options: [], recommendedOptionId: undefined, reasoning: '' },
    execution: { status: 'pending', plan: [], results: [] },
    result: undefined
  } as any; // Cast to any to avoid mocking full deep structure if not needed

  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  it('renders without crashing', () => {
    render(
      <Step2DataPreparation 
        state={mockState} 
        onUpdate={mockOnUpdate} 
        onNext={mockOnNext} 
        onBack={mockOnBack} 
      />
    );
    expect(screen.getByText('Step 2: 数据筛选 & 完整性检查')).toBeInTheDocument();
    expect(screen.getByText(/Goal 1/)).toBeInTheDocument();
    expect(screen.getByText('Order 123')).toBeInTheDocument();
  });
});
