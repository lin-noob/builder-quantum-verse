// 临时抑制Recharts库的defaultProps警告
// 这些警告来自第三方库，不影响功能

// 保存原始的console方法
const originalWarn = console.warn;
const originalError = console.error;

// 定义要过滤的关键词
const suppressKeywords = [
  'Support for defaultProps will be removed from function components',
  'XAxis',
  'YAxis',
  'recharts'
];

// 检查是否应该抑制消息
const shouldSuppress = (message: any): boolean => {
  if (typeof message === 'string') {
    return suppressKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  return false;
};

// 重写console.warn
console.warn = (...args) => {
  if (shouldSuppress(args[0])) {
    return;
  }
  originalWarn(...args);
};

// 重写console.error
console.error = (...args) => {
  if (shouldSuppress(args[0])) {
    return;
  }
  originalError(...args);
};

// 也处理React的内部警告机制
if (typeof window !== 'undefined' && window.console) {
  const originalLog = console.log;
  console.log = (...args) => {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalLog(...args);
  };
}

export {}; // 确保这是一个模块
