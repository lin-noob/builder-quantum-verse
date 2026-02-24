import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step5ResultRecording } from '../Step5ResultRecording';
import { DecisionState } from '../../decision/types';

// Mock ResizeObserver for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Radix UI Tooltip to avoid Portal issues in JSDOM
// We mock the Provider to just render children, and Content to just render children
// This simplifies testing ensuring the *logic* of passing content works, even if we lose the portal behavior test
vi.mock('@radix-ui/react-tooltip', async () => {
  const actual = await vi.importActual('@radix-ui/react-tooltip');
  return {
    ...actual,
    Provider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Content: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  };
});

// Mock Icons
vi.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="icon-check" />,
  XCircle: () => <span data-testid="icon-x" />,
  X: () => <span data-testid="icon-close" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  ArrowRight: () => <span data-testid="icon-arrow" />,
  RotateCw: () => <span data-testid="icon-rotate" />,
  RotateCcw: () => <span data-testid="icon-rotate" />,
  Info: () => <span data-testid="icon-info" />,
}));

describe('Step5ResultRecording', () => {
  const mockOnUpdate = vi.fn();
  const mockOnReset = vi.fn();

  const createMockState = (overrides = {}): DecisionState => ({
    decisionId: '123',
    currentStep: 5,
    traceId: 'trace-123',
    context: {
      intent: 'test intent',
      goals: [],
      entities: [],
    },
    analysis: {
      options: [],
      recommendedOptionId: 'opt1',
      reasoning: 'test reasoning',
    },
    execution: {
      status: 'completed',
      plan: [],
      results: [],
    },
    result: {
      solved: true,
      adoptedSolution: 'Test Solution',
      hasLoss: false,
      needsReview: false,
      recordedAt: '2023-01-01T12:00:00Z',
      ...overrides,
    },
    createdAt: '2023-01-01T12:00:00Z',
    updatedAt: '2023-01-01T12:00:00Z',
  });

  it('renders success state correctly', () => {
    const state = createMockState();
    render(<Step5ResultRecording state={state} onUpdate={mockOnUpdate} onReset={mockOnReset} />);

    // Solution text appears in the card and in the tooltip content (which is rendered by our mock)
    const solutions = screen.getAllByText('Test Solution');
    expect(solutions.length).toBeGreaterThan(0);
    
    expect(screen.getByText('已解决')).toBeInTheDocument();
    // We expect 4 check icons: 1 next to Solution Text, 1 in Solved Status, 1 in Loss Status, 1 in Review Status
    expect(screen.getAllByTestId('icon-check')).toHaveLength(4); 
  });

  it('renders failure state correctly with view details button', () => {
    const state = createMockState({
      solved: false,
      errorStack: 'Error: Something went wrong',
      suggestions: ['Try restarting'],
    });
    render(<Step5ResultRecording state={state} onUpdate={mockOnUpdate} onReset={mockOnReset} />);

    expect(screen.getByText('未解决')).toBeInTheDocument();
    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
    expect(screen.getByText('查看详情')).toBeInTheDocument();
  });

  it('shows tooltip content when hovering (mocked)', async () => {
    const state = createMockState({ operator: 'Test Operator' });
    render(<Step5ResultRecording state={state} onUpdate={mockOnUpdate} onReset={mockOnReset} />);
    
    // With our mock, the content is always rendered in the DOM if the component logic renders it
    // But Radix Tooltip usually only renders Content when Trigger is active.
    // However, our mock above effectively renders everything.
    // Let's verify if the text is present.
    // If the component relies on `open` state to render, we might need to simulate it.
    // For now, let's assume the component renders <TooltipContent> which our mock renders as a div.
    
    // In real Radix, Content is inside Portal. In our mock, it is a div.
    // We need to check if the text is in the document.
    expect(screen.getByText('By: Test Operator')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    const state = createMockState();
    render(<Step5ResultRecording state={state} onUpdate={mockOnUpdate} onReset={mockOnReset} />);

    const button = screen.getByText('开启新决策');
    fireEvent.click(button);
    expect(mockOnReset).toHaveBeenCalled();
  });
});
