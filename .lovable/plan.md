

## Central Order Hub — Implementation Plan

This is a significant feature set. Since Lovable runs React + Supabase (not Node.js/Express), we'll adapt the architecture to use **Supabase Edge Functions** as the API backend, **Supabase Realtime** for live updates (equivalent to Socket.io), and the existing **React admin panel** for the dashboard. This delivers identical functionality with the available stack.

---

### Architecture Overview

```text
External Websites ──(POST + API key)──► Edge Function "hub-receive-order"
                                              │
                                              ▼
                                    Supabase DB (hub_orders, hub_order_status_log)
                                              │
                                     Realtime subscription
                                              │
                    ┌─────────────────────────┼────────────────────┐
                    ▼                         ▼                    ▼
           Admin Dashboard           External site              Agent app
           (/admin/hub)              (listens via               (future)
                                      Realtime channel)
```

---

### 1. Database Tables (Migration)

**`hub_websites`** — registered external websites
- `id`, `name`, `label_color`, `api_key` (unique, generated UUID), `is_active`, `created_at`
- RLS: admin-only management

**`hub_delivery_agents`** — delivery agents
- `id`, `name`, `phone`, `is_active`, `created_at`
- RLS: admin-only management

**`hub_orders`** — all inbound orders
- `id` (Hub Order ID), `website_id` (FK → hub_websites), `external_order_id`, `customer_name`, `customer_phone`, `customer_address`, `items` (jsonb — array of {name, qty, price}), `total`, `notes`, `status` (default 'pending'), `assigned_agent_id` (FK → hub_delivery_agents, nullable), `created_at`, `updated_at`
- RLS: admin-only full access; read via edge function for external sites
- Enable Realtime publication

**`hub_order_status_log`** — audit trail
- `id`, `order_id` (FK → hub_orders), `old_status`, `new_status`, `changed_by` (text — admin email or 'system'), `changed_at`
- RLS: admin-only

**Status enum values**: pending, confirmed, preparing, picked_up, on_the_way, delivered, cancelled

### 2. Edge Function: `hub-receive-order`

- `verify_jwt = false` (external sites won't have Supabase auth)
- Validates `x-api-key` header against `hub_websites.api_key`
- Accepts POST body: `{ external_order_id, customer_name, customer_phone, customer_address, items, total, notes }`
- Inserts into `hub_orders`, returns `{ hub_order_id }`
- Also supports GET with `?hub_order_id=...` for status polling

### 3. Edge Function: `hub-update-status`

- Admin-authenticated (JWT verified)
- Accepts `{ order_id, new_status }`
- Updates `hub_orders.status`, inserts into `hub_order_status_log`
- Realtime automatically pushes the change to all subscribers

### 4. Admin UI: API Key Management (`/admin/hub-websites`)

- Table of registered websites with name, colored label preview, API key (masked), active toggle
- Generate new website + API key (random UUID)
- Revoke (deactivate) or regenerate key
- Added to admin sidebar under "Management"

### 5. Admin UI: Hub Orders Dashboard (`/admin/hub`)

- Real-time table of all hub orders using Supabase Realtime subscription on `hub_orders`
- Columns: website source (colored badge), Hub Order ID, customer name, items summary, total, status, assigned agent, time
- **Filters**: website source dropdown, status dropdown, date range
- **Order detail dialog**: full item list, customer address, status change buttons, full status history from `hub_order_status_log`
- **Assign agent**: dropdown of `hub_delivery_agents`
- **Change status**: dropdown with all valid statuses, triggers edge function

### 6. Admin UI: Delivery Agents (`/admin/hub-agents`)

- CRUD table for agents (name, phone, active toggle)
- Simple add/edit/delete dialog

### 7. Realtime for External Sites

External websites can subscribe to order updates via Supabase Realtime JS client using the anon key, filtered by their `website_id`. The hub_orders table will be added to `supabase_realtime` publication. External sites would use:
```js
supabase.channel('hub-orders')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'hub_orders', filter: `website_id=eq.THEIR_WEBSITE_ID` }, callback)
  .subscribe()
```

RLS policy will allow SELECT on `hub_orders` for anon role filtered by website_id (using a simple policy or the API key approach via an RPC).

---

### Files to Create/Edit

| File | Action |
|---|---|
| Migration SQL | Create 4 tables, enable realtime |
| `supabase/functions/hub-receive-order/index.ts` | New edge function |
| `supabase/functions/hub-update-status/index.ts` | New edge function |
| `supabase/config.toml` | Add function configs |
| `src/components/admin/AdminHubOrders.tsx` | New — main hub dashboard |
| `src/components/admin/AdminHubWebsites.tsx` | New — API key management |
| `src/components/admin/AdminHubAgents.tsx` | New — agent management |
| `src/hooks/useHubData.ts` | New — queries + realtime hooks |
| `src/App.tsx` | Add 3 new admin routes |
| `src/components/admin/AdminLayout.tsx` | Add hub nav items |

### Implementation Order

1. Database migration (4 tables + realtime)
2. Edge functions (receive-order, update-status)
3. Hub data hooks with realtime subscriptions
4. Admin hub orders dashboard with filters and detail view
5. API key management page
6. Delivery agents page
7. Wire up routes and navigation

