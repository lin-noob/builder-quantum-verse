// 临时抑制Recharts库的defaultProps警告
// 这些警告来自第三方库，不影响功能

(() => {
  const originalWarn = console.warn;

  console.warn = function(...args) {
    // 检查第一个参数是否包含特定的警告文本
    const message = String(args[0] || '');

    // 具体抑制Recharts的defaultProps警告
    if (message.includes('Support for defaultProps will be removed from function components') &&
        (message.includes('XAxis') || message.includes('YAxis'))) {
      return;
    }

    // 保留所有其他警告
    originalWarn.apply(console, args);
  };
})();

export {};
