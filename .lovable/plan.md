

## Plan: Plus Code Address, Pricing/Zone Map, and Admin Services Management

### 1. Customer Plus Code Address Support

**Changes:**
- Add `plus_code` column (text, nullable) to `profiles` table
- Update `AdminCustomerDetail.tsx` to show/edit Plus Code field alongside address
- Update `CompleteProfile.tsx` to optionally accept Plus Code
- When a Plus Code is present, use it to generate an OpenStreetMap/Google Maps embed link

### 2. Admin Pricing Management (per km, weight, add-ons, zone pricing)

**Database:**
- Create `pricing_config` table: `id`, `key` (text, unique — e.g. `base_fee`, `per_km_rate`, `per_kg_rate`, `min_fee`), `value` (numeric), `label` (text), `updated_at`
- Create `pricing_addons` table: `id`, `name` (text), `price` (numeric), `is_active` (boolean), `display_order` (int)
- Create `pricing_zones` table: `id`, `name` (text), `center_lat` (float), `center_lng` (float), `radius_km` (float), `multiplier` (numeric, default 1.0), `color` (text), `is_active` (boolean)
- All tables: RLS admin-only for management, public read for pricing display
- Seed default pricing values (base_fee=30, per_km_rate=10, per_kg_rate=5, min_fee=20)

**New component: `src/components/admin/AdminPricing.tsx`**
- **Rate Settings tab:** Edit base fee, per-km rate, per-kg rate, minimum fee
- **Add-ons tab:** CRUD list of extra add-on charges (e.g. "Fragile handling", "Express", "Insurance")
- **Zone Pricing tab:** Embedded Ukhrul Google Maps iframe (using the provided embed URL). Display zones as a list with name, radius, multiplier. Admin can add/edit/delete zones. Show zone details alongside the map. The map serves as a visual reference — zone circles are rendered as an overlay description (since we can't draw on an iframe, we'll show zone info cards next to the map)

**Route:** `/admin/pricing` in `App.tsx`
**Nav:** Add "Pricing" item under Management in `AdminLayout.tsx`

### 3. Admin Services Management (Real-time Order Processing)

**Database:**
- Create `service_types` table: `id`, `name` (text), `description` (text), `icon` (text), `base_price` (numeric), `is_active` (boolean), `display_order` (int), `created_at`
- Create `live_orders` table: `id`, `user_id` (uuid), `service_type_id` (uuid), `pickup` (text), `dropoff` (text), `status` (text — `new`, `accepted`, `in_progress`, `completed`, `cancelled`), `notes` (text), `estimated_fee` (numeric), `assigned_to` (text), `created_at`, `updated_at`
- Enable realtime on `live_orders` via `ALTER PUBLICATION supabase_realtime ADD TABLE public.live_orders`
- RLS: admin manages all, users can read/insert own

**New component: `src/components/admin/AdminServices.tsx`**
- **Service Types tab:** CRUD for service types (name, description, icon, base price, active toggle). These feed into the public Services page dynamically.
- **Live Orders tab:** Real-time view of incoming orders using Supabase realtime subscription. Shows new orders with accept/reject buttons. Admin can change status, assign driver name, update notes. Orders auto-refresh via realtime channel. Color-coded status cards (Kanban-style or table view).

**Update `src/pages/Services.tsx`:** Fetch service types from DB instead of hardcoded array.

**Route:** `/admin/services` in `App.tsx`
**Nav:** Add "Services" item under Management in `AdminLayout.tsx`

### 4. Updated useAdminData.ts

Add hooks for:
- `useAdminPricingConfig()`, `useUpdatePricingConfig()` — pricing rates
- `useAdminPricingAddons()`, `useUpsertPricingAddon()`, `useDeletePricingAddon()`
- `useAdminPricingZones()`, `useUpsertPricingZone()`, `useDeletePricingZone()`
- `useAdminServiceTypes()`, `useUpsertServiceType()`, `useDeleteServiceType()`
- `useAdminLiveOrders()` — with realtime subscription
- `useUpdateLiveOrder()` 

### Files Summary

**New files:**
- `src/components/admin/AdminPricing.tsx`
- `src/components/admin/AdminServices.tsx`

**Edited files:**
- `src/components/admin/AdminLayout.tsx` — add Pricing + Services nav items
- `src/components/admin/AdminCustomerDetail.tsx` — add Plus Code field
- `src/pages/CompleteProfile.tsx` — add optional Plus Code input
- `src/pages/Services.tsx` — fetch service types from DB
- `src/hooks/useAdminData.ts` — add all new hooks
- `src/App.tsx` — add `/admin/pricing` and `/admin/services` routes

**Database migration:**
- Add `plus_code` to `profiles`
- Create `pricing_config`, `pricing_addons`, `pricing_zones`, `service_types`, `live_orders` tables with RLS
- Seed default pricing config values
- Enable realtime on `live_orders`

