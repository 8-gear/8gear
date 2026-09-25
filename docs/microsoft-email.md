# Microsoft Graph email

Order notifications and subscriber mail use `app/lib/email/microsoftGraph.ts`,
a server-only helper. Order notifications are centralized in
`app/lib/email/sendOrderEmail.ts`; payment processing and the Graph transport
remain unchanged. Nodemailer is no longer used by mail
sending code; its installed packages are left untouched.

Set MS_TENANT_ID, MS_CLIENT_ID, and MS_CLIENT_SECRET in .env.local for local use
and in the server environment for deployment. Never use NEXT_PUBLIC_ for these
values. Restart after changing credentials. Do not commit secrets.
ADMIN_EMAIL controls order notifications and defaults to ma@8-gear.com.
SMTP_USER, SMTP_FROM, SMTP_PASS, SMTP_HOST, SMTP_PORT, and SMTP_SECURE are unused.

The helper requests a token from the tenant's v2 OAuth endpoint using
client_credentials and https://graph.microsoft.com/.default. It sends HTML via
POST https://graph.microsoft.com/v1.0/users/ma@8-gear.com/sendMail and saves sent
messages to Sent Items. The sender is fixed to ma@8-gear.com.

The application needs Microsoft Graph Mail.Send application permission with
administrator consent and access to the sending mailbox under any applicable
tenant application access policies. SMTP AUTH and SMTP.SendAsApp are not used.
Security Defaults and tenant policies are not changed by this application.

Tokens are cached in server memory and refreshed two minutes before expiry.
Concurrent sends share a token request; separate processes have separate caches.
HTTP 401 invalidates the cached token for a later send. Errors omit raw provider
responses, access tokens, and secrets. There are no automatic send retries:
a timeout may occur after acceptance, so retrying could duplicate messages.

Graph returns 202 Accepted without a response body. This confirms acceptance
for processing, not delivery to the inbox. Existing order email timestamps
continue to record successful submission.

Microsoft reference:
https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0

## Order templates and admin controls

`/admin/emails` manages nine independently enabled templates. Super admins have
access automatically; grant the Emails page permission to other admins in Users.
Defaults are inserted on first read/send and never overwrite saved settings.
Bodies are plain text with controlled `{{variables}}`; the shared renderer escapes
all content and adds branded HTML, products, prices, payment, address, and tracking.
Preview uses sample data and the same renderer inside a sandboxed iframe.

Admin new-order mail is submitted after successful order creation (including
pending-payment orders, whose payment status is shown). Customer confirmation
remains tied to the existing successful-payment flow. `ADMIN_EMAIL` is reused,
with the existing mailbox as fallback; no new environment variables are required.
Set `NEXT_PUBLIC_SITE_URL` to the public store URL for order tracking links.

The orders list and existing detail modal both use the status API. Tracking is
saved together from the detail modal. PUT status and the existing PATCH endpoint
share the validated update service. Only actual status/tracking changes notify;
notes-only saves do not. A status plus tracking change sends each enabled type
once. Tracking URLs must use HTTP(S) without embedded credentials.

MongoDB adds an `emailtemplates` collection (unique type) and order fields
`emailRevision` and `emailDeliveries`; existing orders need no backfill.
Atomic claims record each email event as claimed, sent, or failed. Confirmation
also honors existing `orderConfirmationEmailSentAt` values. Disabled templates
never submit mail or record a successful send. Mail failures do not fail checkout
or admin updates, and logs omit customer data, credentials, and provider bodies.

Failed or interrupted claims are intentionally not retried automatically because
Graph acceptance can be ambiguous. This favors duplicate prevention over automatic
recovery; inspect the order's hidden `emailDeliveries` field and Microsoft Sent
Items when investigating delivery. There is no durable background retry queue.

Run isolated regression checks with `node --test scripts/test-order-emails.cjs`.
They mock MongoDB and Graph; they do not submit real orders or emails.
