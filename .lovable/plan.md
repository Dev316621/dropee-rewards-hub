

## Plan: Enhanced Admin Customer Profiles, Spin Win Config, and API Order Tracking

Three feature areas to implement:

---

### 1. Admin Customer Detail Page with Full Activity View

**Current state:** AdminCustomers shows a flat table with name, phone, referral code, and join date. No way to view a customer's full profile or activity.

**Changes:**

- **New component: `src/components/admin/AdminCustomerDetail.tsx`**
  - Expandable detail view (dialog or dedicated page at `/admin/customers/:id`)
  - Shows: full name, email, phone, DOB, address, referral code, join date, profile photo
  - **Map section:** OpenStreetMap embed showing the customer's saved address (geocoded) or last known location from `location_requests`
  - **Activity summary cards:** total deliveries, completed deliveries, points balance, current tier, badges earned
  - **Delivery history table:** all deliveries for that user with status, date, fee
  - **Spin history:** recent spin results
  - **Points log:** recent loyalty points transactions
  - Admin can edit customer profile fields (name, phone, DOB, address) directly

- **Update `AdminCustomers.tsx`:** Add a "View" button per row that opens the detail view

- **Update `useAdminData.ts`:** Add hooks:
  - `useAdminCustomerDetail(userId)` — fetches profile + deliveries + points log + spin results + badges + location for one user
  - `useUpdateCustomerProfile()` — mutation to update profile fields

- **New route:** `/admin/customers/:id` in `App.tsx`

---

### 2. Admin Spin Win Configuration (Preset Wins)

**Current state:** Admin can configure spin slots with probability weights. The spin result is determined client-side via weighted random. Admin wants to "set spin wins" — meaning the admin can predetermine what a specific user wins.

**Changes:**

- **Database migration:** Create `spin_preset_wins` table:
  - `id`, `user_id` (uuid), `spin_type` (text), `slot_id` (uuid, references spin_slots), `used` (boolean, default false), `created_at`
  - RLS: admin-only management

- **Update `AdminSpin.tsx`:** Add a "Preset Wins" section where admin can:
  - Select a user from dropdown
  - Select a spin type (daily/weekly)
  - Select a slot (prize)
  - Save — this guarantees that user's next spin lands on that prize

- **Update `useSpinWheel.ts`:** Before doing weighted random, check `spin_preset_wins` for a pending preset for the current user. If found, use that slot and mark it as `used`.

- **Update `useAdminData.ts`:** Add `useAdminPresetWins()`, `useCreatePresetWin()`, `useDeletePresetWin()` hooks

---

### 3. API Integration Feature — External Order Tracking

**Current state:** No API integration capability exists.

**Changes:**

- **Database migration:** Create `api_integrations` table:
  - `id`, `name` (text), `base_url` (text), `api_key_encrypted` (text), `headers_json` (jsonb), `is_active` (boolean), `created_at`, `updated_at`
  - RLS: admin-only

- Create `tracked_orders` table:
  - `id`, `integration_id` (uuid, references api_integrations), `user_id` (uuid), `external_order_id` (text), `status` (text), `last_response` (jsonb), `tracking_url` (text), `last_checked_at` (timestamptz), `created_at`
  - RLS: admin can manage all, users can read own

- **New admin component: `src/components/admin/AdminApiIntegrations.tsx`**
  - Admin can add/edit/delete API integrations (name, base URL, API key, custom headers)
  - Admin can create tracked orders: select integration, select user, enter external order ID and tracking endpoint path
  - "Check Status" button that calls an edge function to fetch the external API and update `last_response`
  - Display tracked orders table with status, last checked time, raw response preview

- **New edge function: `supabase/functions/track-order/index.ts`**
  - Accepts `integration_id` and `order_id`
  - Fetches the integration config from DB (using service role)
  - Makes GET request to `{base_url}/{endpoint}` with stored API key/headers
  - Updates `tracked_orders.last_response` and `status`
  - Returns the result

- **User dashboard update:** Add a small "My Orders" section in `DashboardOverview.tsx` showing tracked orders for the logged-in user with status and tracking link

- **New route:** `/admin/api-integrations` in `App.tsx`
- **Update `AdminLayout.tsx`:** Add "API Tracking" nav item under Management section

---

### Files Summary

**New files:**
- `src/components/admin/AdminCustomerDetail.tsx`
- `src/components/admin/AdminApiIntegrations.tsx`
- `supabase/functions/track-order/index.ts`

**Edited files:**
- `src/components/admin/AdminCustomers.tsx` — add View button per row
- `src/components/admin/AdminSpin.tsx` — add preset wins section
- `src/components/admin/AdminLayout.tsx` — add nav items
- `src/components/dashboard/DashboardOverview.tsx` — add tracked orders section
- `src/hooks/useAdminData.ts` — add customer detail, preset wins, API integration hooks
- `src/hooks/useSpinWheel.ts` — check preset wins before random
- `src/App.tsx` — add new routes

**Database migration:**
- Create `spin_preset_wins`, `api_integrations`, `tracked_orders` tables with RLS
- Enable realtime on `tracked_orders` for live status updates

