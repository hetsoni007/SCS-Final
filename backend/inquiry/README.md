# scs-inquiry — `POST /inquiry`

Production is a static export (S3 + CloudFront), so `/inquiry` is an API Gateway HTTP API route to this Lambda, on the same API as the lead mailer. Nothing here is deployed by the repo.

Behaviour: validates + sanitises, honeypot (`hp` / `company_url`) returns 200 silently, per-IP rate limit (default 5/hour, DynamoDB `RATE_TABLE`, fails open), emails the owner `New inquiry: [what] - [budget] - [utm_campaign]` with first-touch UTM, landing path, referrer, device, timestamp; auto-replies when the visitor gave an email. Returns no CORS headers (API Gateway owns CORS).

Setup (needs your approval/credentials — not run):
1. DynamoDB table with string key `pk`, TTL attribute `ttl`.
2. Lambda `scs-inquiry`, Node 20, handler `index.handler`, env: `OWNER_EMAIL`, `FROM_EMAIL` (a verified SES identity), `REPLY_PROMISE`, `RATE_TABLE`, optional `RATE_LIMIT`. Role: `ses:SendEmail`, `dynamodb:UpdateItem`.
3. API Gateway route `POST /inquiry` -> that Lambda; CORS allow `https://soniconsultancyservices.com` (+ `www`), POST, Content-Type.
4. Build with `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_REPLY_PROMISE` set (`scripts/deploy-aws.sh` already sets the lead endpoint; `/inquiry` is derived from it).

Tests: `node --test backend/inquiry/index.test.mjs`
