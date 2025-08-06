// 临时抑制Recharts库的defaultProps警告
// 这些警告来自第三方库，不影响功能

const originalWarn = console.warn;

console.warn = (...args) => {
  const message = args[0];
  
  // 抑制Recharts的defaultProps警告
  if (
    typeof message === 'string' && 
    (message.includes('Support for defaultProps will be removed from function components') &&
     (message.includes('XAxis') || message.includes('YAxis')))
  ) {
    return;
  }
  
  // 保留其他所有警告
  originalWarn(...args);
};

export {}; // 确保这是一个模块
