import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // CORS Preflight (OPTIONS) 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, systemPrompt, promptText } = body;

    // -------------------------------------------------------------
    // Action 1: Alan AI를 통한 레시피 JSON 생성
    // -------------------------------------------------------------
    if (action === 'generate-recipe') {
      const alanClientIdsStr = Deno.env.get('ALAN_CLIENT_IDS') || '';
      const clientIds = alanClientIdsStr
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (clientIds.length === 0) {
        return new Response(JSON.stringify({ error: 'ALAN_CLIENT_IDS 환경변수가 설정되지 않았습니다.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let alanData = null;
      let lastStatus = 500;

      // Alan Client ID 순회 (기존 while(alanClientId) Failover 로직을 백엔드에서 수행)
      for (const clientId of clientIds) {
        try {
          const queryString = new URLSearchParams({
            content: systemPrompt,
            client_id: clientId,
          }).toString();

          // 기존 프론트엔드에서 호출하던 Alan AI 엔드포인트
          const res = await fetch(`https://kdt-api-function.azurewebsites.net/api/v1/question?${queryString}`);

          if (res.ok) {
            alanData = await res.json();
            break;
          }

          lastStatus = res.status;
          console.warn(`[Alan AI Failover] Client ID (${clientId}) Status: ${res.status}`);
        } catch (netErr) {
          console.warn(`[Alan AI Network Error] Client ID (${clientId})`, netErr);
        }
      }

      if (!alanData) {
        return new Response(JSON.stringify({ error: `모든 Alan Client ID 실패 (마지막 status: ${lastStatus})` }), {
          status: lastStatus,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(alanData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -------------------------------------------------------------
    // Action 2: OpenAI 이미지 생성
    // -------------------------------------------------------------
    if (action === 'generate-image') {
      const openAiKey = Deno.env.get('OPENAI_API_KEY')?.trim();

      if (!openAiKey) {
        return new Response(JSON.stringify({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt: promptText,
          n: 1,
          size: '1024x1024',
          quality: 'low',
          output_format: 'png',
        }),
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 💡 OpenAI가 거부한 실제 원인을 로그 및 응답 데이터에 담아 출력
        console.error('[OpenAI API Error Details]:', res.status, responseData);
        return new Response(
          JSON.stringify({
            error: `OpenAI API 요청 실패 (Status: ${res.status})`,
            details: responseData,
          }),
          { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: '유효한 action을 지정해주세요.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Edge Function Error]', error);
    return new Response(JSON.stringify({ error: error.message || '서버 내부 에러가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
