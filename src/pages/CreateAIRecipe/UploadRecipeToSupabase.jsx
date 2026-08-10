import { supabase } from "../../lib/supabaseClient";

// base64 -> Uint8Array (binary 형태 변환)
function decodeBase64(base64) {
  // data:image/png;base64, 헤더 접두사가 포함되어 있으면 제거
  const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(cleanBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * Base64 이미지 데이터를 Supabase Storage에 업로드하고 Public URL을 반환하는 함수
 */
async function uploadImageToStorage(base64Data, folderName) {
  if (!base64Data) return null;

  // 이미 HTTP URL 형태인 경우 업로드 생략
  if (base64Data.startsWith("http")) {
    return base64Data;
  }

  try {
    // 1. Base64 문자열을 binary Uint8Array로 변환
    const imageBytes = decodeBase64(base64Data);

    // 2. Storage 저장 경로 생성 (날짜/폴더/UUID.png)
    const datePrefix = new Date().toISOString().slice(0, 10);
    const imagePath = `${datePrefix}/${folderName}/${crypto.randomUUID()}.png`;

    // 3. Supabase Storage 'recipe' 버킷에 바이너리 업로드
    const { error: uploadError } = await supabase.storage
      .from("recipe-images")
      .upload(imagePath, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage 업로드 에러:", uploadError.message);
      return null;
    }

    // 4. 업로드된 파일의 Public URL 생성
    const { data: publicUrlData } = supabase.storage.from("recipe-images").getPublicUrl(imagePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("이미지 바이너리 변환 및 업로드 실패:", error);
    return null;
  }
}

/**
 * [메인 함수] 생성된 레시피 Raw JSON을 받아 Storage 업로드 및 recipes 테이블 Insert 처리
 * @param {Object} recipeRawData - AI가 생성한 완성된 Pure JSON 레시피 데이터
 * @param {Object} user - AuthContext에서 전달받은 로그인 유저 객체
 */
export async function UploadRecipeToSupabase(recipeRawData, user) {
  if (!user) {
    alert("로그인이 필요한 서비스입니다.");
    return { success: false, error: "unauthenticated" };
  }

  try {
    const userId = user.id;

    // 1. 대표 썸네일 Storage 업로드
    let thumbnailUrl = null;
    if (recipeRawData.thumbnail_url) {
      thumbnailUrl = await uploadImageToStorage(
        recipeRawData.thumbnail_url,
        `thumbnails/${userId}`,
      );
    }

    // 2. 단계별 조리 과정 이미지 Storage 업로드 (병렬 처리)
    const updatedSteps = await Promise.all(
      (recipeRawData.steps || []).map(async step => {
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

    // 3. DB 스키마 컬럼에 맞추어 Insert 객체 구성
    const dbPayload = {
      user_id: userId,
      title: recipeRawData.title,
      summary: recipeRawData.summary,
      cuisine: recipeRawData.cuisine,
      cooking_time: recipeRawData.cooking_time,
      difficulty: recipeRawData.difficulty,
      servings: recipeRawData.servings,
      tags: recipeRawData.tags || [],
      ingredients: recipeRawData.ingredients || [],
      steps: updatedSteps,
      thumbnail_url: thumbnailUrl,
    };

    // 4. recipes 테이블에 레시피 데이터 저장
    const { data: insertData, error: insertError } = await supabase
      .from("recipes")
      .insert(dbPayload)
      .select()
      .single();

    if (insertError) {
      console.error("Database Insert 실패:", insertError.message);
      return {
        success: false,
        error: "database_insert_failed",
        detail: insertError.message,
      };
    }

    console.log("DB 저장 성공:", insertData);
    return { success: true, savedRecipe: insertData };
  } catch (error) {
    console.error("레시피 저장 전체 과정 에러:", error);
    return {
      success: false,
      error: "server_error",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}
