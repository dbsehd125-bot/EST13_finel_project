/**
 * 레시피 상세 데이터 관리 Custom Hook
 * - 현재 레시피와 같은 cuisine의 연관 레시피 조회
 * - 레시피 작성자의 profiles 정보 조회
 * - 잘못된 레시피 ID / 존재하지 않는 레시피 / 조회 오류 구분
 * - 상세 페이지 진입 시 조회수 증가
 * - 저장된 AI 단계 요약 사용
 * - AI 요약이 없을 경우 DB claim을 획득한 사용자만 Alan API 호출
 * - 다른 사용자가 생성 중이면 저장 완료된 결과를 DB에서 기다린 뒤 사용
 * - 레시피 변경 시 상세 페이지 관련 상태 초기화
 */
import { useEffect, useRef, useState } from 'react';

import { supabase } from '../../../lib/supabaseClient';
// import { getCurrentAlanClientId, getNextAlanClientId, isFailoverError } from '../../../utils/AlanApi';

// const API_BASE = '/api/v1';

/**
 * 다른 사용자가 AI 요약을 생성 중일 때
 * DB 결과 확인 간격
 */
const AI_SUMMARY_POLL_INTERVAL = 1000;

/**
 * 최대 30번 × 1초 = 약 30초 대기
 *
 * 30초가 지나도 저장되지 않았다면
 * 현재 페이지에서는 기본 조리 단계 설명을 fallback으로 보여준다.
 */
const AI_SUMMARY_POLL_COUNT = 30;

const sleep = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

/**
 * ai_step_summaries에 실제 저장값이 존재하는지 확인
 */
const hasAiSummaries = (summaries) => Array.isArray(summaries) && summaries.length > 0;

export default function useRecipeData(id) {
  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [aiStepSummaries, setAiStepSummaries] = useState([]);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);

  const lastViewedRecipeIdRef = useRef(null);

  /**
   * 상세 레시피가 바뀌면 화면 최상단으로 이동
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /**
   * 레시피 기본 데이터 조회
   */
  useEffect(() => {
    let cancelled = false;

    const fetchRecipeData = async () => {
      try {
        setLoading(true);

        setRecipe(null);
        setErrorMessage('');
        setRelatedRecipes([]);
        setAiStepSummaries([]);
        setAiSummaryLoading(false);
        setAiSummaryError(false);

        /**
         * recipes.id가 bigint이므로
         * URL parameter가 양의 정수 형태인지 먼저 검사한다.
         *
         * Number로 변환하지 않고 문자열 형태 그대로 DB에 전달해서
         * bigint가 커져도 JS Number 안전 범위 문제를 피한다.
         */
        const isValidRecipeId = typeof id === 'string' && /^[1-9]\d*$/.test(id);

        if (!isValidRecipeId) {
          setErrorMessage('잘못된 레시피 주소입니다.');
          return;
        }

        /**
         * single()이 아니라 maybeSingle() 사용
         *
         * row 없음 → data null
         * 실제 DB 오류 → error
         *
         * 두 상황을 구분할 수 있다.
         */
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (recipeError) {
          throw recipeError;
        }

        /**
         * URL 형식은 맞지만 실제 레시피가 존재하지 않는 경우
         */
        if (!recipeData) {
          setErrorMessage('레시피를 찾을 수 없습니다.');
          return;
        }

        /**
         * 레시피 작성자의 현재 profiles 정보 조회
         *
         * recipes에는 user_id만 저장하고,
         * 현재 닉네임/프로필 이미지는 profiles에서 가져온다.
         */
        let authorProfile = null;

        if (recipeData.user_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, nickname, avatar_url')
            .eq('user_id', recipeData.user_id)
            .maybeSingle();

          if (profileError) {
            /**
             * 프로필 조회 실패만으로
             * 레시피 상세 전체를 에러 처리하지 않는다.
             */
            console.error('레시피 작성자 프로필 조회 실패:', profileError);
          } else {
            authorProfile = profileData ?? null;
          }
        }

        if (cancelled) return;

        /**
         * recipe.profile 형태로 작성자 프로필을 붙인다.
         */
        const recipeWithProfile = {
          ...recipeData,
          profile: authorProfile,
        };

        setRecipe(recipeWithProfile);

        /**
         * 연관 레시피 조회
         *
         * 연관 레시피 조회가 실패했다고 해서
         * 메인 레시피 상세페이지 전체를 에러 처리하지 않는다.
         */
        try {
          const { data: relatedData, error: relatedError } = await supabase
            .from('recipes')
            .select(
              `
                id,
                thumbnail_url,
                cuisine,
                title,
                cooking_time,
                difficulty,
                like_count
              `,
            )
            .eq('cuisine', recipeData.cuisine)
            .neq('id', recipeData.id)
            .limit(4);

          if (relatedError) {
            throw relatedError;
          }

          if (!cancelled) {
            setRelatedRecipes(relatedData || []);
          }
        } catch (relatedError) {
          console.error('연관 레시피 조회 실패:', relatedError);

          if (!cancelled) {
            setRelatedRecipes([]);
          }
        }
      } catch (error) {
        console.error('레시피 조회 실패:', error);

        if (!cancelled) {
          setRecipe(null);
          setErrorMessage('레시피를 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecipeData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /**
   * 상세 페이지 진입 시 조회수 증가
   *
   * 같은 recipe.id에 대해 현재 컴포넌트 생명주기 동안
   * 중복 증가하지 않도록 ref 사용
   */
  useEffect(() => {
    if (!recipe?.id || lastViewedRecipeIdRef.current === recipe.id) {
      return;
    }

    lastViewedRecipeIdRef.current = recipe.id;

    const increaseViewCount = async () => {
      const { data, error } = await supabase.rpc('increment_recipe_view', {
        target_recipe_id: recipe.id,
      });

      if (error) {
        console.error('조회수 증가 실패:', error);
        return;
      }

      setRecipe((previousRecipe) => {
        if (!previousRecipe || previousRecipe.id !== recipe.id) {
          return previousRecipe;
        }

        return {
          ...previousRecipe,
          view_count: Number(data ?? previousRecipe.view_count ?? 0),
        };
      });
    };

    increaseViewCount();
  }, [recipe?.id]);

  /**
   * 다른 사용자가 현재 AI 요약 생성 중일 경우
   * 새로운 Alan 요청을 보내지 않고
   * DB 저장 결과를 일정 시간 기다린다.
   */
  const waitForSavedAiSummary = async (recipeId, isCancelled) => {
    for (let attempt = 0; attempt < AI_SUMMARY_POLL_COUNT; attempt += 1) {
      if (isCancelled()) {
        return null;
      }

      await sleep(AI_SUMMARY_POLL_INTERVAL);

      if (isCancelled()) {
        return null;
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('ai_step_summaries')
        .eq('id', recipeId)
        .maybeSingle();

      if (error) {
        console.error('AI 요약 대기 중 DB 조회 실패:', error);
        continue;
      }

      if (hasAiSummaries(data?.ai_step_summaries)) {
        return data.ai_step_summaries;
      }
    }

    return null;
  };

  /**
   * AI 조리 단계 요약
   */
  useEffect(() => {
    /**
     * 조리 단계가 없는 레시피
     */
    if (!recipe?.id || !Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      setAiStepSummaries([]);
      setAiSummaryLoading(false);
      setAiSummaryError(false);
      return;
    }

    /**
     * 이미 DB에 AI 요약이 저장되어 있으면
     * Alan API 호출 없이 바로 사용
     */
    if (hasAiSummaries(recipe.ai_step_summaries)) {
      setAiStepSummaries(recipe.ai_step_summaries);
      setAiSummaryLoading(false);
      setAiSummaryError(false);
      return;
    }

    let cancelled = false;
    let claimToken = null;

    const isCancelled = () => cancelled;

    const fetchAiStepSummaries = async () => {
      try {
        setAiSummaryLoading(true);
        setAiSummaryError(false);
        setAiStepSummaries([]);

        /**
         * AI 요약 생성권 획득 시도
         *
         * 성공 → UUID 반환
         * 이미 다른 사용자가 생성 중 → null 반환
         */
        const { data: claimData, error: claimError } = await supabase.rpc('claim_recipe_ai_summary', {
          target_recipe_id: recipe.id,
        });

        if (claimError) {
          throw claimError;
        }

        claimToken = claimData || null;

        /**
         * 다른 사용자가 이미 생성 중이라면
         * Alan API를 새로 호출하지 않는다.
         *
         * DB에 결과가 저장될 때까지 기다렸다가 그대로 사용한다.
         */
        if (!claimToken) {
          const savedSummaries = await waitForSavedAiSummary(recipe.id, isCancelled);

          if (cancelled) return;

          if (hasAiSummaries(savedSummaries)) {
            setAiStepSummaries(savedSummaries);

            setRecipe((previousRecipe) => {
              if (!previousRecipe || previousRecipe.id !== recipe.id) {
                return previousRecipe;
              }

              return {
                ...previousRecipe,
                ai_step_summaries: savedSummaries,
              };
            });

            return;
          }

          throw new Error('AI 요약 생성 결과를 불러오지 못했습니다.');
        }

        /**
         * 이 아래는 claim을 획득한 클라이언트만 실행된다.
         */
        const stepText = recipe.steps
          .map((step) => `${step.step}단계 | 제목: ${step.title || ''} | 설명: ${step.description || ''}`)
          .join(' / ');

        const prompt =
          `다음 요리 레시피의 각 조리 단계를 핵심 행동만 남겨 한 문장으로 짧게 요약해줘. ` +
          `반드시 입력된 단계 개수와 같은 개수로 작성하고, 순서를 바꾸거나 단계를 합치지 마. ` +
          `응답은 다른 설명이나 마크다운 없이 순수 JSON 객체 하나만 반환해. ` +
          `JSON 형식은 {"summaries":[{"step":1,"summary":"요약 문장"}]} 이야. ` +
          `모든 summary는 한국어로 작성해. ` +
          `레시피명: ${recipe.title}. 조리 단계: ${stepText}`;

        /**
         * [fix] claim api keys via edge function  
         * */
        // let alanClientId = getCurrentAlanClientId();

        // let response = null;

        /**
         * 기존 Alan Client ID failover 로직 유지
         */
        // while (alanClientId) {
        //   const queryString = new URLSearchParams({
        //     content: prompt,
        //     client_id: alanClientId,
        //   }).toString();

        //   let currentResponse = null;

        //   try {
        //     currentResponse = await fetch(`${API_BASE}/question?${queryString}`);
        //   } catch (networkError) {
        //     console.warn("Alan AI 요약 네트워크 오류:", networkError);

        //     alanClientId = getNextAlanClientId();

        //     continue;
        //   }

        //   if (currentResponse.ok) {
        //     response = currentResponse;
        //     break;
        //   }

        //   if (isFailoverError(currentResponse.status)) {
        //     alanClientId = getNextAlanClientId();

        //     continue;
        //   }

        //   throw new Error(`Alan API 요청 실패 (Status: ${currentResponse.status})`);
        // }

        // if (!response) {
        //   throw new Error("Alan API 요청에 사용할 수 있는 Client ID가 없습니다.");
        // }

        /**
         * Alan 응답 Parsing
         */
        // const data = await response.json();

        // const rawContent = data.content || data.answer || (typeof data === 'string' ? data : JSON.stringify(data));

        const { data: alanData, error: alanError } = await supabase.functions.invoke('generate-recipe', {
          body: {
            action: 'generate-recipe',
            systemPrompt: prompt,
          },
        });

        if (alanError || !alanData) {
          throw new Error(alanError?.message || 'Alan AI 레시피 요약 생성 실패');
        }

        const rawContent =
          alanData.content || alanData.answer || (typeof alanData === 'string' ? alanData : JSON.stringify(alanData));
        /**[fix] claim api keys via edge function  */

        const cleanedContent = rawContent
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleanedContent);

        if (!Array.isArray(parsed.summaries)) {
          throw new Error('Alan API 요약 응답 형식이 올바르지 않습니다.');
        }

        const summaryMap = new Map(
          parsed.summaries.map((item) => [Number(item.step), String(item.summary || '').trim()]),
        );

        /**
         * Alan이 특정 단계를 누락해도
         * 기존 단계 description/title을 fallback으로 사용
         */
        const normalizedSummaries = recipe.steps.map((step) => ({
          step: step.step,
          summary: summaryMap.get(Number(step.step)) || step.description?.trim() || step.title || '',
        }));

        if (cancelled) return;

        /**
         * AI 요약 생성 완료
         *
         * 자신이 획득했던 claim_token과 일치해야 DB에 저장된다.
         */
        const { data: savedSummaries, error: saveError } = await supabase.rpc('complete_recipe_ai_summary', {
          target_recipe_id: recipe.id,
          claim_token: claimToken,
          summaries: normalizedSummaries,
        });

        if (saveError) {
          throw saveError;
        }

        // 정상 완료되었으므로 더 이상 cleanup에서 해제할 claim 없음
        claimToken = null;

        /**
         * DB가 반환한 값을 우선 사용
         */
        const finalSummaries = hasAiSummaries(savedSummaries) ? savedSummaries : normalizedSummaries;

        if (cancelled) return;

        setAiStepSummaries(finalSummaries);

        setRecipe((previousRecipe) => {
          if (!previousRecipe || previousRecipe.id !== recipe.id) {
            return previousRecipe;
          }

          return {
            ...previousRecipe,
            ai_step_summaries: finalSummaries,
          };
        });
      } catch (error) {
        console.error('Alan AI 단계 요약 실패:', error);

        /**
         * AI 생성권을 획득한 상태에서 실패했다면
         * 자신의 claim만 해제한다.
         *
         * 그러면 다음 사용자가 다시 요약 생성을 시도할 수 있다.
         */
        if (claimToken) {
          const { error: releaseError } = await supabase.rpc('release_recipe_ai_summary_claim', {
            target_recipe_id: recipe.id,
            claim_token: claimToken,
          });

          if (releaseError) {
            console.error('AI 요약 claim 해제 실패:', releaseError);
          }
        }

        if (!cancelled) {
          setAiSummaryError(true);

          /**
           * AI 요약 실패 시에도 상세페이지가 깨지지 않도록
           * 기존 조리 단계 설명을 fallback으로 표시
           */
          setAiStepSummaries(
            recipe.steps.map((step) => ({
              step: step.step,
              summary: step.description?.trim() || step.title || '',
            })),
          );
        }
      } finally {
        if (!cancelled) {
          setAiSummaryLoading(false);
        }
      }
    };

    fetchAiStepSummaries();

    return () => {
      cancelled = true;

      if (claimToken) {
        void supabase.rpc('release_recipe_ai_summary_claim', {
          target_recipe_id: recipe.id,
          claim_token: claimToken,
        });
      }
    };
  }, [recipe?.id, recipe?.ai_step_summaries]);

  return {
    recipe,
    setRecipe,
    relatedRecipes,
    setRelatedRecipes,
    loading,
    errorMessage,
    aiStepSummaries,
    aiSummaryLoading,
    aiSummaryError,
  };
}
