import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Log exact URL being called
  const fullUrl = `${url}/rest/v1/news_digest`;

  return NextResponse.json({
    full_url: fullUrl,
    url_length: url.length,
    ends_with_slash: url.endsWith("/"),
    key_type: key.startsWith("sb_secret") ? "new_format" : "jwt_format",
  });
}
