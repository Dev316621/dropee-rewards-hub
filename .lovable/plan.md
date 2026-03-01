
# Fix Navigation: Seamless Access Between Public Pages and Dashboard

## Problem
1. **Navbar always shows "Log In"** even when you're already logged in -- so visiting public pages feels like you're logged out.
2. **No way to go from Dashboard back to Home** (desktop sidebar has no Home link).
3. **Login page doesn't redirect** logged-in users to the dashboard, so visiting `/login` while authenticated shows the login form again.

## Solution

### 1. Make Navbar auth-aware
- Import `useAuth` in `Navbar.tsx`
- When logged in: replace "Log In" / "Track Deliveries" buttons with **"Dashboard"** button (both desktop and mobile)
- When logged out: keep existing "Log In" / "Track Deliveries" buttons

### 2. Add "Home" link to Dashboard Sidebar
- Add a link to `/` (Home) at the top of the sidebar nav items so desktop users can navigate back to public pages without using the browser back button

### 3. Redirect logged-in users away from Login page
- In `Login.tsx`, check `useAuth()` -- if the user is already authenticated, redirect to `/dashboard` immediately
- Same for `Register.tsx`

## Files to Change

| File | Change |
|---|---|
| `src/components/Navbar.tsx` | Use `useAuth()` to conditionally show "Dashboard" vs "Log In" buttons |
| `src/components/dashboard/DashboardSidebar.tsx` | Add a "Home" nav item linking to `/` |
| `src/pages/Login.tsx` | Redirect to `/dashboard` if already logged in |
| `src/pages/Register.tsx` | Redirect to `/dashboard` if already logged in |

## Technical Details

**Navbar.tsx** -- wrap the right-side buttons in a conditional:
```tsx
const { user } = useAuth();
// If user exists, show "Dashboard" link; otherwise show "Log In"
```

**Login.tsx / Register.tsx** -- add early redirect:
```tsx
const { user, isLoading } = useAuth();
if (!isLoading && user) return <Navigate to="/dashboard" replace />;
```

**DashboardSidebar.tsx** -- add Home icon link to `/` at the bottom or top of the nav list so users can browse public pages while staying logged in.
