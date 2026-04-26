What Was Fixed
Return URL preservation — before any redirect to login, the current page is saved. After re-authentication, the user is returned to exactly where they were.

Double /api prefix removed — all admin API calls corrected to /admin/users, /admin/users/:id/role, etc., matching how the baseURL is already configured.

Entra step-up authentication — a dedicated flow was built: clicking a role change dropdown always redirects to Microsoft Entra with prompt=login, forcing a fresh authentication challenge (including Entra-managed MFA like number matching). Only after Entra confirms identity does the role change execute. The step-up token is single-use — discarded immediately after each action.

Dedicated self-revert endpoint — a new POST /api/auth/revert-to-admin endpoint was added that requires identity confirmation but has no role restriction. After Entra confirms who you are, it updates your role in the database and returns a fresh JWT. The client updates its session in-place — no role assignment page involved, no deadlock.

Logout always cleans up — cleanup code (clear token, clear session storage, null the user, redirect) was moved to a finally block so it runs whether the backend API call succeeds or fails.What Was Fixed
Return URL preservation — before any redirect to login, the current page is saved. After re-authentication, the user is returned to exactly where they were.

Double /api prefix removed — all admin API calls corrected to /admin/users, /admin/users/:id/role, etc., matching how the baseURL is already configured.

Entra step-up authentication — a dedicated flow was built: clicking a role change dropdown always redirects to Microsoft Entra with prompt=login, forcing a fresh authentication challenge (including Entra-managed MFA like number matching). Only after Entra confirms identity does the role change execute. The step-up token is single-use — discarded immediately after each action.

Dedicated self-revert endpoint — a new POST /api/auth/revert-to-admin endpoint was added that requires identity confirmation but has no role restriction. After Entra confirms who you are, it updates your role in the database and returns a fresh JWT. The client updates its session in-place — no role assignment page involved, no deadlock.

Logout always cleans up — cleanup code (clear token, clear session storage, null the user, redirect) was moved to a finally block so it runs whether the backend API call succeeds or fails.