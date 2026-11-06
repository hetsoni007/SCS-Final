#!/usr/bin/env bash
# Provision POST /inquiry (backend/inquiry): rate-limit table, IAM role, Lambda `scs-inquiry`, and the API Gateway route on the
# existing lead API. See backend/inquiry/README.md.
#
#   scripts/setup-inquiry-aws.sh                 # print the plan and the commands; nothing is changed
#   scripts/setup-inquiry-aws.sh --apply         # execute them (idempotent: existing resources are reused/updated)
#   scripts/setup-inquiry-aws.sh --apply --restrict-cors   # also restrict the API's CORS to the site origins (API-wide, see below)
#
# Read-only AWS calls (describe/get/list) always run, so the plan reflects what exists. Everything that writes goes through `do_it`.
# FROM_EMAIL and the API id are read from the live lead-mailer Lambda / API, never guessed; the script stops if the sender is not a
# verified SES identity.
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE=${AWS_PROFILE:-prod}; export AWS_PROFILE=$PROFILE AWS_PAGER=""
REGION=${AWS_REGION:-ap-south-1}; AWS=${AWS:-aws}
OWNER_EMAIL=het.soni@soniconsultancyservices.com
REPLY_PROMISE=${REPLY_PROMISE:-"within 1 business day"}
FUNC=scs-inquiry; ROLE=scs-inquiry-role; TABLE=scs-inquiry-rate; STORE=scs-inquiries; RATE_LIMIT=5
LEAD_FUNC=scs-lead-mailer; API_NAME=scs-lead-api
ORIGINS=("https://soniconsultancyservices.com" "https://www.soniconsultancyservices.com")

APPLY=0; CORS=0
for a in "$@"; do case "$a" in --apply) APPLY=1 ;; --restrict-cors) CORS=1 ;; *) echo "unknown option $a" >&2; exit 2 ;; esac; done
rd() { "$AWS" "$@" --region "$REGION"; }                       # read-only
do_it() { echo "+ aws $* --region $REGION"; if [ "$APPLY" = 1 ]; then "$AWS" "$@" --region "$REGION"; fi; }   # writes
say() { printf '\n== %s\n' "$*"; }

[ "$APPLY" = 1 ] && echo "APPLY MODE: changes will be made in profile $PROFILE ($REGION)" || echo "PLAN ONLY: nothing will be changed. Re-run with --apply to execute."

say "Discover (read-only)"
ACCT=$(rd sts get-caller-identity --query Account --output text)
API_ID=${API_ID:-$(rd apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId | [0]" --output text)}
[ -n "$API_ID" ] && [ "$API_ID" != None ] || { echo "Could not find API '$API_NAME'; set API_ID=... and re-run." >&2; exit 1; }
API_URL=$(rd apigatewayv2 get-api --api-id "$API_ID" --query ApiEndpoint --output text)
FROM_EMAIL=$(rd lambda get-function-configuration --function-name "$LEAD_FUNC" --query 'Environment.Variables.FROM_EMAIL' --output text)
[ -n "$FROM_EMAIL" ] && [ "$FROM_EMAIL" != None ] || { echo "$LEAD_FUNC has no FROM_EMAIL; tell the owner which verified SES sender to use." >&2; exit 1; }
# (In SES sandbox the send is also authorised against the recipient identity, so the owner address is listed too.)
# Prefer a sender on the DKIM-verified domain identity (signed, aligned mail). A single-address identity has no DKIM and Gmail can bounce it.
DOMAIN=${OWNER_EMAIL#*@}
if [ "$(rd sesv2 get-email-identity --email-identity "$DOMAIN" --query 'DkimAttributes.Status' --output text 2>/dev/null || echo NONE)" = SUCCESS ]; then
  FROM_EMAIL=${INQUIRY_FROM_EMAIL:-inquiries@$DOMAIN}; SES_ARN_ID=$DOMAIN
else
  SES_OK=$(rd sesv2 get-email-identity --email-identity "$FROM_EMAIL" --query 'VerifiedForSendingStatus' --output text 2>/dev/null || echo false)
  [ "$SES_OK" = True ] || { echo "SES identity $FROM_EMAIL is not verified for sending; stopping. Ask the owner which sender to use." >&2; exit 1; }
  SES_ARN_ID=$FROM_EMAIL
fi
echo "account $ACCT | api $API_ID ($API_URL) | sender $FROM_EMAIL (verified) | owner $OWNER_EMAIL"
SANDBOX=$(rd sesv2 get-account --query ProductionAccessEnabled --output text)
[ "$SANDBOX" = True ] || echo "NOTE: SES is in sandbox. Owner emails work; visitor auto-replies to unverified addresses will fail (the Lambda ignores that failure). Request SES production access to enable them."

say "1. DynamoDB rate-limit table $TABLE (key pk, TTL attribute ttl)"
if rd dynamodb describe-table --table-name "$TABLE" >/dev/null 2>&1; then echo "exists; reusing"; else
  do_it dynamodb create-table --table-name "$TABLE" --attribute-definitions AttributeName=pk,AttributeType=S --key-schema AttributeName=pk,KeyType=HASH --billing-mode PAY_PER_REQUEST
  [ "$APPLY" = 1 ] && rd dynamodb wait table-exists --table-name "$TABLE"
fi
TTL_STATE=$(rd dynamodb describe-time-to-live --table-name "$TABLE" --query 'TimeToLiveDescription.TimeToLiveStatus' --output text 2>/dev/null || echo DISABLED)
case "$TTL_STATE" in ENABLED|ENABLING) echo "TTL already on" ;; *) do_it dynamodb update-time-to-live --table-name "$TABLE" --time-to-live-specification Enabled=true,AttributeName=ttl ;; esac

say "1b. DynamoDB table $STORE (every valid inquiry is stored before the email is sent)"
if rd dynamodb describe-table --table-name "$STORE" >/dev/null 2>&1; then echo "exists; reusing"; else
  do_it dynamodb create-table --table-name "$STORE" --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --billing-mode PAY_PER_REQUEST
  [ "$APPLY" = 1 ] && rd dynamodb wait table-exists --table-name "$STORE"
fi

say "2. IAM role $ROLE (logs, ses:SendEmail, dynamodb:UpdateItem)"
ROLE_ARN="arn:aws:iam::$ACCT:role/$ROLE"
TRUST='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
POLICY=$(printf '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"ses:SendEmail","Resource":["arn:aws:ses:%s:%s:identity/%s","arn:aws:ses:%s:%s:identity/%s"]},{"Effect":"Allow","Action":"dynamodb:UpdateItem","Resource":"arn:aws:dynamodb:%s:%s:table/%s"},{"Effect":"Allow","Action":"dynamodb:PutItem","Resource":"arn:aws:dynamodb:%s:%s:table/%s"}]}' "$REGION" "$ACCT" "$SES_ARN_ID" "$REGION" "$ACCT" "$OWNER_EMAIL" "$REGION" "$ACCT" "$TABLE" "$REGION" "$ACCT" "$STORE")
NEW_ROLE=0
if rd iam get-role --role-name "$ROLE" >/dev/null 2>&1; then echo "exists; refreshing policies"; else
  NEW_ROLE=1; do_it iam create-role --role-name "$ROLE" --assume-role-policy-document "$TRUST"
fi
do_it iam attach-role-policy --role-name "$ROLE" --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
do_it iam put-role-policy --role-name "$ROLE" --policy-name scs-inquiry-access --policy-document "$POLICY"
if [ "$APPLY" = 1 ] && [ "$NEW_ROLE" = 1 ]; then echo "waiting for IAM propagation"; sleep 12; fi

say "3. Lambda $FUNC (nodejs20.x, handler index.handler)"
ZIP=$(mktemp -d)/scs-inquiry.zip; (cd backend/inquiry && zip -q -j "$ZIP" index.mjs)
ENVJSON=$(printf '{"Variables":{"OWNER_EMAIL":"%s","FROM_EMAIL":"%s","REPLY_PROMISE":"%s","RATE_TABLE":"%s","INQUIRY_TABLE":"%s","RATE_LIMIT":"%s"}}' "$OWNER_EMAIL" "$FROM_EMAIL" "$REPLY_PROMISE" "$TABLE" "$STORE" "$RATE_LIMIT")
FUNC_ARN="arn:aws:lambda:$REGION:$ACCT:function:$FUNC"
if rd lambda get-function --function-name "$FUNC" >/dev/null 2>&1; then
  do_it lambda update-function-code --function-name "$FUNC" --zip-file "fileb://$ZIP"
  [ "$APPLY" = 1 ] && rd lambda wait function-updated --function-name "$FUNC"
  do_it lambda update-function-configuration --function-name "$FUNC" --environment "$ENVJSON" --timeout 15 --memory-size 512
else
  do_it lambda create-function --function-name "$FUNC" --runtime nodejs20.x --handler index.handler --role "$ROLE_ARN" --zip-file "fileb://$ZIP" --timeout 15 --memory-size 512 --environment "$ENVJSON"
  [ "$APPLY" = 1 ] && rd lambda wait function-active --function-name "$FUNC"
fi

say "4. API Gateway route POST /inquiry on $API_ID"
INTEG=$(rd apigatewayv2 get-integrations --api-id "$API_ID" --query "Items[?contains(IntegrationUri, ':function:$FUNC')].IntegrationId | [0]" --output text)
if [ -z "$INTEG" ] || [ "$INTEG" = None ]; then
  if [ "$APPLY" = 1 ]; then INTEG=$(rd apigatewayv2 create-integration --api-id "$API_ID" --integration-type AWS_PROXY --integration-uri "$FUNC_ARN" --payload-format-version 2.0 --query IntegrationId --output text); echo "created integration $INTEG"
  else INTEG="<new-integration-id>"; echo "+ aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-uri $FUNC_ARN --payload-format-version 2.0 --region $REGION"; fi
else echo "integration $INTEG exists"; fi
HAS_ROUTE=$(rd apigatewayv2 get-routes --api-id "$API_ID" --query "Items[?RouteKey=='POST /inquiry'].RouteId | [0]" --output text)
if [ -z "$HAS_ROUTE" ] || [ "$HAS_ROUTE" = None ]; then do_it apigatewayv2 create-route --api-id "$API_ID" --route-key "POST /inquiry" --target "integrations/$INTEG"; else echo "route POST /inquiry exists"; fi
# let API Gateway invoke the function (a repeat run reports a conflict, which is fine)
echo "+ aws lambda add-permission --function-name $FUNC --statement-id apigw-inquiry --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn arn:aws:execute-api:$REGION:$ACCT:$API_ID/*/*/inquiry --region $REGION"
if [ "$APPLY" = 1 ]; then rd lambda add-permission --function-name "$FUNC" --statement-id apigw-inquiry --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:$REGION:$ACCT:$API_ID/*/*/inquiry" >/dev/null 2>&1 || echo "(permission already present)"; fi

say "5. CORS (API-wide in an HTTP API, so it also covers the existing lead route)"
echo "current: $(rd apigatewayv2 get-api --api-id "$API_ID" --query CorsConfiguration.AllowOrigins --output text)"
if [ "$CORS" = 1 ]; then
  do_it apigatewayv2 update-api --api-id "$API_ID" --cors-configuration "AllowOrigins=${ORIGINS[0]},${ORIGINS[1]},AllowMethods=POST,OPTIONS,AllowHeaders=content-type,MaxAge=86400"
else echo "left unchanged. Pass --restrict-cors to limit it to ${ORIGINS[*]} (check nothing else, such as a preview or subdomain form, posts to this API first)."; fi

say "Done"
echo "Endpoint: $API_URL/inquiry"
echo "Smoke test (sends one real owner email; use a throwaway name):"
echo "  curl -s -X POST $API_URL/inquiry -H 'content-type: application/json' -d '{\"what\":\"Web app\",\"name\":\"Setup test\",\"email\":\"$OWNER_EMAIL\",\"budget\":\"Not sure yet\",\"consent\":true,\"utm_campaign\":\"setup-test\"}'"
