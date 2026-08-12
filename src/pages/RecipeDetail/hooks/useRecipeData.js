/**
 * 레시피 상세 데이터 관리 Custom Hook
 * - 현재 레시피와 같은 cuisine의 연관 레시피 조회
 * - 상세 페이지 진입 시 조회수 증가
 * - 저장된 AI 단계 요약 사용 또는 Alan API를 통한 요약 생성·저장
 * - 레시피 변경 시 상세 페이지 관련 상태 초기화
 */
import { useEffect, useRef, useState } from "react";

import { supabase } from "../../../lib/supabaseClient";
import { getCurrentAlanClientId, getNextAlanClientId, isFailoverError } from "../../../utils/AlanApi";

const API_BASE = "/api/v1";

export default function useRecipeData(id) {
  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [aiStepSummaries, setAiStepSummaries] = useState([]);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);

  const lastViewedRecipeIdRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setRelatedRecipes([]);
        setAiStepSummaries([]);
        setAiSummaryError(false);

        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (recipeError) throw recipeError;

        setRecipe(recipeData);

        try {
          const { data: relatedData, error: relatedError } = await supabase
            .from("recipes")
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
            .eq("cuisine", recipeData.cuisine)
            .neq("id", recipeData.id)
            .limit(4);

          if (relatedError) throw relatedError;
          setRelatedRecipes(relatedData || []);
        } catch (relatedError) {
          console.error("연관 레시피 조회 실패:", relatedError);
          setRelatedRecipes([]);
        }
      } catch (error) {
        console.error("레시피 조회 실패:", error);
        setRecipe(null);
        setErrorMessage("레시피를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  useEffect(() => {
    if (!recipe?.id || lastViewedRecipeIdRef.current === recipe.id) return;

    lastViewedRecipeIdRef.current = recipe.id;

    const increaseViewCount = async () => {
      const { data, error } = await supabase.rpc("increment_recipe_view", {
        target_recipe_id: recipe.id,
      });

      if (error) {
        console.error("조회수 증가 실패:", error);
        return;
      }

      setRecipe(previousRecipe => {
        if (!previousRecipe || previousRecipe.id !== recipe.id) return previousRecipe;

        return {
          ...previousRecipe,
          view_count: Number(data ?? previousRecipe.view_count ?? 0),
        };
      });
    };

    increaseViewCount();
  }, [recipe?.id]);

  useEffect(() => {
    if (!recipe?.id || !Array.isArray(recipe.steps) || recipe.steps.length === 0) {
      setAiStepSummaries([]);
      setAiSummaryLoading(false);
      setAiSummaryError(false);
      return;
    }

    if (Array.isArray(recipe.ai_step_summaries) && recipe.ai_step_summaries.length > 0) {
      setAiStepSummaries(recipe.ai_step_summaries);
      setAiSummaryLoading(false);
      setAiSummaryError(false);
      return;
    }

    let cancelled = false;

    const fetchAiStepSummaries = async () => {
      try {
        setAiSummaryLoading(true);
        setAiSummaryError(false);
        setAiStepSummaries([]);

        const stepText = recipe.steps
          .map(
            step =>
              `${step.step}단계 | 제목: ${step.title || ""} | 설명: ${step.description || ""}`,
          )
          .join(" / ");

        const prompt =
          `다음 요리 레시피의 각 조리 단계를 핵심 행동만 남겨 한 문장으로 짧게 요약해줘. ` +
          `반드시 입력된 단계 개수와 같은 개수로 작성하고, 순서를 바꾸거나 단계를 합치지 마. ` +
          `응답은 다른 설명이나 마크다운 없이 순수 JSON 객체 하나만 반환해. ` +
          `JSON 형식은 {"summaries":[{"step":1,"summary":"요약 문장"}]} 이야. ` +
          `모든 summary는 한국어로 작성해. ` +
          `레시피명: ${recipe.title}. 조리 단계: ${stepText}`;

        let alanClientId = getCurrentAlanClientId();
        let response = null;

        while (alanClientId) {
          const queryString = new URLSearchParams({
            content: prompt,
            client_id: alanClientId,
          }).toString();

          let currentResponse = null;

          try {
            currentResponse = await fetch(`${API_BASE}/question?${queryString}`);
          } catch (networkError) {
            console.warn("Alan AI 요약 네트워크 오류:", networkError);
            alanClientId = getNextAlanClientId();
            continue;
          }

          if (currentResponse.ok) {
            response = currentResponse;
            break;
          }

          if (isFailoverError(currentResponse.status)) {
            alanClientId = getNextAlanClientId();
            continue;
          }

          throw new Error(`Alan API 요청 실패 (Status: ${currentResponse.status})`);
        }

        if (!response) throw new Error("Alan API 요청에 사용할 수 있는 Client ID가 없습니다.");

        const data = await response.json();
        const rawContent =
          data.content || data.answer || (typeof data === "string" ? data : JSON.stringify(data));
        const cleanedContent = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedContent);

        if (!Array.isArray(parsed.summaries)) {
          throw new Error("Alan API 요약 응답 형식이 올바르지 않습니다.");
        }

        const summaryMap = new Map(
          parsed.summaries.map(item => [Number(item.step), String(item.summary || "").trim()]),
        );

        const normalizedSummaries = recipe.steps.map(step => ({
          step: step.step,
          summary: summaryMap.get(Number(step.step)) || step.description?.trim() || step.title || "",
        }));

        if (cancelled) return;

        const { error: saveError } = await supabase.rpc("save_recipe_ai_summary", {
          target_recipe_id: recipe.id,
          summaries: normalizedSummaries,
        });

        if (saveError) console.error("AI 요약 DB 저장 실패:", saveError);

        setAiStepSummaries(normalizedSummaries);
        setRecipe(previousRecipe => {
          if (!previousRecipe || previousRecipe.id !== recipe.id) return previousRecipe;
          return { ...previousRecipe, ai_step_summaries: normalizedSummaries };
        });
      } catch (error) {
        console.error("Alan AI 단계 요약 실패:", error);

        if (!cancelled) {
          setAiSummaryError(true);
          setAiStepSummaries(
            recipe.steps.map(step => ({
              step: step.step,
              summary: step.description?.trim() || step.title || "",
            })),
          );
        }
      } finally {
        if (!cancelled) setAiSummaryLoading(false);
      }
    };

    fetchAiStepSummaries();

    return () => {
      cancelled = true;
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
