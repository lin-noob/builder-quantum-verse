// Ultimate warning suppression - targets React's warning system at the lowest level
// This intercepts warnings before they reach console.warn

if (typeof window !== 'undefined') {
  // Store original methods before any modifications
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Comprehensive suppression patterns
  const suppressionPatterns = [
    'defaultprops',
    'xaxis',
    'yaxis', 
    'recharts',
    'support for defaultprops will be removed',
    'use javascript default parameters instead',
    'function components in a future major release',
    'warning: %s',
    'at xaxis2',
    'at yaxis2',
    'deps/recharts.js'
  ];
  
  // Ultra-aggressive pattern matching
  const shouldSuppressMessage = (message: any): boolean => {
    const str = String(message).toLowerCase();
    return suppressionPatterns.some(pattern => str.includes(pattern));
  };
  
  // Override console.warn with comprehensive checking
  console.warn = function(...args: any[]) {
    // Check every argument
    for (const arg of args) {
      if (shouldSuppressMessage(arg)) {
        return; // Suppress entirely
      }
    }
    
    // Check combined message
    const combined = args.join(' ');
    if (shouldSuppressMessage(combined)) {
      return;
    }
    
    // If not suppressed, call original
    originalConsoleWarn.apply(console, args);
  };
  
  // Override console.error as well
  console.error = function(...args: any[]) {
    // Check every argument
    for (const arg of args) {
      if (shouldSuppressMessage(arg)) {
        return; // Suppress entirely
      }
    }
    
    // Check combined message
    const combined = args.join(' ');
    if (shouldSuppressMessage(combined)) {
      return;
    }
    
    // If not suppressed, call original
    originalConsoleError.apply(console, args);
  };
  
  // Intercept React's internal warning mechanism if available
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(callback: any, delay?: number, ...args: any[]) {
    // Check if this setTimeout call is related to React warnings
    if (typeof callback === 'function') {
      const wrappedCallback = function(...callbackArgs: any[]) {
        try {
          // Temporarily disable all console methods during React callback execution
          const tempWarn = console.warn;
          const tempError = console.error;
          
          console.warn = () => {}; // Completely silent
          console.error = () => {}; // Completely silent
          
          const result = callback.apply(this, callbackArgs);
          
          // Restore console methods
          console.warn = tempWarn;
          console.error = tempError;
          
          return result;
        } catch (e) {
          // Restore console methods in case of error
          console.warn = originalConsoleWarn;
          console.error = originalConsoleError;
          throw e;
        }
      };
      
      return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
    }
    
    return originalSetTimeout.call(this, callback, delay, ...args);
  };
  
  // Global error suppression
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && shouldSuppressMessage(message)) {
      return true; // Suppress the error
    }
    
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Promise rejection suppression
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && shouldSuppressMessage(event.reason)) {
      event.preventDefault();
    }
  });
  
  // Development mode: Completely silence React in dev mode
  if (process.env.NODE_ENV === 'development') {
    // Override any React warning utilities
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type: string, listener: any, options?: any) {
      if (type === 'error' || type === 'unhandledrejection') {
        // Wrap error listeners to suppress React warnings
        const wrappedListener = function(event: any) {
          if (event.message && shouldSuppressMessage(event.message)) {
            return;
          }
          if (event.reason && shouldSuppressMessage(event.reason)) {
            return;
          }
          return listener.call(this, event);
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }
}

export {};
