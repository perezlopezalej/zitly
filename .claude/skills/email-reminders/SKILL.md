---
name: email-reminders
description: Use this skill when working with emails, the cron reminder system, Resend, react-email templates, or the /api/cron/reminders route.
---

# Email & reminders system in Zitly

## Architecture

- Provider: Resend + react-email
- Templates: `src/lib/emails/` — React components
- Functions: `src/lib/email.ts` exports three functions
- Cron: Vercel runs `GET /api/cron/reminders` daily at 09:00 UTC

## The three email functions

```ts
sendWelcomeEmail(email, businessName); // on register
sendBookingConfirmationEmail(booking); // after booking created
sendReminderEmail(booking); // called by cron
```

## Fire-and-forget pattern — always use this for confirmation emails

```ts
// ✅ Correct — never await in the action, never block the response
void sendBookingConfirmationEmail(booking).catch(() => {});

// ❌ Wrong — blocks the response and throws if email fails
await sendBookingConfirmationEmail(booking);
```

## Soft failure — RESEND_API_KEY absent

If `RESEND_API_KEY` is not set, emails are silently skipped — never throw.
Always guard:

```ts
if (!process.env.RESEND_API_KEY) return;
```

## Cron route authentication

```ts
// Always verify CRON_SECRET before processing
const auth = request.headers.get("authorization");
if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Adding a new email template

1. Create `src/lib/emails/[name].tsx` — React component
2. Export a render function using `@react-email/render`
3. Add the send function to `src/lib/email.ts`
4. Test locally: `RESEND_API_KEY` can be absent — email is skipped silently

## Reminder timing — current vs optimal

- Current: 1 reminder at 09:00 UTC day before
- Gap: no 2h-before reminder (high no-show reduction potential)
- If adding 2h reminder: needs separate cron or time-based query adjustment
