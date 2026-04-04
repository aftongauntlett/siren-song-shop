import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Resend } from 'resend';

const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  message: z.string().trim().min(20).max(2000)
});

const asJson = (payload: unknown, status: number): Response => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const parsed = contactSubmissionSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message')
  });

  if (!parsed.success) {
    return asJson({ error: 'Invalid form submission.', details: parsed.error.flatten() }, 400);
  }

  const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = import.meta.env;

  if (!RESEND_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    return asJson({ error: 'Email service is not configured.' }, 500);
  }

  const resend = new Resend(RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: CONTACT_FROM_EMAIL,
    to: [CONTACT_TO_EMAIL],
    replyTo: parsed.data.email,
    subject: `Siren Song suggestion from ${parsed.data.name}`,
    text: parsed.data.message
  });

  if (error) {
    return asJson({ error: 'Unable to send email.', details: error.message }, 502);
  }

  return asJson({ ok: true }, 200);
};
