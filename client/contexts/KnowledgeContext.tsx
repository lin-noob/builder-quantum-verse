import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { KnowledgeNode } from "../types/Knowledge";
import { mockKnowledgeNodes } from "../data/knowledgeMockData";

interface KnowledgeContextType {
  nodes: KnowledgeNode[];
  getNodeById: (id: string) => KnowledgeNode | undefined;
  getRelatedNodes: (nodeId: string) => KnowledgeNode[];
  loading: boolean;
  error: string | null;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

interface KnowledgeProviderProps {
  children: ReactNode;
}

export const KnowledgeProvider: React.FC<KnowledgeProviderProps> = ({ children }) => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API fetch
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNodes(mockKnowledgeNodes);
        setLoading(false);
      } catch (err) {
        setError("加载知识节点失败");
        setLoading(false);
      }
    };

    fetchNodes();
  }, []);

  const getNodeById = (id: string) => {
    return nodes.find((node) => node.id === id);
  };

  const getRelatedNodes = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (!node) return [];

    const relatedIds = node.relations.map((rel) => rel.targetNodeType);
    // Also include nodes that relate TO this node (if not already explicitly linked in bidirectional graph,
    // but in our mock data we might have explicit links or need to search)
    // For this implementation, we'll just look up the target IDs from the relations list.

    // In a real graph, we might want to search all nodes where this node is a target too.
    // Let's do that for completeness if the relation direction is IN, the targetNodeType is actually the "source" in a way?
    // Wait, in our type definition:
    // KnowledgeRelation: { semanticName, targetNodeType, direction }
    // If direction is OUT: This Node -> Target Node.
    // If direction is IN: Target Node -> This Node.
    // So 'targetNodeType' is always the OTHER node.

    return nodes.filter((n) => relatedIds.includes(n.id));
  };

  const value = {
    nodes,
    getNodeById,
    getRelatedNodes,
    loading,
    error,
  };

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
};

export const useKnowledge = (): KnowledgeContextType => {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error("useKnowledge must be used within a KnowledgeProvider");
  }
  return context;
};
