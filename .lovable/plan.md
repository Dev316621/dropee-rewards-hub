

## Plan: Admin Enhancements, Google Auth, Premium Spin Wheel, and Delivery Management

This is a large, multi-part implementation. Here is the breakdown organized by feature area.

---

### 1. Google Sign-In + Profile Completion Flow

**Database Changes:**
- Add `address` column to `profiles` table (text, nullable)
- Add `profile_completed` boolean column to `profiles` (default false), set true when user fills in all details
- Update the `handle_new_user` trigger to set `profile_completed = false` for Google signups

**Auth Configuration:**
- Enable Google OAuth via the managed Lovable Cloud provider (no API key needed)

**New Components:**
- `src/pages/CompleteProfile.tsx` — a form page that collects Full Name, Phone, Date of Birth, Home Address. Shown after first Google sign-in when profile is incomplete.
- Update `src/components/ProtectedRoute.tsx` to check `profile_completed` and redirect to `/complete-profile` if false.

**Login/Register Updates:**
- Add "Sign in with Google" button to both `Login.tsx` and `Register.tsx` using `supabase.auth.signInWithOAuth({ provider: 'google' })`

**Route:**
- Add `/complete-profile` route in `App.tsx`

---

### 2. Admin — User Management (Add Users Manually)

**AdminCustomers.tsx Updates:**
- Add an "Add User" dialog where admin enters: Full Name, Email, Phone, Password
- Use `supabase.auth.admin.createUser()` via an edge function (since admin user creation requires service role key)
- Create edge function `supabase/functions/admin-create-user/index.ts` that validates admin role, then creates user via service role

**Access Restriction:**
- The current system already requires registration. The requirement "only users added by admin or registered through Google can access" means removing the public self-registration page. Instead, we'll hide the `/register` route (remove it from nav/login page links) but keep Google sign-in available. The admin manually adds users, or users sign in via Google.
- Actually, re-reading the requirement: self-registration via email/password should be removed from the public flow. Only Google sign-up OR admin-added accounts can log in. We'll remove the Register page link from Login and keep Google as the public sign-up method.

---

### 3. Premium Spin Wheel Upgrade

**SpinWheel.tsx — Complete Rewrite of Visual Layer:**
- **Gold outer ring** with SVG gradient + small gem dots (circles) positioned around the circumference
- **Segment gradients** — each segment gets a two-tone gradient using SVG `<linearGradient>` derived from the slot color
- **Bold prize label + description** text on each segment
- **Glowing gold center hub** with a star icon (★)
- **Gold triangle needle** at top with a glowing circle, CSS animation for idle sway + spinning tick
- **Spin animation**: 8-13 full rotations, cubic-bezier easing with bounce at end. Duration ~6-8 seconds.
- **Particle effects**: floating colored circles using framer-motion during spin
- **Pulsing glow backdrop** behind wheel during spin
- **Prize pills** below the wheel showing all prizes; winning pill gets a glow highlight
- **Win popup**: 500ms delay after stop, confetti burst, smooth scale-in animation with celebration emoji + prize name + button

---

### 4. Enhanced Delivery Management (New Admin Feature)

**Database Changes:**
- Add columns to `deliveries` table: `recipient_name` (text), `description` (text), `receipt` (text), plus update status enum to include `out_for_delivery`
- Add `address` column to `profiles` (already planned above)
- Create `location_requests` table: `id`, `delivery_id`, `user_id`, `token` (unique text), `latitude`, `longitude`, `status` (pending/completed), `created_at`, `completed_at`
- RLS: admin can manage all, users can read/update own location requests

**AdminDeliveries.tsx Overhaul:**
- New delivery form with: recipient name, description, status (Pending / Out for Delivery / Delivered), receipt text area
- Each delivery row shows: recipient, description, status, date, and action buttons
- **Receipt page**: Dialog/modal showing full delivery details formatted for printing (with `window.print()` button)
- **WhatsApp button**: Opens `https://wa.me/{phone}?text={encoded_message}` with delivery details pre-filled. Phone comes from the user's profile.
- **Location request**: Admin clicks "Request Location" → creates a `location_requests` row with unique token → generates a shareable link → WhatsApp send with that link

**New Page: Location Share**
- `src/pages/ShareLocation.tsx` — public page at `/share-location/:token`
- Requests browser geolocation permission, captures coordinates, sends them back to `location_requests` table
- No auth required (token-based access)

**Admin Map View:**
- When location is captured, show coordinates in the delivery detail view using a simple embedded map (OpenStreetMap iframe or static image link — no API key needed)

**Route additions:**
- `/share-location/:token` (public, no auth)

---

### 5. Files to Create/Edit Summary

**New Files:**
- `src/pages/CompleteProfile.tsx`
- `src/pages/ShareLocation.tsx`  
- `supabase/functions/admin-create-user/index.ts`

**Edited Files:**
- `src/pages/Login.tsx` — add Google sign-in button, remove register link
- `src/pages/Register.tsx` — remove or redirect (admin-only creation now)
- `src/components/ProtectedRoute.tsx` — profile completion check
- `src/components/dashboard/SpinWheel.tsx` — premium redesign
- `src/components/admin/AdminDeliveries.tsx` — full overhaul with receipt, WhatsApp, location
- `src/components/admin/AdminCustomers.tsx` — add user dialog
- `src/hooks/useAdminData.ts` — add admin user creation hook, delivery updates
- `src/hooks/useSpinWheel.ts` — adjust rotation count (8-13)
- `src/App.tsx` — new routes
- `src/contexts/AuthContext.tsx` — no changes needed

**Database Migration:**
- Add `address`, `profile_completed` to `profiles`
- Add `recipient_name`, `description`, `receipt` to `deliveries`
- Create `location_requests` table with RLS
- Update status options

---

### Technical Considerations
- Google OAuth uses Lovable Cloud's managed credentials — no setup needed
- The edge function for admin user creation uses `SUPABASE_SERVICE_ROLE_KEY` (already in secrets)
- WhatsApp integration is purely client-side URL construction — no API needed
- Location sharing uses the browser Geolocation API with a token-based public page
- Map display uses OpenStreetMap embed (free, no key)
- Spin wheel particles use framer-motion for performance
- All new tables get proper RLS policies

