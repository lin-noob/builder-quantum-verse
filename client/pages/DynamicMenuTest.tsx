import React from 'react';

const DynamicMenuTestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          动态菜单测试页面
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                这是一个动态加载的测试页面，用于验证菜单系统是否正常工作。
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              动态菜单特性
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 基于接口数据动态生成菜单</li>
              <li>• 支持权限控制和显示隐藏</li>
              <li>• 自动过滤管理员路径</li>
              <li>• 支持排序和层级结构</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              页面加载机制
            </h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 懒加载提升性能</li>
              <li>• 组件路径映射表</li>
              <li>• 错误处理和回退</li>
              <li>• 支持静态和动态页面混合</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-md font-medium text-yellow-800 mb-2">
            使用说明
          </h3>
          <p className="text-sm text-yellow-700">
            该页面通过 <code>/api/admin/api/v1/menus/new/route</code> 接口获取菜单数据，
            并根据返回的 component 字段动态加载对应的 React 组件。
            只有在用户登录后才会显示动态菜单项。
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicMenuTestPage;