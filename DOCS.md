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
- inventory page now fully integrated with `/inventory` API for list + stock adjustments.
- performance optimizations:
  - sparepart inventory list is lazy-loaded on focus to keep detail modal light.
  - service detail and parts are fetched in parallel when opening the modal.

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
