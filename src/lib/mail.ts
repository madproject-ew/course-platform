import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "Курсы <noreply@ew-production.ru>";

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const url = `${appUrl}/api/auth/verify-email?token=${token}`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Подтвердите ваш email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Подтверждение email</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Для завершения регистрации нажмите на кнопку ниже:
        </p>
        <a href="${url}" style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
          Подтвердить email
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 24px;">
          Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 32px;">
          Ссылка действительна 24 часа.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const url = `${appUrl}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Сброс пароля",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Сброс пароля</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Для сброса пароля нажмите на кнопку ниже:
        </p>
        <a href="${url}" style="display: inline-block; background: #18181b; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
          Сбросить пароль
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 24px;">
          Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
        </p>
      </div>
    `,
  });
}
