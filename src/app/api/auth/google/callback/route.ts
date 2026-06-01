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
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token-failed`);
    }

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();

    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=no-email`);
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { googleId: googleUser.id } });

    if (!user) {
      // Check if user with this email exists
      user = await db.user.findUnique({ where: { email: googleUser.email } });

      if (user) {
        // Link Google account
        user = await db.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id, emailVerified: true },
        });
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name || googleUser.email,
            googleId: googleUser.id,
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
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=oauth-failed`);
  }
}
