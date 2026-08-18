import { supabase } from '../../../lib/supabaseClient';

// base64 -> Uint8Array (binary 형태 변환)
function decodeBase64(base64) {
  // data:image/png;base64, 헤더 접두사가 포함되어 있으면 제거
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

import imageCompression from 'browser-image-compression';

/**
 * Base64 이미지 데이터를 Supabase Storage에 업로드하고 Public URL을 반환하는 함수
 */
async function uploadImageToStorage(base64Data, folderName) {
  if (!base64Data) return null;

  // 이미 정식 Public HTTP URL인 경우 업로드 생략
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  try {
    // 1. Base64 문자열을 binary Uint8Array로 변환
    const imageBytes = decodeBase64(base64Data);
    
    // 2. Uint8Array를 Blob으로 변환
    let imageBlob = new Blob([imageBytes], { type: 'image/png' });

    // 3. 브라우저 이미지 압축 (최적화)
    try {
      const options = {
        maxSizeMB: 0.5, // 최대 500KB로 압축
        maxWidthOrHeight: 1280, // 가로 또는 세로 최대 1280px
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(imageBlob, options);
      // 압축 성공 시 덮어쓰기
      imageBlob = compressedFile;
      console.log('이미지 압축 성공! 용량:', compressedFile.size / 1024, 'KB');
    } catch (compressError) {
      console.warn('이미지 압축 실패, 원본으로 업로드 진행:', compressError);
    }

    // 4. Storage 저장 경로 생성 (날짜/폴더/UUID.webp 또는 png)
    const datePrefix = new Date().toISOString().slice(0, 10);
    const imagePath = `${datePrefix}/${folderName}/${crypto.randomUUID()}.png`;

    // 5. Supabase Storage 'recipe-images' 버킷에 바이너리 업로드
    const { error: uploadError } = await supabase.storage.from('recipe-images').upload(imagePath, imageBlob, {
      contentType: 'image/png',
      upsert: false,
      cacheControl: '31536000',
    });

    if (uploadError) {
      console.error('Storage 업로드 에러:', uploadError.message);
      return null;
    }

    // 4. 업로드된 파일의 Public URL 생성
    const { data: publicUrlData } = supabase.storage.from('recipe-images').getPublicUrl(imagePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('이미지 바이너리 변환 및 업로드 실패:', error);
    return null;
  }
}

/**
 * [메인 함수] 생성된 레시피 Raw JSON을 받아 Storage 업로드 및 recipes 테이블 Insert 처리
 * @param {Object} recipeRawData - AI가 생성한 완성된 Pure JSON 레시피 데이터
 * @param {Object} user - AuthContext에서 전달받은 로그인 유저 객체
 */
export async function UploadRecipeToSupabase(recipeRawData, user, isTempSaved = false, recipeId = null) {
  if (!user) {
    alert('로그인이 필요한 서비스입니다.');
    return { success: false, error: 'unauthenticated' };
  }

  try {
    const userId = user.id;

    // 1. 작성자 닉네임 추출
    const nickname =
      user.user_metadata?.nickname || user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자';

    // 2. 대표 썸네일 Storage 업로드
    let thumbnailUrl = null;
    if (recipeRawData.thumbnail_url) {
      thumbnailUrl = await uploadImageToStorage(recipeRawData.thumbnail_url, `thumbnails/${userId}`);
    }

    // 3. 단계별 조리 과정 이미지 Storage 업로드 (병렬 처리)
    const updatedSteps = await Promise.all(
      (recipeRawData.steps || []).map(async (step) => {
        let stepImageUrl = null;

        if (step.image) {
          stepImageUrl = await uploadImageToStorage(step.image, `steps/${userId}`);
        }

        return {
          ...step,
          image: stepImageUrl, // Base64 대신 Public URL로 대체
        };
      }),
    );

    // 4. DB 스키마 컬럼에 맞추어 Insert 객체 구성
    const dbPayload = {
      user_id: userId,
      nickname,
      title: recipeRawData.title || '',
      summary: recipeRawData.summary || '',
      cuisine: recipeRawData.cuisine || '한식',
      cooking_time: recipeRawData.cooking_time || '10분 이내',
      difficulty: recipeRawData.difficulty || '초간단',
      servings: recipeRawData.servings || '1인분',
      tags: recipeRawData.tags || [],
      diets: recipeRawData.diets || '해당없음',
      ingredients: recipeRawData.ingredients || [],
      steps: updatedSteps,
      thumbnail_url: thumbnailUrl,
      ispublic: recipeRawData.ispublic || true,
      istempsaved: isTempSaved,
    };

    let resultData = null;
    let resultError = null;

    // 5. recipeId 존재 여부에 따른 UPDATE / INSERT 조건 분기
    if (recipeId) {
      // 기존 레시피 수정 (UPDATE)
      const { data, error } = await supabase
        .from('recipes')
        .update(dbPayload)
        .eq('id', recipeId)
        .eq('user_id', userId)
        .select()
        .single();

      resultData = data;
      resultError = error;
    } else {
      // 신규 레시피 생성 (INSERT)
      const { data, error } = await supabase.from('recipes').insert(dbPayload).select().single();

      resultData = data;
      resultError = error;
    }

    if (resultError) {
      console.error(`Database ${recipeId ? 'Update' : 'Insert'} 실패:`, resultError.message);
      return {
        success: false,
        error: recipeId ? 'database_update_failed' : 'database_insert_failed',
        detail: resultError.message,
      };
    }

    console.log(`DB ${recipeId ? '수정' : '생성'} 성공:`, resultData);

    return {
      success: true,
      savedRecipe: resultData,
    };
  } catch (error) {
    console.error('레시피 저장 처리 전체 과정 에러:', error);

    return {
      success: false,
      error: 'server_error',
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
