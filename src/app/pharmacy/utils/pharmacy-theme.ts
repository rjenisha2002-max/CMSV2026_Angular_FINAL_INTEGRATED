/**
 * The pharmacy module was originally built against Bootstrap 5, Font Awesome 6,
 * the "Plus Jakarta Sans" Google font, and its own global stylesheet
 * (public/pharmacy-global.css). The rest of the app runs Bootstrap 4 /
 * Font Awesome 4, so these can't be added to index.html globally without
 * changing the look of Doctor/Reception/Lab too.
 *
 * loadPharmacyTheme() injects them into <head> and returns a Promise that
 * resolves only once every stylesheet has actually finished loading (or
 * failed), using each <link>'s native `load`/`error` events. There are no
 * arbitrary timers involved — callers that need the pharmacy CSS to be in
 * effect (e.g. before Chart.js reads canvas layout, or before first paint of
 * pharmacy-styled markup) can `await`/`.then()` the returned promise instead
 * of guessing how long the stylesheets take to arrive.
 *
 * The promise is memoized per "load session" so multiple pharmacy components
 * (layout, dashboard, bill-invoice, etc.) can all call loadPharmacyTheme()
 * without re-creating <link> tags or re-listening for load events — everyone
 * shares the same readiness signal.
 *
 * unloadPharmacyTheme() removes the tags and clears the memoized promise so
 * the next time a pharmacy route mounts, the styles are freshly (re)loaded
 * and awaited again.
 *
 * Call load in ngOnInit and unload in ngOnDestroy of any pharmacy top-level
 * route component (pharmacy-layout, bill-invoice) so the styling is only
 * ever present while a pharmacist is actually on a /pharmacy/* page.
 */
const PHARMACY_STYLE_TAGS: { id: string; href: string }[] = [
  { id: 'ph-google-font', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap' },
  { id: 'ph-bootstrap5', href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css' },
  { id: 'ph-fontawesome6', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' },
  { id: 'ph-global-css', href: '/pharmacy-global.css' }
];

// Memoized readiness promise for the current "session" of injected tags.
// Reset to null in unloadPharmacyTheme() so a later re-mount reloads fresh.
let themeReadyPromise: Promise<void> | null = null;

/**
 * Resolves once a single stylesheet <link> has finished loading (success or
 * error — a failed CDN request must not hang the whole module forever).
 * Reuses an already-injected tag from a previous loadPharmacyTheme() call
 * instead of creating a duplicate <link>, and resolves immediately if that
 * tag was already confirmed loaded.
 */
function waitForStylesheet(tag: { id: string; href: string }): Promise<void> {
  const existing = document.getElementById(tag.id) as (HTMLLinkElement & { dataset: DOMStringMap }) | null;

  if (existing) {
    if (existing.dataset['phLoaded'] === 'true') {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
    });
  }

  return new Promise<void>((resolve) => {
    const link = document.createElement('link');
    link.id = tag.id;
    link.rel = 'stylesheet';
    link.href = tag.href;
    link.addEventListener('load', () => {
      link.dataset['phLoaded'] = 'true';
      resolve();
    }, { once: true });
    link.addEventListener('error', () => {
      // Don't reject: one stylesheet failing (e.g. offline CDN) shouldn't
      // block the rest of the pharmacy module from initializing.
      link.dataset['phLoaded'] = 'true';
      resolve();
    }, { once: true });
    document.head.appendChild(link);
  });
}

/**
 * Injects (if not already present) the pharmacy theme stylesheets and
 * returns a Promise that resolves once ALL of them have finished loading.
 * Safe to call from multiple components — the underlying work only happens
 * once per load session.
 */
export function loadPharmacyTheme(): Promise<void> {
  if (!themeReadyPromise) {
    themeReadyPromise = Promise.all(PHARMACY_STYLE_TAGS.map(waitForStylesheet)).then(() => undefined);
  }
  return themeReadyPromise;
}

export function unloadPharmacyTheme(): void {
  for (const tag of PHARMACY_STYLE_TAGS) {
    document.getElementById(tag.id)?.remove();
  }
  themeReadyPromise = null;
}
