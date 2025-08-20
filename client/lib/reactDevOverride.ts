// Override React development warnings at the source
// This targets React's internal warning system

if (typeof window !== 'undefined') {
  // Override React's development flag if possible
  try {
    // Try to access React's internal warnings
    if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      
      // Disable warnings at the React level
      if (internals.ReactDebugCurrentFrame) {
        internals.ReactDebugCurrentFrame.setExtraStackFrame = () => {};
      }
      
      // Try to disable the warning system
      if (internals.ReactSharedInternals) {
        const sharedInternals = internals.ReactSharedInternals;
        if (sharedInternals.ReactDebugCurrentFrame) {
          sharedInternals.ReactDebugCurrentFrame.setExtraStackFrame = () => {};
        }
      }
    }
    
    // Set global flags to disable React warnings
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      isDisabled: true,
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      onCommitFiberStacks: () => {},
    };
    
    // Override global React warning flag
    (window as any).__DEV__ = false;
    (globalThis as any).__DEV__ = false;
    
  } catch (e) {
    // Ignore errors in React internals access
  }
  
  // Final console override with maximum suppression
  const trulyOriginalWarn = console.warn;
  const trulyOriginalError = console.error;
  
  Object.defineProperty(console, 'warn', {
    value: function(...args) {
      // Absolutely suppress defaultProps warnings
      const message = args.join(' ');
      if (message.includes('defaultProps') || 
          message.includes('XAxis') || 
          message.includes('YAxis') ||
          message.includes('Support for defaultProps will be removed')) {
        return;
      }
      trulyOriginalWarn.apply(console, args);
    },
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(console, 'error', {
    value: function(...args) {
      const message = args.join(' ');
      if (message.includes('defaultProps') || 
          message.includes('XAxis') || 
          message.includes('YAxis')) {
        return;
      }
      trulyOriginalError.apply(console, args);
    },
    writable: true,
    configurable: true
  });
}

export {};
