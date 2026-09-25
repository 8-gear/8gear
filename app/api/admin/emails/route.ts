import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminAuth';
import EmailTemplate from '@/models/EmailTemplate';
import { EMAIL_TYPES, emailTemplateSchema, emailToggleSchema } from '@/lib/email/templates';
import { getEmailTemplate } from '@/lib/email/sendOrderEmail';

export async function GET() {
  try {
    const auth = await requireAdminApi('/admin/emails');
    if ('error' in auth) return auth.error;
    const templates = await Promise.all(EMAIL_TYPES.map(getEmailTemplate));
    return NextResponse.json(templates.map(t => ({ type: t!.type, enabled: t!.enabled, subject: t!.subject, body: t!.body })), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load email templates' }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/emails');
    if ('error' in auth) return auth.error;
    const parsed = emailTemplateSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid template' }, { status: 400 });
    await getEmailTemplate(parsed.data.type);
    await EmailTemplate.updateOne({ type: parsed.data.type }, { $set: parsed.data }, { runValidators: true });
    return NextResponse.json(parsed.data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid JSON' : 'Unable to save template' }, { status: error instanceof SyntaxError ? 400 : 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdminApi('/admin/emails');
    if ('error' in auth) return auth.error;
    const parsed = emailToggleSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email toggle' }, { status: 400 });
    await getEmailTemplate(parsed.data.type);
    const saved = await EmailTemplate.findOneAndUpdate(
      { type: parsed.data.type }, { $set: { enabled: parsed.data.enabled } },
      { new: true, runValidators: true },
    ).orFail();
    return NextResponse.json({ type: saved.type, enabled: saved.enabled });
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid JSON' : 'Unable to save email setting' }, { status: error instanceof SyntaxError ? 400 : 500 });
  }
}
