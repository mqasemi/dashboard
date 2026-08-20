/**
 * Removes ng-zorro-antd's private, Gregorian copy of `date-fns`.
 *
 * ## Why this is necessary
 *
 * `ng-zorro-antd` declares `"date-fns": "^2.16.1"` as a hard dependency and uses it for *calendar
 * arithmetic*, not just formatting — `CandyDate` builds every picker grid out of `startOfMonth`,
 * `addMonths`, `setYear`, `setMonth` and friends imported straight from `date-fns`. So the only way
 * to get a genuinely Jalali `nz-date-picker` is for that import to resolve to `date-fns-jalali`,
 * which is why `package.json` aliases `date-fns` to it.
 *
 * The alias alone does not work. Every `date-fns-jalali` 2.x release is a prerelease (`2.30.0-0`),
 * and a semver range never matches a prerelease unless the range names one itself — so `^2.16.1`
 * does not accept the alias, and npm resolves ng-zorro's dependency separately, installing a second
 * genuine Gregorian `date-fns` at `node_modules/ng-zorro-antd/node_modules/date-fns`.
 *
 * The result is a picker running Gregorian arithmetic while being handed our Jalali
 * `NZ_DATE_LOCALE`: Jalali *month names* over Gregorian years and day numbers.
 *
 * `overrides` cannot fix it — npm strips the `npm:` alias from an override and re-resolves against
 * the real `date-fns`, and it drops a top-level override for a package the root also depends on.
 * (Verified on npm 10.9.3; `npm ls date-fns` reports "overridden" while still installing 2.30.0.)
 *
 * Deleting the nested copy makes Node/esbuild resolution walk up to the root alias, so ng-zorro and
 * the app share one Jalali `date-fns`. `src/app/core/i18n/date-picker-jalali.spec.ts` fails loudly
 * if this ever regresses.
 */
import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const nested = join(root, 'node_modules', 'ng-zorro-antd', 'node_modules', 'date-fns');

if (existsSync(nested)) {
  rmSync(nested, { recursive: true, force: true });
  console.log('[dedupe-date-fns] removed ng-zorro-antd’s Gregorian date-fns; it now resolves to the Jalali alias.');
} else {
  console.log('[dedupe-date-fns] no nested date-fns found — ng-zorro-antd already resolves to the Jalali alias.');
}
