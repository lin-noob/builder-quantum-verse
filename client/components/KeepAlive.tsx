import React, { createContext, useContext, useRef, useEffect, useState, ReactNode, Suspense } from "react";

/**
 * KeepAlive Context to register and manage cached components
 */
const KeepAliveContext = createContext<{
  register: (name: string, children: ReactNode) => void;
} | null>(null);

/**
 * Provider that hosts the cached components in a hidden DOM area.
 */
export const ComponentCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [names, setNames] = useState<Record<string, ReactNode>>({});

  const register = (name: string, component: ReactNode) => {
    setNames((prev) => {
      if (prev[name]) return prev;
      return { ...prev, [name]: component };
    });
  };

  return (
    <KeepAliveContext.Provider value={{ register }}>
      {children}
      {/* 
          Hidden storage area for keep-alive components. 
          Each component gets its own Suspense boundary to avoid blocking the whole storage.
      */}
      <div id="keep-alive-storage" style={{ display: "none" }}>
        {Object.entries(names).map(([name, component]) => (
          <div key={name} id={`keep-alive-storage-${name}`}>
            <Suspense fallback={null}>{component}</Suspense>
          </div>
        ))}
      </div>
    </KeepAliveContext.Provider>
  );
};

/**
 * GuardedKeepAlive acts as an outlet that adopts the DOM of a cached component.
 */
export const GuardedKeepAlive: React.FC<{ name: string; children: ReactNode }> = ({ name, children }) => {
  const context = useContext(KeepAliveContext);
  const containerRef = useRef<HTMLDivElement>(null);

  // Register the component on first render
  useEffect(() => {
    if (context) {
      context.register(name, children);
    }
  }, [name, children, context]);

  // Handle DOM relocation between storage and the active container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let storageObserver: MutationObserver | null = null;
    let nodeObserver: MutationObserver | null = null;

    const moveNodes = (storage: HTMLElement) => {
      if (storage.firstChild) {
        while (storage.firstChild) {
          container.appendChild(storage.firstChild);
        }
        return true;
      }
      return false;
    };

    const storageId = `keep-alive-storage-${name}`;

    const initStorage = () => {
      const storage = document.getElementById(storageId);
      if (storage) {
        if (!moveNodes(storage)) {
          // If storage exists but has no nodes, watch for nodes to arrive
          nodeObserver = new MutationObserver(() => {
            if (moveNodes(storage)) {
              nodeObserver?.disconnect();
            }
          });
          nodeObserver.observe(storage, { childList: true, subtree: true });
        }
        return true;
      }
      return false;
    };

    // Try to init immediately
    if (!initStorage()) {
      // If storage div doesn't even exist yet, watch the global storage parent
      const globalStorage = document.getElementById("keep-alive-storage");
      if (globalStorage) {
        storageObserver = new MutationObserver(() => {
          if (initStorage()) {
            storageObserver?.disconnect();
          }
        });
        storageObserver.observe(globalStorage, { childList: true });
      }
    }

    return () => {
      storageObserver?.disconnect();
      nodeObserver?.disconnect();
      const storage = document.getElementById(storageId);
      if (storage && container) {
        while (container.firstChild) {
          storage.appendChild(container.firstChild);
        }
      }
    };
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="keep-alive-outlet"
      style={{ height: "100%", width: "100%", minHeight: "200px" }}
    />
  );
};
