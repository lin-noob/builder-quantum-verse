import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MeshInstanceNode } from '../components/nodes/MeshInstanceNode';
import { MacroObjectNode } from '../components/nodes/MacroObjectNode';
import { useGraphStore } from '../store/useGraphStore';

// Mock React Flow components since we are testing Nodes in isolation
vi.mock('@xyflow/react', () => ({
  Handle: () => <div data-testid="handle" />,
  Position: { Top: 'top', Bottom: 'bottom' },
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Business Knowledge Graph - Node Labels', () => {
  beforeEach(() => {
    // Reset store state
    useGraphStore.setState({ showLabels: true });
  });

  it('MeshInstanceNode renders label when showLabels is true', () => {
    const data = { id: 'test-node', status: 'Active', label: 'Test Node' };
    render(<MeshInstanceNode id="1" data={data as any} selected={false} type="mesh-instance" zIndex={1} isConnectable={true} position={{ x: 0, y: 0 }} dragging={false} />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('MeshInstanceNode hides label when showLabels is false', () => {
    useGraphStore.setState({ showLabels: false });
    const data = { id: 'test-node', status: 'Active', label: 'Test Node' };
    render(<MeshInstanceNode id="1" data={data as any} selected={false} type="mesh-instance" zIndex={1} isConnectable={true} position={{ x: 0, y: 0 }} dragging={false} />);
    
    expect(screen.queryByText('Test Node')).toBeNull();
  });

  it('MacroObjectNode renders name when showLabels is true', () => {
    const data = { id: 'type_customer', name: 'Customer', instanceCount: 10, color: 'blue' };
    render(<MacroObjectNode id="1" data={data as any} selected={false} type="macro-object" zIndex={1} isConnectable={true} position={{ x: 0, y: 0 }} dragging={false} />);
    
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });

  it('MacroObjectNode hides name when showLabels is false', () => {
    useGraphStore.setState({ showLabels: false });
    const data = { id: 'type_customer', name: 'Customer', instanceCount: 10, color: 'blue' };
    render(<MacroObjectNode id="1" data={data as any} selected={false} type="macro-object" zIndex={1} isConnectable={true} position={{ x: 0, y: 0 }} dragging={false} />);
    
    expect(screen.queryByText('Customer')).toBeNull();
  });
});
