#!/usr/bin/env bash
# Build the static site and publish it to the S3 bucket behind CloudFront for soniconsultancyservices.com.
#
#   scripts/deploy-aws.sh                # build, upload, invalidate the CloudFront cache
#   scripts/deploy-aws.sh --dry-run      # build and list what would be uploaded; changes nothing
#   scripts/deploy-aws.sh --skip-build   # re-use ./dist from a previous run
#
# Never deletes anything in the bucket: other content lives there too (the _3d/ folder served on the
# portfolio. subdomain, the Google Search Console verification file, llms.txt, older assets).
set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET=${BUCKET:-scs-site-prod-043174661808}
DISTRIBUTION=${DISTRIBUTION:-E3HVJHFD5CQPVI}
PROFILE=${AWS_PROFILE:-prod}
ENDPOINT=${NEXT_PUBLIC_LEAD_ENDPOINT:-https://9cjt6qwy71.execute-api.ap-south-1.amazonaws.com}
ENDPOINT=${ENDPOINT%/}   # the bundle builds "<endpoint>/inquiry", so the base must not end in a slash
GA_ID=${NEXT_PUBLIC_GA_ID:-G-0J9H7CBX0Q}
GTM_ID=${NEXT_PUBLIC_GTM_ID:-GTM-MQXMVJZW}
TURNSTILE=${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}
# Owner WhatsApp (digits, country code). Build-time and public (it is in the page HTML), not a secret.
WHATSAPP=${NEXT_PUBLIC_WHATSAPP_NUMBER:-918160682186}
# Reply promise shown on /thanks and in the auto-reply copy. Build-time and public.
REPLY_PROMISE=${NEXT_PUBLIC_REPLY_PROMISE:-"within 1 business day"}
INQUIRY="$ENDPOINT/inquiry"
AWS=${AWS:-aws}

DRY=""; BUILD=1
for a in "$@"; do case "$a" in --dry-run) DRY="--dryrun" ;; --skip-build) BUILD=0 ;; *) echo "unknown option $a" >&2; exit 2 ;; esac; done
s3() { if [ -n "$DRY" ]; then "$AWS" s3 "$@" --profile "$PROFILE" --dryrun; else "$AWS" s3 "$@" --profile "$PROFILE" --only-show-errors; fi; }

if [ "$BUILD" = 1 ]; then
  rm -rf out
  STATIC_EXPORT=1 NEXT_PUBLIC_LEAD_ENDPOINT="$ENDPOINT" NEXT_PUBLIC_GA_ID="$GA_ID" NEXT_PUBLIC_GTM_ID="$GTM_ID" NEXT_PUBLIC_TURNSTILE_SITE_KEY="$TURNSTILE" NEXT_PUBLIC_WHATSAPP_NUMBER="$WHATSAPP" NEXT_PUBLIC_REPLY_PROMISE="$REPLY_PROMISE" NEXT_PUBLIC_INQUIRY_DRY_RUN= NEXT_PUBLIC_CHAT_ENABLED= npx next build
  node scripts/prepare-static.mjs out dist
fi

# A build without the endpoint would accept form submissions and silently drop them.
grep -rqF "$ENDPOINT" dist/_next || { echo "dist was built without NEXT_PUBLIC_LEAD_ENDPOINT; refusing to upload" >&2; exit 1; }
# The inquiry form must post to the real /inquiry route, never fall back to a dry run, and the unapproved AI chat must not be in the build.
grep -rqF "$INQUIRY" dist/_next || { echo "dist does not contain $INQUIRY; refusing to upload" >&2; exit 1; }
! grep -rqF "dry run (no endpoint" dist/_next || { echo "dist contains the inquiry dry-run path (NEXT_PUBLIC_INQUIRY_DRY_RUN was set at build); refusing to upload" >&2; exit 1; }
! grep -rqE "Ask a question first|AI assistant answering from this site only|scs-chat" dist || { echo "dist contains chat-assistant code; refusing to upload" >&2; exit 1; }
[ ! -f dist/thanks/index.html ] || grep -qF "$REPLY_PROMISE" dist/thanks/index.html || { echo "dist/thanks/index.html does not show the reply promise \"$REPLY_PROMISE\"; refusing to upload" >&2; exit 1; }
# Every wa.me link must carry the number: a build without it would ship links that open WhatsApp's contact picker.
for f in dist/index.html dist/app-quote/index.html dist/thanks/index.html; do
  [ -f "$f" ] || continue
  grep -qF "wa.me/$WHATSAPP" "$f" || { echo "$f has no wa.me/$WHATSAPP link; refusing to upload" >&2; exit 1; }
  ! grep -oE 'wa\.me/[^"?]*' "$f" | grep -qxE 'wa\.me/' || { echo "$f has a wa.me link with an empty number; refusing to upload" >&2; exit 1; }
done
[ -f dist/index.html ] && [ -f dist/404.html ] || { echo "dist is incomplete; refusing to upload" >&2; exit 1; }

IMMUTABLE="public,max-age=31536000,immutable"
REVALIDATE="public,max-age=0,must-revalidate"

echo "1/4 hashed build files (_next/)";            s3 sync dist/_next "s3://$BUCKET/_next" --cache-control "$IMMUTABLE"
echo "2/4 images, PDF and other static assets";   s3 sync dist/assets "s3://$BUCKET/assets" --cache-control "$IMMUTABLE"
echo "3/4 payloads, sitemap, robots, OG images";  s3 sync dist "s3://$BUCKET" --exclude "*.html" --exclude "_next/*" --exclude "assets/*" --cache-control "$REVALIDATE"
echo "4/4 pages (last, so they never point at a file that is not there yet)"
s3 sync dist "s3://$BUCKET" --exclude "*" --include "*.html" --cache-control "$REVALIDATE" --content-type "text/html; charset=utf-8"

if [ -z "$DRY" ]; then
  "$AWS" cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths "/*" --profile "$PROFILE" --query "Invalidation.{Id:Id,Status:Status}" --output text
  echo "published to s3://$BUCKET and invalidated CloudFront $DISTRIBUTION"
else
  echo "dry run only: nothing was uploaded"
fi
