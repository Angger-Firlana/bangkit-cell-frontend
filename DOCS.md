# Integrations & Architecture Updates

## Frontend
- aligned service pages with Laravel `/api/v1` payloads:
  - uses hooks for service jobs, inventory, POS, reports, phone marketplace.
  - hooks expose pagination, filters, loaders (see `src/hooks/*`).
  - shared components (`PageHeader`, `EmptyState`, `StatusPill`, `Pagination`) keep UI consistent.
  - pages now drive data through hooks and show dynamic filters (`ServicePage`, `InventoryPage`, `ReportsPage`, `POSPage`, `PhoneMarketplace`).
  - standardized types/services to mirror backend (payment methods, reports, service job statuses).
  - `usePOS` pulls payment methods from backend instead of hard-coded list.

## Backend
- added phone marketplace endpoints (`GET /phones`, `POST /phones`, `PATCH /phones/{id}/sold`, `/phones/statuses`). Implementation in `ListingPhoneService` supports search/status filters and pagination.
- exposed payment-methods (`GET /payment-methods`) plus related controller, routes, and seed data reference.
- allowed service job list pagination by forwarding `per_page` parameter.
- new phone-specific form requests for validation; re-used `Status` catalog for listing states.

## Next Steps (if needed)
1. Wire `PhoneMarketplace` detail modal (images/status updates) once upload APIs exist.
2. Add backend caching or query optimization for reporting endpoints.
3. Hook POS checkout to receipt printing/upstream analytics if available.
