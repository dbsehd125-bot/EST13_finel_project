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
    // Action 1: Alan AI(Azure 서버)를 통한 레시피 JSON 생성
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

      for (const clientId of clientIds) {
        try {
          const queryString = new URLSearchParams({
            content: systemPrompt,
            client_id: clientId,
          }).toString();

          const res = await fetch(`https://kdt-api-function.azurewebsites.net/api/v1/question?${queryString}`);

          if (res.ok) {
            alanData = await res.json();
            break;
          }

          lastStatus = res.status;
          console.warn(`[Alan AI] Client ID (${clientId}) Status: ${res.status}`);
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
    // Action 2: Pexels 음식 사진 검색 (Gemini/OpenAI 이미지 생성 대체)
    // -------------------------------------------------------------
    if (action === 'generate-image') {
      const pexelsApiKey = Deno.env.get('PEXELS_API_KEY')?.trim();

      if (!pexelsApiKey) {
        return new Response(JSON.stringify({ error: 'PEXELS_API_KEY가 설정되지 않았습니다.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[Pexels] 음식 사진 검색 시작...');

      // 프롬프트에서 음식 관련 키워드 추출
      const searchQuery = promptText
        .replace(/professional|studio|food photography|beautifully plated|warm lighting|no text|4k|close-up|instruction photo|cooking step|focus on the action|food preparation|process shot|culinary style|do not include|do not show|final dish|only this|specific preparation/gi, '')
        .trim()
        .substring(0, 100) || 'Korean food dish';

      const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=5&orientation=square`;

      const pexelsRes = await fetch(pexelsUrl, {
        headers: { Authorization: pexelsApiKey },
      });

      if (!pexelsRes.ok) {
        const errBody = await pexelsRes.text().catch(() => '');
        console.error(`[Pexels Error] Status: ${pexelsRes.status}`, errBody);
        return new Response(
          JSON.stringify({ error: `Pexels 사진 검색 실패 (Status: ${pexelsRes.status})` }),
          { status: pexelsRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const pexelsData = await pexelsRes.json();
      const photos = pexelsData?.photos || [];

      if (photos.length === 0) {
        console.warn('[Pexels] 검색 결과 없음. 기본 음식 사진으로 재검색...');
        // 검색 결과 없으면 일반적인 음식 사진으로 재시도
        const fallbackRes = await fetch('https://api.pexels.com/v1/search?query=delicious+food+dish&per_page=3&orientation=square', {
          headers: { Authorization: pexelsApiKey },
        });
        const fallbackData = await fallbackRes.json();
        if (!fallbackData?.photos?.length) {
          return new Response(JSON.stringify({ error: '사진을 찾을 수 없습니다.' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        photos.push(...fallbackData.photos);
      }

      // 랜덤으로 하나 선택 (매번 같은 사진이 나오지 않도록)
      const randomIndex = Math.floor(Math.random() * photos.length);
      const selectedPhoto = photos[randomIndex];
      const imageUrl = selectedPhoto.src?.large || selectedPhoto.src?.medium || selectedPhoto.src?.original;

      console.log(`[Pexels] 사진 선택: ${imageUrl}`);

      // 이미지 다운로드 후 base64 변환
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return new Response(JSON.stringify({ error: '이미지 다운로드 실패' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const imgBuffer = await imgRes.arrayBuffer();
      const uint8Array = new Uint8Array(imgBuffer);

      // base64 인코딩
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const b64Image = btoa(binary);

      console.log('[Pexels] 이미지 base64 변환 성공!');

      // 프론트엔드 호환: 기존 OpenAI 응답 형식({ data: [{ b64_json: "..." }] })과 동일하게 반환
      return new Response(JSON.stringify({ data: [{ b64_json: b64Image }] }), {
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

