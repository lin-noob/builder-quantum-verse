/**
 * 审批管理菜单配置脚本
 * 用于自动添加审批管理相关的菜单项到系统中
 */

// 审批管理菜单配置数据
const approvalMenusConfig = [
  // 主目录：审批管理
  {
    name: '审批管理',
    type: 'CATALOG',
    parentId: '0',
    icon: 'FileCheck',
    visible: 1,
    sort: 100,
    component: '',
    path: '',
    children: [
      // 子菜单：审批配置
      {
        name: '审批配置',
        type: 'MENU',
        icon: 'Settings',
        visible: 1,
        sort: 1,
        path: '/approval/config',
        component: 'Approval/ProcessTemplateManagement'
      },
      // 子菜单：审批监控
      {
        name: '审批监控',
        type: 'MENU',
        icon: 'Monitor',
        visible: 1,
        sort: 2,
        path: '/approval/monitor',
        component: 'Approval/ApprovalMonitor'
      },
      // 子菜单：模板管理
      {
        name: '模板管理',
        type: 'MENU',
        icon: 'FileTemplate',
        visible: 1,
        sort: 3,
        path: '/approval/templates',
        component: 'Approval/ProcessTemplateManagement'
      },
      // 子菜单：审批统计
      {
        name: '审批统计',
        type: 'MENU',
        icon: 'BarChart3',
        visible: 1,
        sort: 4,
        path: '/approval/statistics',
        component: 'Approval/ApprovalStatistics'
      }
    ]
  }
];

// 模拟API调用函数
async function addMenuToSystem(menuData) {
  console.log('正在添加菜单:', menuData.name);
  
  // 这里模拟API调用
  const apiUrl = '/admin/api/v1/menus';
  const requestData = {
    name: menuData.name,
    parentId: menuData.parentId,
    type: menuData.type,
    icon: menuData.icon,
    visible: menuData.visible,
    sort: menuData.sort,
    component: menuData.component || '',
    path: menuData.path || ''
  };
  
  console.log('API请求数据:', JSON.stringify(requestData, null, 2));
  
  // 模拟成功响应
  return {
    success: true,
    data: {
      id: Math.floor(Math.random() * 1000) + 1,
      ...requestData
    }
  };
}

// 主执行函数
async function configureApprovalMenus() {
  console.log('开始配置审批管理菜单...\n');
  
  try {
    for (const mainMenu of approvalMenusConfig) {
      console.log(`\n=== 添加主菜单: ${mainMenu.name} ===`);
      
      // 添加主菜单
      const mainMenuResult = await addMenuToSystem(mainMenu);
      
      if (mainMenuResult.success) {
        console.log(`✅ 主菜单 "${mainMenu.name}" 添加成功，ID: ${mainMenuResult.data.id}`);
        
        // 添加子菜单
        if (mainMenu.children && mainMenu.children.length > 0) {
          console.log(`\n--- 添加子菜单 ---`);
          
          for (const childMenu of mainMenu.children) {
            const childMenuData = {
              ...childMenu,
              parentId: mainMenuResult.data.id.toString()
            };
            
            const childResult = await addMenuToSystem(childMenuData);
            
            if (childResult.success) {
              console.log(`✅ 子菜单 "${childMenu.name}" 添加成功，ID: ${childResult.data.id}`);
            } else {
              console.log(`❌ 子菜单 "${childMenu.name}" 添加失败`);
            }
          }
        }
      } else {
        console.log(`❌ 主菜单 "${mainMenu.name}" 添加失败`);
      }
    }
    
    console.log('\n🎉 审批管理菜单配置完成！');
    console.log('\n📋 配置摘要:');
    console.log('- 主菜单: 审批管理 (目录)');
    console.log('- 子菜单: 审批配置 (/approval/config)');
    console.log('- 子菜单: 审批监控 (/approval/monitor)');
    console.log('- 子菜单: 模板管理 (/approval/templates)');
    console.log('- 子菜单: 审批统计 (/approval/statistics)');
    
  } catch (error) {
    console.error('配置过程中出现错误:', error);
  }
}

// 权限配置函数
function configurePermissions() {
  console.log('\n=== 配置权限 ===');
  
  const rolePermissions = {
    'super_admin': ['approval-management', 'approval-config', 'approval-monitor', 'approval-template', 'approval-statistics'],
    'marketing_manager': ['approval-management', 'approval-submit', 'approval-approve', 'approval-monitor', 'approval-statistics'],
    'marketing_specialist': ['approval-management', 'approval-submit', 'approval-monitor'],
    'data_analyst': ['approval-management', 'approval-monitor', 'approval-statistics']
  };
  
  console.log('角色权限配置:');
  Object.entries(rolePermissions).forEach(([role, permissions]) => {
    console.log(`- ${role}: ${permissions.join(', ')}`);
  });
}

// 执行配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    configureApprovalMenus,
    configurePermissions,
    approvalMenusConfig
  };
} else {
  // 在浏览器环境中直接执行
  configureApprovalMenus().then(() => {
    configurePermissions();
  });
}