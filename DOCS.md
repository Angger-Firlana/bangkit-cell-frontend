# Integrations & Architecture Updates

## Frontend
- aligned service pages with Laravel `/api/v1` payloads:
  - uses hooks for service jobs, inventory, POS, reports, phone marketplace.
  - hooks expose pagination, filters, loaders (see `src/hooks/*`).
  - shared components (`PageHeader`, `EmptyState`, `StatusPill`, `Pagination`) keep UI consistent.
  - pages now drive data through hooks and show dynamic filters (`ServicePage`, `InventoryPage`, `ReportsPage`, `POSPage`, `PhoneMarketplace`).
  - standardized types/services to mirror backend (payment methods, reports, service job statuses).
  - `usePOS` pulls payment methods from backend instead of hard-coded list.
- service job detail modal:
  - shows customer/device info, estimated fee, service fee, and transaction summary.
  - supports Bluetooth thermal printing via Web Bluetooth.
  - includes sparepart management (list/add/remove parts) and live subtotal.
  - checkout flow updates status and creates transaction (auto-fill paid amount).
- refactored `ServicePage` into smaller components:
  - `ServiceTable`, `ServiceAddModal`, `ServiceDetailModal` live in `src/components/service/`.
  - shared UI state types extracted to `src/types/serviceUI.ts`.
- master data device management:
  - device input now supports free-text with catalog matching.
  - if device is missing, users are directed to Master Data first.
  - Master Data is available as a dedicated page (`/master-data`) and a panel inside `Settings`.
  - **New in March 2026:**
    - **Tabbed Interface:** Catalogs are now split into clean, navigable tabs for **Brand**, **Model**, and **Device**.
    - **Pagination Support:** All master data lists now include pagination (8 items per page) to ensure smooth performance even with large catalogs.
    - **Enhanced UI:** Added status icons, usage counters, and optimized the layout width (`max-w-5xl`) for better table visibility.
  - supports CRUD for brand, model, and device catalogs.
  - delete protections prevent removing brands/models that are still referenced.
  - master data lists now render as table-style rows on desktop, with cards on mobile.
- inventory page now fully integrated with `/inventory` API for list + stock adjustments.
- performance optimizations:
  - sparepart inventory list is lazy-loaded on focus to keep detail modal light.
  - service detail and parts are fetched in parallel when opening the modal.
- dashboard updates:
  - recent service activity now shows device, customer, phone, problem, estimate, and status badge.
  - activity items open a lightweight detail modal.
- added History page (`/history`) with large, simple tabs for:
  - penjualan (transactions)
  - HP second (sold units with image)
  - sparepart (transaction detail items)
  - service HP (service jobs)

## UI & UX Overhaul (March 2026)
- **Modernized Aesthetics:**
  - Transitioned from a generic layout to a custom, full-width "Glassmorphism" inspired design.
  - Integrated **Poppins** as the primary typeface for a professional look.
  - Refined color palette using **Slate** (backgrounds/text) and **Primary Blue** (actions/branding).
- **Mobile-First Responsiveness:**
  - **Dynamic Sidebar:** Responsive navigation that hides on mobile with a smooth sliding animation and backdrop.
  - **Adaptive Topbar:** Includes mobile-only menu triggers and simplified header information.
  - **POS Bottom Sheet:** Reimagined the POS cart for mobile devices using a bottom-sheet pattern for better thumb-reachability.
  - **Responsive Tables:** Inventory and Service tables now switch to a card-based view on smaller screens for readability.
- **Enhanced Component Library:**
  - **Button:** Added support for `variants` (primary, secondary, ghost, outline), `sizes`, and `isLoading` states.
  - **Input/Select:** Standardized styling with floating-label-like headers and consistent focus rings.
  - **Card:** Modernized with subtle borders, shadow-elevation, and increased corner radius (up to `3xl`).
- **Page-Specific Improvements:**
  - **Dashboard:** Completely redesigned with high-impact stat cards, visual separators, and improved information hierarchy.
  - **POS:** Optimized layout for single-screen transactions; products are more discoverable with larger tap targets.

## Backend
- added phone marketplace endpoints (`GET /phones`, `POST /phones`, `PATCH /phones/{id}/sold`, `/phones/statuses`). Implementation in `ListingPhoneService` supports search/status filters and pagination.
- exposed payment-methods (`GET /payment-methods`) plus related controller, routes, and seed data reference.
- allowed service job list pagination by forwarding `per_page` parameter.
- new phone-specific form requests for validation; re-used `Status` catalog for listing states.
- added `estimated_fee` for service jobs:
  - migration adds nullable `estimated_fee` column in `service_jobs`.
  - `StoreServiceJobRequest` validates `estimated_fee`.
  - `ServiceJobService` stores `estimated_fee` on create.
  - `ServiceJob` casts `estimated_fee` to decimal.
- added short-lived caching (15s) for frequently hit reads:
  - `ServiceJobService@show`, `ServiceJobPartService@listParts`, `InventoryService@list`.
  - cache invalidated on status updates, part mutations, checkout, and stock adjustments.

## Next Steps (if needed)
1. Wire `PhoneMarketplace` detail modal (images/status updates) once upload APIs exist.
2. Add backend caching or query optimization for reporting endpoints.
3. Hook POS checkout to receipt printing/upstream analytics if available.
4. Add richer sparepart picker (search, stock validation, and suggested qty).
