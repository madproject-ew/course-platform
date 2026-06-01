import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL}/api/auth/yandex/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId || "",
    redirect_uri: redirectUri,
  });

  return NextResponse.redirect(
    `https://oauth.yandex.ru/authorize?${params.toString()}`
  );
}
