# 301 redirects for old URLs (CloudFront)

Search Console (Indexing → Pages → Not found 404) lists old-site URLs that Google still crawls. On S3 + CloudFront the
`redirects()` in `next.config.ts` do not run, so add these to the `scs-url-rewrite` CloudFront function (viewer request),
before the existing rewrite logic. Strip a trailing slash and a leading `www.` host first if the function does not already.

| Old path | 301 to |
|---|---|
| `/portfolio/station-driver-chauffeurs` | `/work/ride-hailing/` |
| `/portfolio/attendance-salary-ledger` | `/work/hr-payroll/` |
| `/portfolio/retail-supply-chain` | `/work/retail-ops/` |
| `/portfolio` and any other `/portfolio/*` | `/work/` |
| `/work/b2b-wholesale` (renamed case study) | `/work/store-ops/` |
| `/case-study` | `/work/` |
| `/hire/fullstack-developer` | `/hire/` |
| `/estimate` | `/app-cost-calculator/` |
| `/services/enterprise-software-development` | `/services/` |

`/work/healthcare-staffing/` is deliberately **not** in this list: it is a real case-study page in this build.

```js
var MOVED = {
  '/portfolio/station-driver-chauffeurs': '/work/ride-hailing/',
  '/portfolio/attendance-salary-ledger': '/work/hr-payroll/',
  '/portfolio/retail-supply-chain': '/work/retail-ops/',
  '/portfolio': '/work/',
  '/work/b2b-wholesale': '/work/store-ops/',
  '/case-study': '/work/',
  '/hire/fullstack-developer': '/hire/',
  '/estimate': '/app-cost-calculator/',
  '/services/enterprise-software-development': '/services/'
};
function redirectFor(uri) {
  var p = uri.length > 1 && uri.charAt(uri.length - 1) === '/' ? uri.slice(0, -1) : uri;
  if (MOVED[p]) return MOVED[p];
  if (p.indexOf('/portfolio/') === 0) return '/work/';
  return null;
}
// inside handler(event): var to = redirectFor(event.request.uri);
// if (to) return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: to } } };
```

The same mapping lives in `next.config.ts` for builds that run a Node server (`npm run dev`, `npm run start`, Vercel).

After deploying: in Search Console open each 404 group and click **Validate fix**.
(`/search?q={search_term_string}` is a template placeholder from the old site's search markup; ignore it.)
