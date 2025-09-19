# 添加帮助文档多语言管理菜单项说明

## 操作步骤

1. 登录后台管理系统
2. 进入左侧菜单栏的"组织管理"模块
3. 点击"菜单管理"子菜单
4. 在菜单列表中找到"组织管理"父级菜单项
5. 点击"新增子菜单"按钮
6. 填写以下信息：
   - 菜单名称：帮助文档多语言
   - 路由地址：/organization/help-documents/i18n
   - 菜单图标：可以使用BookOpen或FileText图标
   - 排序：根据需要设置合适的排序值
7. 点击"保存"按钮完成添加

## 菜单配置参考

```
{
  "id": "help-document-i18n",
  "name": "帮助文档多语言",
  "path": "/organization/help-documents/i18n",
  "icon": "BookOpen",
  "parentId": "organization",
  "sort": 3,
  "visible": true
}
```

## 注意事项

1. 确保用户具有访问该页面的权限
2. 如果菜单结构有变化，可能需要调整parentId字段
3. 添加完成后刷新页面或重新登录以查看新菜单项