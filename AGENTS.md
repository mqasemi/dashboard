# Project: General-Purpose Admin Panel (Angular 20 + ng-alain + PWA + RTL)

This file contains the fixed project rules and must be followed throughout development. This is a **general, reusable admin panel** — not a project tied to a specific business domain — so no business-specific modules (e.g. Payments or Logistics) are built into the base structure.

## Your Role (Agent)
You are a Senior Angular Developer and ng-alain expert. Write clean, modular, error-free code using modern Angular 20 features. At each step, generate the necessary code and terminal commands, then wait for my confirmation before moving to the next step.

## Coding Standards (mandatory)
- **Standalone only**: Use Standalone Components / Directives / Pipes. Do not generate or use NgModule for features.
- **State with Signals**: Use `signal` / `computed` / `effect` for local and global state where applicable, preferring them over RxJS `BehaviorSubject`.
- **DI with inject()**: Always use the `inject()` function instead of constructor injection.
- **Strict Typing**: `any` is forbidden. Define explicit interfaces/types for all data models, API responses, and function parameters.
- **Clean Architecture**: Components stay presentation-focused; business logic and API calls live in injectable services.
- **Lint/Format**: Use ESLint (default Angular ESLint config) and Prettier. Output must be lint-clean before a step is considered done.
- **Testing**: Write at least unit tests (Jasmine/Karma or Jest) for core services (Auth, Interceptors). Not everything needs tests, but sensitive logic (auth, refresh token) must be covered.

## Tech Stack
- Framework: Angular 20 (Standalone + Signals)
- UI: ng-alain (based on NG-ZORRO / Ant Design)
- Styling: Less
- Language & Direction: Persian (fa-IR), Right-to-Left (RTL)
- Calendar: Jalali (Persian) calendar for all date-pickers and date displays (choose a library compatible with ng-zorro's date-picker, e.g. jalali-moment or equivalent, and document the choice)
- Numbers: Persian digit display where it improves UX (should be toggleable)
- PWA: Service Worker
- Testing: Jasmine/Karma or Jest (agent's choice in Step 1, with reasoning)

## RTL & Persian
- `dir="rtl"` and `lang="fa"` in `src/index.html`.
- ng-alain theme configured for RTL (RTL-specific CSS classes and `@delon/theme` config).
- All UI text and labels in Persian.
- Dates are displayed using the Jalali calendar; service input/output should stay ISO (Gregorian) for API compatibility, with conversion happening only at the presentation layer.

## Responsiveness (Mobile-First)
- On small screens, the sidebar automatically collapses into a Drawer.
- Tables (`st`) have horizontal scrolling on mobile (`[scroll]="{ x: '1000px' }"`).
- Forms opened in Drawers are full-width (100%) on mobile.

## Layout System (3 modes)
1. **Right Sidebar (default)**: `LayoutBasicComponent` with the sidebar on the right (since it's RTL), logo at the top, collapsible submenus, header bar above content.
2. **Top Navigation**: Horizontal menu in the header, logo on the right side of the header, menu items next to it.
3. **Masonry Grid (custom)**: Blank layout (no main sidebar/header); app sections rendered as square tile cards (like Windows 8 tiles) in a responsive grid (`nz-row`/`nz-col`) with an `nz-icon` and Persian title; clicking a card navigates to the corresponding route.

**Layout persistence**: The selected mode is saved in `localStorage` and read/applied automatically on app bootstrap.

## Authentication (JWT + Refresh Token)
- JWT for the access token.
- Full refresh-token flow: an HTTP Interceptor automatically fetches a new access token using the refresh token when the current one expires, then retries the original request.
- Concurrent requests during a refresh must not trigger multiple simultaneous refresh calls (queue/lock them).
- Token storage: decide between `httpOnly cookie` vs. secure storage in Step 4 and confirm with me (suggested default: access token in memory/signal, refresh token in an httpOnly cookie if the backend allows it).
- Route Guards (functional `canActivate` guards, Angular 20 style) based on auth state and user role.
- Since there's no real API yet, this is implemented and documented against a mock service so it can later be wired to a real API.

## PWA
- Use `@angular/service-worker`.
- Configure `ngsw-config.json` to cache the App Shell (HTML/CSS/JS) for offline support.
- Freshness strategy for API requests.
- `manifest.webmanifest`: name "داشبورد مدیریت", theme color `#1890ff`, 192x192 and 512x512 icons, `display: standalone`.

## Folder Structure (general — no business domain baked in)
```
src/
├── app/
│   ├── core/           # Singleton services, Interceptors, Auth Guards, App Initializers
│   ├── layout/         # Layout components (Basic, TopNav, Portal/Masonry)
│   ├── shared/         # Reusable UI components, Pipes, Directives (Standalone)
│   ├── routes/         # Feature modules
│   │   ├── dashboard/  # Analytics and charts
│   │   ├── users/      # User & role management
│   │   └── portal/     # Masonry grid entry page
│   └── app.routes.ts   # Main standalone routing configuration
└── styles.less          # Global styles & Ant Design overrides (theme-variables.less)
```
> Note: `routes/users` is a generic CRUD example meant to establish the standard pattern for building a new feature. Future business modules (whatever they turn out to be) get added under `routes/` following this same pattern.

## UI/UX Design Tone
Minimal, sophisticated, enterprise-grade. Avoid clutter. Generous whitespace, subtle borders, standard Ant Design typography. No heavily saturated colors outside the primary brand color (`#1890ff`).

## Execution Plan (step by step — wait for confirmation after each step)
1. **Setup**: Create the Angular project, add ng-alain, add PWA, choose and install a test framework (Jasmine/Karma or Jest), configure ESLint/Prettier. (CLI commands only)
2. **RTL & Theme**: Persian/RTL settings in `index.html` and Less files. Set ng-alain theme direction. Add the Jalali calendar library.
3. **Layouts**: Configure `LayoutBasicComponent` for the right sidebar, set up Top Navigation mode, build `PortalComponent` for the Masonry grid, implement `localStorage` layout persistence.
4. **Core & Auth**: Implement the HTTP Interceptor for JWT + full refresh-token flow (against a mock API). Base API services. Route Guards.
5. **Dashboard**: Build the dashboard with responsive stat cards and charts (mock data).
6. **User Management CRUD**: Build a sample user-management module with a mobile-friendly table and full-screen form, as the standard pattern for future features.
7. **Final Testing**: Verify RTL accuracy, test layout switching, test mobile responsiveness, test PWA offline mode, run unit tests.

Each step must build and run independently; wait for my explicit confirmation before moving to the next step.
## Implementation Details & Technical Constraints (Added during development)
Do not modify or override these technical decisions without explicit permission. They exist to solve specific framework quirks.

- **Build Memory Limit:** The ng-alain scaffold requires more memory. Always use `npm run build` (which applies `--max_old_space_size=8000`) instead of bare `ng build`.
- **Jalali Calendar Workaround (CRITICAL):** 
  - `date-fns` is aliased to `npm:date-fns-jalali@^2.30.0-0` in package.json.
  - A postinstall script (`scripts/dedupe-date-fns.mjs`) ensures no duplicate Gregorian `date-fns` exists in node_modules. 
  - ALWAYS import from `'date-fns-jalali'`, never `'date-fns'`. Do not "simplify" this with npm overrides, or the Persian calendar will break.
- **Dynamic Icons:** Any `nz-icon` referenced dynamically by string (e.g., in menus or `LAYOUT_MODE_META`) MUST be registered in `src/style-icons.ts` (or `style-icons-auto.ts`), otherwise they will render blank.
- **Mock API Environment:** We use `@delon/mock`. Add endpoints as `_mock/*.ts` files exported from `_mock/index.ts`. Mock login uses `admin` / `ng-alain.com`.
- **Path Aliases:** Use standard barrels: `@core`, `@shared`, `@env/*`, `@_mock`.
- **Prettier & Git:** `.gitattributes` forces `eol=lf` repo-wide to prevent Windows `autocrlf` corruption. Prettier is set to print width 140.