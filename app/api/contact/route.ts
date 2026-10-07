import { NextResponse } from 'next/server';
import { z } from 'zod';
import { MICROSOFT_MAILBOX, sendMicrosoftMail } from '@/lib/email/microsoftGraph';

export const runtime = 'nodejs';

const inquirySchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().max(254).pipe(z.email()),
  subject: z.string().trim().min(1).max(200).regex(/^[^\r\n]+$/),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(200).optional(),
});
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]!));

export async function POST(req: Request) {
  let body: unknown;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text) > 24_000) return NextResponse.json({ error: 'Your inquiry is too long.' }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Please submit a valid inquiry.' }, { status: 400 });
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid name, email, subject, and message within the allowed lengths.' }, { status: 400 });
  const inquiry = parsed.data;
  if (inquiry.website) return NextResponse.json({ success: true });
  try {
    await sendMicrosoftMail({
      senderName: '8 GEARS Contact',
      to: MICROSOFT_MAILBOX,
      replyTo: inquiry.email,
      subject: `Contact inquiry: ${inquiry.subject}`,
      html: `<h2>New website inquiry</h2><p><strong>Name:</strong> ${escapeHtml(inquiry.fullName)}</p><p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Subject:</strong> ${escapeHtml(inquiry.subject)}</p><p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact inquiry email failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'We could not confirm your inquiry was sent. Please contact ma@8-gear.com directly.' }, { status: 502 });
  }
}
