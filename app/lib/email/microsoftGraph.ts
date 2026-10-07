import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const MICROSOFT_MAILBOX = 'ma@8-gear.com';

type MailMessage = {
  senderName: string;
  to: string | undefined;
  replyTo?: string;
  subject: string;
  html: string;
};

type AccessToken = { value: string; expiresAt: number };
let cachedToken: AccessToken | undefined;
let pendingToken: Promise<AccessToken> | undefined;
const refreshMarginMs = 120_000;

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing email configuration: ${key}`);
  return value;
}

async function requestToken(): Promise<AccessToken> {
  const tenant = requiredEnv('MS_TENANT_ID');
  const body = new URLSearchParams({
    client_id: requiredEnv('MS_CLIENT_ID'),
    client_secret: requiredEnv('MS_CLIENT_SECRET'),
    grant_type: 'client_credentials',
    scope: 'https://graph.microsoft.com/.default',
  });
  const requestedAt = Date.now();
  let response: Response;
  try {
    response = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      },
    );
  } catch {
    throw new Error('Microsoft email token request failed or timed out. Check network connectivity.');
  }
  // Never include provider response bodies, credentials, or tokens in errors.
  if (!response.ok) {
    throw new Error(`Microsoft email token request failed (HTTP ${response.status}). Check app credentials and tenant permissions.`);
  }
  let data: { access_token?: unknown; expires_in?: unknown; token_type?: unknown };
  try {
    data = await response.json();
  } catch {
    throw new Error('Microsoft email token response was not valid JSON.');
  }
  if (!data || typeof data.access_token !== 'string' || !data.access_token ||
      typeof data.expires_in !== 'number' || !Number.isFinite(data.expires_in) ||
      data.expires_in <= 0 || typeof data.token_type !== 'string' ||
      data.token_type.toLowerCase() !== 'bearer') {
    throw new Error('Microsoft email token response was missing a valid token or expiration.');
  }
  return { value: data.access_token, expiresAt: requestedAt + data.expires_in * 1000 };
}

async function getAccessToken(): Promise<AccessToken> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - refreshMarginMs) return cachedToken;
  // Share a single refresh across simultaneous customer/admin sends in this process.
  if (!pendingToken) {
    pendingToken = requestToken().then(token => {
      cachedToken = token;
      return token;
    }).finally(() => { pendingToken = undefined; });
  }
  return pendingToken;
}

export async function sendMicrosoftMail(message: MailMessage): Promise<void> {
  if (!message.to?.trim()) throw new Error('Email recipient is required.');
  // CID images travel with the message, including when the site is private or local.
  const attachments = message.html.includes('src="cid:8gears-logo"') ? [{
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: '8gears-logo.png', contentType: 'image/png',
    contentId: '8gears-logo', isInline: true,
    contentBytes: (await readFile(path.join(process.cwd(), 'public', 'logo.png'))).toString('base64'),
  }] : undefined;
  const token = await getAccessToken();
  let response: Response;
  try {
    response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${MICROSOFT_MAILBOX}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: message.subject,
            attachments,
            body: { contentType: 'HTML', content: message.html },
            from: { emailAddress: { address: MICROSOFT_MAILBOX, name: message.senderName } },
            replyTo: message.replyTo ? [{ emailAddress: { address: message.replyTo } }] : undefined,
            toRecipients: [{ emailAddress: { address: message.to.trim() } }],
          },
          saveToSentItems: true,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000),
      },
    );
  } catch {
    // Do not retry: a timeout can occur after Graph accepted the message.
    throw new Error('Microsoft Graph email request failed or timed out. Delivery status is unknown.');
  }
  if (response.status === 401 && cachedToken === token) cachedToken = undefined;
  if (response.status !== 202) {
    // Provider response bodies may contain sensitive information. Never log them.
    throw new Error(`Microsoft Graph email request failed (HTTP ${response.status}). Check Mail.Send application consent, mailbox access, and recipient addresses.`);
  }
  // 202 means accepted for processing, not confirmed inbox delivery.
}
