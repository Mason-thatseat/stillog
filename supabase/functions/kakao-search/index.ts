import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const KAKAO_API_KEY = "12c76eda3ab8499974a1a67c26033491";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const size = url.searchParams.get("size") || "15";
    const categoryGroupCode = url.searchParams.get("category_group_code") || "FD6,CE7,BK9";

    if (!query) {
      return new Response(
        JSON.stringify({ error: "query 파라미터가 필요합니다" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&category_group_code=${categoryGroupCode}&size=${size}`;

    const res = await fetch(kakaoUrl, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: "카카오 API 오류", detail: errText }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "서버 오류", detail: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
