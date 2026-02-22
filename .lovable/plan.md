

# DROPEE — Remaining Build Phases

Phase 1 (public pages, design system, routing) is already complete. Here are the 6 remaining phases needed to finish the entire system.

---

## Phase 2: Database Schema & Authentication

**Goal:** Set up the full database, roles, auth flows, and protected routing.

**Database tables to create:**
- `profiles` — user info (name, phone, DOB, referral_code, created_at)
- `user_roles` — role enum (admin, user) with RLS + `has_role()` security definer function
- `tiers` — tier definitions (name, min_deliveries, max_deliveries, perks JSON)
- `deliveries` — delivery records (user_id, pickup, dropoff, weight, fee, status, points_earned, is_free, created_at)
- `loyalty_points_log` — every point change (user_id, amount, source, delivery_id, spin_id, note, created_at)
- `free_delivery_credits` — user_id, total credits, used credits
- `coupons` — code, type, value, expiry, max_uses, uses, assigned_user_id, is_public
- `coupon_redemptions` — coupon_id, user_id, redeemed_at
- `spin_config` — daily/weekly enable, max_spins, reset rules
- `spin_slots` — label, prize_type, prize_value, probability_weight, color, icon, coupon_expiry_days, active, spin_type (daily/weekly)
- `spin_results` — user_id, spin_type, slot_id, prize_type, prize_value, created_at
- `partners` — name, logo_url, description, link, discount_code, is_featured, display_order
- `blog_posts` — title, slug, category, content, image_url, video_url, is_pinned, status, scheduled_at, published_at
- `offers` — title, description, image_url, valid_from, valid_to, is_weekly_highlight
- `badges` — name, description, icon, condition_type, condition_value
- `user_badges` — user_id, badge_id, earned_at
- `notifications` — user_id, type, title, message, is_read, created_at
- `loyalty_settings` — key/value config table (welcome_bonus, referral_bonus, mystery_box_threshold, double_points_enabled, double_points_multiplier, double_points_start, double_points_end, event_name)
- `referrals` — referrer_id, referred_id, bonus_awarded

**RLS policies:** Per-table policies using `has_role()` for admin access and `auth.uid()` matching for user access.

**Auth pages to build:**
- `/login` — email/password login form
- `/register` — signup form (name, phone, email, password)
- `/admin/login` — admin login (separate route, hidden from nav)
- `/forgot-password` — request reset email
- `/reset-password` — set new password (handles recovery token)
- Auth context provider wrapping the app
- Protected route wrappers for `/dashboard/*` and `/admin/*`

**Triggers:**
- On `auth.users` insert: auto-create `profiles` row + assign 'user' role
- On delivery status change to 'completed': auto-credit 2 loyalty points + check tier upgrade

---

## Phase 3: User Dashboard (Core)

**Goal:** Build the gamified customer dashboard with all data-driven sections.

**Pages/components:**
- `/dashboard` — main overview layout with sidebar/bottom nav
- Dashboard Overview Panel: animated counters (deliveries, fees, points, tier badge), next-tier progress bar, free delivery tracker with walking animation, streak counter, referral link + copy button, Spin Wheel CTA card
- Delivery History section: paginated table with filters (date, status), invoice download (printable view)
- Loyalty & Rewards section: points balance display, points economy info, full points history log, "Redeem 20 pts" button with confirmation modal + confetti, active coupons list with copy + expiry countdown, claimed rewards history
- Graphs section: delivery count over time (bar chart), money spent vs saved (area chart), points progress ring, tier progression timeline stepper (all using Recharts)
- Notifications: bell icon with unread count, notification dropdown/panel, mark as read

---

## Phase 4: Gamification & Spin Wheel

**Goal:** Build all gamification elements and the full interactive spin wheel.

**Spin Wheel (`/dashboard/spin`):**
- SVG-based spinning wheel component (2-12 segments from config)
- Realistic spin physics animation (accelerate, decelerate, ease-out landing)
- 6 visual states: Idle, Spinning, Win, No-Prize, Used (countdown timer), Disabled
- Daily Spin + Weekly Mega Spin with distinct visual themes
- Server-side prize determination via edge function (anti-cheat)
- Auto-delivery of prizes (points credited, coupons generated, free delivery added)
- Win/No-Prize modals with confetti
- Spin history tab
- Share to WhatsApp button on win

**Other gamification:**
- Confetti on delivery complete / tier upgrade / spin win / redemption
- Weekly streak counter (resets Monday)
- Monthly leaderboard (top 10 by delivery count, first name + last initial)
- Unlockable badges system with achievement popup/toast
- Mystery Box reveal flow (unlocks after X deliveries)
- Walking progress animation toward free delivery
- Tier upgrade celebration (full-screen confetti + badge reveal)

---

## Phase 5: Admin Control Panel

**Goal:** Full admin panel at `/admin` with all management sections.

**Sections:**
- **Analytics Dashboard:** total users, active users, monthly deliveries, revenue graph, loyalty redemptions trend, tier distribution pie chart, user growth line chart, delivery frequency heatmap
- **Customer Management:** searchable/filterable customer list, individual profile view (history, points, tier, badges, coupons), admin actions (assign discount, upgrade/downgrade tier, issue coupon, send notification, mark PRIME, edit delivery records)
- **Delivery Management:** add new delivery for customer (triggers points + tier check), edit/delete records, mark as free, filters, CSV export
- **Loyalty & Gamification Settings:** display constants, editable tier thresholds, mystery box threshold, double point mode toggle with date range, event bonus multiplier, welcome/referral bonus config, weekly offer config, manual point adjustment with reason, redemption log
- **Spin Wheel Management:** daily/weekly spin settings (enable/disable, max spins, reset time), slot editor with live visual wheel preview, probability weights with live % display, spin analytics (totals, distribution chart, engagement rate, exportable results log)
- **Blog Management:** create/edit/delete posts with rich text, image upload, video embed, slug, category, pin, schedule, publish/draft status
- **Partner Management:** add/edit/remove partners with logo upload, featured partner toggle, reorder
- **Coupon Management:** create codes (type, value, expiry, max uses, assign to user or public), view redemption history

**Storage bucket:** Create a `public-assets` bucket for blog images, partner logos.

---

## Phase 6: Referral System, Push Notifications & SEO Polish

**Goal:** Complete the remaining systems and finalize production readiness.

- **Referral System:** generate unique referral code per user on registration, track signups via referral link, award bonus points to referrer + new user, display referral stats in dashboard, admin sees referral tree
- **Browser Push Notifications:** opt-in prompt, service worker registration, trigger push for all notification event types (delivery complete, points earned, tier upgrade, spin ready, streak reminder, mystery box, birthday delivery, coupon received, weekly offer)
- **SEO finalization:** auto-generated XML sitemap at `/sitemap.xml`, verify all pages have unique title/meta/OG/Twitter/canonical tags, `Service` schema on `/services`, `BlogPosting` schema on each blog post, Google/Bing verification meta placeholders
- **AEO FAQ additions:** add remaining FAQ items to schema markup on `/`, `/tiers`, `/policies`
- **Mobile polish:** bottom navigation bar on mobile dashboard, swipeable cards, touch-friendly targets throughout

---

## Technical Details

| Phase | Estimated Complexity | Key Dependencies |
|-------|---------------------|-----------------|
| Phase 2 | High — ~20 DB tables, auth flows, RLS | None (start here) |
| Phase 3 | High — many dashboard components, charts | Phase 2 (needs auth + tables) |
| Phase 4 | High — spin wheel game, edge function | Phase 2 + 3 (needs dashboard + tables) |
| Phase 5 | High — large admin CRUD surface | Phase 2 (needs tables + admin role) |
| Phase 6 | Medium — referrals, push, SEO polish | Phase 2-5 |

**Recommended build order:** Phase 2 → Phase 3 → Phase 5 → Phase 4 → Phase 6

Phase 5 (admin) before Phase 4 (spin wheel) because the admin spin config panel is needed to populate spin slots before the user-facing wheel can work.

