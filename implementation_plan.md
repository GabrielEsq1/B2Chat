# Admin Configuration Page Implementation Plan

The goal is to implement the `/admin/configuracion` page to allow Super Admins to manage system-wide settings.

## User Review Required

> [!NOTE]
> I will implement a tabbed interface for better organization.

## Proposed Changes

### New Page
#### [NEW] [src/app/admin/configuracion/page.tsx](file:///c:/Users/ASUS/Desktop/B2BChat/src/app/admin/configuracion/page.tsx)
- **Layout**: Dashboard layout with a main content area.
- **Components**:
    - **Tabs**: General, Security, Notifications, Integrations.
    - **Forms**: Inputs for system name, support email, maintenance mode toggle, etc.
- **Functionality**:
    - Fetch current settings (mocked for now or from a new `SystemSettings` model if we want to go that deep, but for now I'll use a static/mocked approach or simple file-based config if appropriate, or just a UI shell that *looks* functional until we define the backend).
    - *Decision*: I will implement the UI with a "Save" button that mocks the API call for now, unless instructed to create a database model. Given the scope, a UI shell is the best first step.

## Verification Plan

### Manual Verification
1.  Navigate to `/admin/configuracion`.
2.  Verify all tabs and inputs render correctly.
3.  Test "Save" button interaction (should show a toast/alert).
