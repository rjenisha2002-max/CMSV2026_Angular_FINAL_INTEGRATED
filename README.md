# InfinityCoderzz CMS — Angular Frontend

Angular 20 (standalone components) frontend for the `InfinityCoderzz_CMSV2026_WebAPI`
backend, covering all four modules: **Doctor**, **Lab Technician**, **Receptionist**,
and **Pharmacist**. Structure and styling conventions (feature folders, `services/`,
Bootstrap 4 + font-awesome) follow the provided `PropelFeb2026-emsv26` reference project.

## 1. Run the backend first

The API uses a **session cookie**, not a JWT, so the Angular app and the API must
run on origins the cookie can travel between:

```
cd InfinityCoderzz_CMSV2026_WebAPI/InfinityCoderzz_CMSV2026
dotnet dev-certs https --trust   # first time only, so the browser accepts the dev cert
dotnet run --launch-profile https
```

This starts the API at `https://localhost:7037`. **Use the `https` profile** — the
session cookie is configured `SameSite=None; Secure`, which browsers only send on
HTTPS. The plain `http` profile will silently drop the cookie on cross-origin calls
from Angular.

Two things were changed in `Program.cs` for this to work (both already applied
in the zip you have):
- CORS now allows `http://localhost:4200` / `https://localhost:4200`
  **with credentials** (the old `AllowAnyOrigin()` policy is incompatible with
  cookies and would silently break login from Angular).
- The session cookie is `SameSite=None; Secure` instead of `Lax`, so it survives
  a cross-origin fetch from the Angular dev server.

## 2. Run the Angular app

```
npm install
ng serve
```

Visit `http://localhost:4200`. `src/environments/environment.ts` points at
`https://localhost:7037/api` — update it if you run the API on a different port,
and update `environment.prod.ts` before building for production.

## 3. Login

Uses the shared `POST /api/login` endpoint for all four roles (Doctor, Lab
Technician, Receptionist, Pharmacist) — same as the backend's unified
`LoginController`. On success the app stores `roleName`/`fullName` in
`localStorage` (routing/menu only, **not** used for auth — the session cookie is
what actually authenticates every API call) and redirects to the matching
dashboard.

If you don't have login credentials seeded yet, see the note in
`InfinityCoderzz_CMSV2026_WebAPI`'s own README, or insert a user directly:

```sql
UPDATE dbo.Users
SET PasswordHash = CONVERT(varchar(32), HASHBYTES('MD5', 'YourPassword123'), 2)
WHERE Username = 'your_username';
```

## 4. Project structure

```
src/app/
  auth/login/            Login screen (calls POST /api/login)
  guards/                authGuard (must be logged in), roleGuard('Doctor'|...)
  interceptors/          credentialsInterceptor (withCredentials on every call),
                          unauthorizedInterceptor (bounces to /login on 401)
  services/              One service per backend controller group:
                          auth-service, doctor-service, lab-service,
                          reception-service, pharmacy-service
  shared/header/         Role-aware top nav + logout
  shared/notfound/       404 page

  doctor/                dashboard, appointments, consultation, patient-search
  lab/                   dashboard, pending-tests, results, billing, reports,
                          patient-search
  reception/             dashboard, patients, appointments, bills, visits, reports
  pharmacy/               dashboard, medicines, medicine-stock, dispensing,
                          prescriptions, bills, logs (inventory + audit), reports
```

## 5. Route <-> API map

Each module's route prefix matches its backend controller 1:1 — e.g.
`/pharmacy/medicines` calls `GET/POST/PUT /api/pharmacist/medicines`,
`/lab/billing` calls the `/api/labtechnician/billing/...` endpoints, etc. Every
service file documents the exact endpoint(s) it calls.

## 6. Known simplifications

- Components use `any`-typed responses in most places (matches the reference
  project's own style, e.g. `login.ts`'s `(response:any)=>`) rather than a full
  parallel set of TypeScript interfaces for all ~30 backend DTOs — pragmatic for
  an app this size, but worth tightening up per-module as you build on it.
- PDF downloads (lab bill, pharmacy invoice) are plain `<a href=... target="_blank">`
  links rather than blob-fetched downloads, since the browser attaches the session
  cookie automatically on a direct navigation.
- No automated tests were scaffolded (`--skip-tests`) to keep the generated
  surface area focused on the working app; add Karma/Jasmine specs as needed.
