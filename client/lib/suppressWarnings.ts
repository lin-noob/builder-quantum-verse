// 临时抑制Recharts库的defaultProps警告
// 这些警告来自第三方库，不影响功能

const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];

  // 抑制Recharts的defaultProps警告
  if (typeof message === 'string') {
    if (message.includes('Support for defaultProps will be removed from function components') ||
        message.includes('XAxis') ||
        message.includes('YAxis')) {
      return;
    }
  }

  // 保留其他所有警告
  originalWarn(...args);
};

// 同时抑制可能出现在console.error中的类似警告
console.error = (...args) => {
  const message = args[0];

  if (typeof message === 'string') {
    if (message.includes('Support for defaultProps will be removed from function components') ||
        message.includes('XAxis') ||
        message.includes('YAxis')) {
      return;
    }
  }

  originalError(...args);
};

export {}; // 确保这是一个模块
