import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createToken, setSessionCookie } from "@/lib/auth";

export async function GET(request: Request) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=no-code`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch("https://oauth.yandex.ru/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.YANDEX_CLIENT_ID || "",
        client_secret: process.env.YANDEX_CLIENT_SECRET || "",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token-failed`);
    }

    // Get user info
    const userRes = await fetch("https://login.yandex.ru/info?format=json", {
      headers: { Authorization: `OAuth ${tokenData.access_token}` },
    });

    const yandexUser = await userRes.json();

    if (!yandexUser.default_email) {
      return NextResponse.redirect(`${appUrl}/login?error=no-email`);
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { yandexId: yandexUser.id } });

    if (!user) {
      user = await db.user.findUnique({ where: { email: yandexUser.default_email } });

      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: { yandexId: yandexUser.id, emailVerified: true },
        });
      } else {
        user = await db.user.create({
          data: {
            email: yandexUser.default_email,
            name: yandexUser.real_name || yandexUser.display_name || yandexUser.default_email,
            yandexId: yandexUser.id,
            emailVerified: true,
          },
        });
      }
    }

    const jwt = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const cookie = setSessionCookie(jwt);
    const response = NextResponse.redirect(`${appUrl}/`);
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);

    return response;
  } catch (error) {
    console.error("Yandex OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=oauth-failed`);
  }
}
