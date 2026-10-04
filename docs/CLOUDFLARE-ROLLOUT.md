# Cloudflare rollout: Turnstile (form spam check)

The site code is already in place and switched off. It turns on when the site key is set at build time.
Follow the steps in this order. Step 1 must be live before step 3, or the widget is blocked by the site's own
Content-Security-Policy and visitors could not submit forms.

## 0. Get the keys (Cloudflare dashboard, free account)

- **Turnstile** → Add widget → hostname `soniconsultancyservices.com`, mode "Managed". Gives a **site key** (public)
  and a **secret key** (private: never commit it or paste it into chat).

## 1. Allow Cloudflare in the CloudFront security policy

`docs/cloudflare-rollout/response-headers-policy.json` is the current `scs-security-headers` policy with these
additions and nothing removed:

| Directive | Added |
|---|---|
| `script-src` | `https://challenges.cloudflare.com` |
| `frame-src` | `https://challenges.cloudflare.com` `https://calendly.com` `https://www.googletagmanager.com` (Tag Manager's noscript frame) |
| `script-src`, `connect-src`, `img-src` | `https://*.clarity.ms`, plus `https://c.bing.com` on the last two (Microsoft Clarity, loaded through Tag Manager) |
| `worker-src` | `'self' blob:` (new directive) |

The Calendly and `worker-src` entries are the two fixes the README already recommends: they restore the in-page
booking calendar and silence one console error on the home page.

```bash
aws cloudfront update-response-headers-policy --id f5f06e1b-7a4d-4442-9141-9f52844008da \
  --if-match "$(aws cloudfront get-response-headers-policy --id f5f06e1b-7a4d-4442-9141-9f52844008da --profile prod --query ETag --output text)" \
  --response-headers-policy-config file://docs/cloudflare-rollout/response-headers-policy.json --profile prod
```

Check: `curl -sI https://soniconsultancyservices.com/ | grep -i content-security-policy` shows `challenges.cloudflare.com`.

## 2. Give the lead Lambda the Turnstile secret

The Lambda already verifies `turnstile_token` when `TURNSTILE_SECRET` is set. Add it in the Lambda console
(scs-lead-mailer → Configuration → Environment variables → Edit → add `TURNSTILE_SECRET`). The console keeps the other
variables; the CLI's `update-function-configuration --environment` replaces all of them, so prefer the console.

From this moment the Lambda rejects any submission without a valid token, so do step 3 straight away.

## 3. Deploy the site with the site key

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<site key> scripts/deploy-aws.sh
```

To make it permanent, export it in your shell profile or put it in the deploy command you normally run. A deploy
without it switches the check off again (and the Lambda would then reject every form), so keep it set.

## 4. Verify

- Submit a form on the live site: the Turnstile check appears, the email arrives, and the Lambda log shows no
  `turnstile: not configured` line.

## 5. Later: the visitor auto-reply

Needs SES production access first (SES → Account dashboard → Request production access). Then set
`AUTO_ACK_ENABLED=true` on the Lambda, in the console as in step 2.

## Rolling back

Deploy without the site key and remove `TURNSTILE_SECRET` from the Lambda. The policy additions can stay.
