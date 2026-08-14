# @contrib/mail

Portable outbound email for `@contrib/*` modules and domain apps.

**This app uses AWS SES only.** There is no Resend integration.

| Provider | Required env |
|----------|----------------|
| **AWS SES** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (or `SES_REGION`) |

Also used: `SES_FROM_EMAIL` (and optional `SUPPORT_FROM_EMAIL` / `CONTACT_EMAIL` as From fallbacks).

## Install (copy to another domain)

```bash
cp -R modules/mail /path/to/other-domain/modules/mail
pnpm add @aws-sdk/client-ses
```

Path alias:

```json
"@contrib/mail": ["./modules/mail/src/index.ts"]
```

## Usage

```ts
import { createAppSendEmail, emailConfigured } from "@contrib/mail";

const send = createAppSendEmail();
await send({ from, to, subject, text, html });
```

Supports `fromName`, `replyTo`, and `listUnsubscribeUrl` (RFC 8058) via SES raw MIME.
