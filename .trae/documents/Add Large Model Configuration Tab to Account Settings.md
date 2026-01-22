I will add the "Large Model Configuration" tab to the `/account/settings` page.

1.  **Create Component**: `client/pages/Account/ModelSettings.tsx`
    *   **Features**:
        *   **Vendor Management**:
            *   Sidebar list of vendors.
            *   Add Vendor dialog: Define vendor name and custom fields (key, label, type, required, sensitive).
            *   Delete Vendor support.
        *   **Model Management**:
            *   List models for the selected vendor.
            *   Add/Edit Model.
            *   **Dynamic Form**: Render inputs based on vendor field definitions.
            *   **Actions**: Save, Test (mock), Enable/Disable.
            *   **State**: Persist to `localStorage` (simulating backend).
    *   **UI**: Use existing `shadcn/ui` components (`Card`, `Button`, `Input`, `Select`, `Switch`, `Tabs`, `Dialog`, `ScrollArea`).

2.  **Update Page**: `client/pages/Account/PersonalSettings.tsx`
    *   Import `ModelSettings`.
    *   Update `TabsList` to include a new trigger "大模型配置" (Large Model Configuration).
    *   Add `TabsContent` for the new tab.
    *   Adjust the grid layout to accommodate the new tab.

**Note**: Since the "Email Configuration" tab mentioned in the request is not present in the current `PersonalSettings.tsx` (only Profile, Security, Account), I will place the new "Large Model Configuration" tab after the "Account Information" tab.
