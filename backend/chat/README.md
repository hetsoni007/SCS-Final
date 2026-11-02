# scs-chat — `POST /chat` (Phase 3, off by default)

Server-side Claude route for the assistant on `/app-quote`. The key lives only in the Lambda environment.

Lambda `scs-chat` (Node 20, handler `index.handler`) env — TODO(owner) every value:
- `ANTHROPIC_API_KEY`, `CHAT_MODEL` (model id, your choice)
- `CHAT_PRICE_IN_PER_MTOK`, `CHAT_PRICE_OUT_PER_MTOK`: USD per million tokens for that model. **Required**: the daily cap is computed from them, and without them (or the key/model/`RATE_TABLE`) the route answers 503, so it can never spend uncapped.
- `CHAT_DAILY_CAP_USD` (default 5), `CHAT_IP_LIMIT` (messages per IP per hour, default 20)
- `RATE_TABLE` (the same DynamoDB table as `/inquiry` works: string key `pk`, TTL `ttl`), `OWNER_EMAIL`, `FROM_EMAIL` (SES-verified)
- Role: `ses:SendEmail`, `dynamodb:UpdateItem`. API Gateway route `POST /chat` with CORS for the site origin.

The system prompt (in `index.mjs`) is limited to facts already on the site, forbids prices and promised dates, and tells the model to ignore instructions to change its rules. "Leave your details" emails you the transcript (`New chat lead: …`); the WhatsApp link is always shown.
Enable the UI by building with `NEXT_PUBLIC_CHAT_ENABLED=true`. Tests: `node --test backend/chat/index.test.mjs`.
