import {
  AccessTimeOutlined,
  BookmarkBorderOutlined,
  FavoriteBorderOutlined,
  GroupOutlined,
  LightbulbOutlined,
  LocalDiningOutlined,
  RemoveRedEyeOutlined,
  ShareOutlined,
  Star,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import styles from "./RecipeDetail.module.css";
import Layout from "../../components/Layout";
import { supabase } from "../../lib/supabaseClient";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [relatedRecipes, setRelatedRecipes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 다른 레시피로 이동할 때 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  /**
   * 레시피 상세 + 연관 레시피 조회
   */
  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setRelatedRecipes([]);

        /* =========================
           현재 레시피 조회
        ========================= */

        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (recipeError) {
          throw recipeError;
        }

        setRecipe(recipeData);

        /* =========================
           연관 레시피 조회
           같은 cuisine의 다른 레시피
        ========================= */

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
              difficulty
            `,
            )
            .eq("cuisine", recipeData.cuisine)
            .neq("id", recipeData.id)
            .limit(4);

          if (relatedError) {
            throw relatedError;
          }

          setRelatedRecipes(relatedData || []);
        } catch (relatedError) {
          /**
           * 연관 레시피 조회 실패 때문에
           * 상세페이지 전체가 깨지지 않도록
           * 별도로 처리
           */
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

  /**
   * Supabase created_at 날짜
   * YYYY.MM.DD 형식으로 변환
   */
  const formatDate = dateString => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  /**
   * AI 핵심 조리 과정용 텍스트
   *
   * 향후 steps[].summary가 생기면
   * summary를 우선 사용하고,
   * 현재 데이터에서는 description 사용
   */
  const getStepSummary = step => {
    if (step?.summary?.trim()) {
      return step.summary.trim();
    }

    if (step?.description?.trim()) {
      return step.description.trim();
    }

    return step?.title || "";
  };

  /* =========================
     로딩
  ========================= */

  if (loading) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>레시피를 불러오는 중입니다.</div>
      </Layout>
    );
  }

  /* =========================
     조회 실패
  ========================= */

  if (errorMessage || !recipe) {
    return (
      <Layout activeMenu="레시피 둘러보기">
        <div className={styles.stateMessage}>{errorMessage || "레시피를 찾을 수 없습니다."}</div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="레시피 둘러보기">
      {/* =========================
          대표 이미지
      ========================= */}

      <section className={styles.hero}>
        <img src={recipe.thumbnail_url} alt={recipe.title} />
      </section>

      {/* =========================
          레시피 기본 정보
      ========================= */}

      <section className={styles.intro}>
        <p className={`text-sm ${styles.category}`}>{recipe.cuisine}</p>

        <h1 className={`font-display dtext-4xl ${styles.title}`}>{recipe.title}</h1>

        <p className={`text-m ${styles.description}`}>{recipe.summary}</p>

        <div className={styles.authorRow}>
          <div className={styles.author}>
            <div className={styles.authorImage} />

            <div>
              {/*
                작성자 프로필 연결 전까지 임시
              */}
              <p className={`text-sm ${styles.authorName}`}>요리하는정원</p>

              <p className={`text-s ${styles.date}`}>{formatDate(recipe.created_at)}</p>
            </div>
          </div>

          {/*
            후기 테이블 연결 전까지 임시
          */}
          <div className={`text-sm ${styles.rating}`}>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} fontSize="small" />
              ))}
            </div>

            <span>4.8</span>
          </div>
        </div>
      </section>

      {/* =========================
          레시피 요약 정보
      ========================= */}

      <section className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <AccessTimeOutlined />

          <div>
            <span className="text-s">조리 시간</span>

            <strong className="text-sm">{recipe.cooking_time}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <LocalDiningOutlined />

          <div>
            <span className="text-s">난이도</span>

            <strong className="text-sm">{recipe.difficulty}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <GroupOutlined />

          <div>
            <span className="text-s">인분</span>

            <strong className="text-sm">{recipe.servings}</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <RemoveRedEyeOutlined />

          <div>
            <span className="text-s">조회 수</span>

            {/*
              view_count 연결 전까지 임시
            */}
            <strong className="text-sm">18,420</strong>
          </div>
        </div>
      </section>

      {/* =========================
          액션 버튼
      ========================= */}

      <section className={styles.actions}>
        {/*
          recipe_likes 연결 전까지 임시
        */}
        <button type="button" className="text-sm">
          <FavoriteBorderOutlined />
          좋아요 1,248
        </button>

        {/*
          recipe_bookmarks 연결 전까지 임시
        */}
        <button type="button" className="text-sm">
          <BookmarkBorderOutlined />
          즐겨찾기
        </button>

        <button type="button" className="text-sm">
          <ShareOutlined />
          공유
        </button>
      </section>

      {/* =========================
          AI 핵심 조리 과정
      ========================= */}

      {recipe.steps?.length > 0 && (
        <section className={styles.aiSummary}>
          <h2 className="text-lg">✨ AI가 정리한 핵심 조리 과정</h2>

          <ol>
            {recipe.steps.map(step => (
              <li key={`summary-${step.step}`} className="text-sm">
                <span className="text-s">{step.step}</span>

                <p>{getStepSummary(step)}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* =========================
          조리 과정
      ========================= */}

      {recipe.steps?.length > 0 && (
        <section className={styles.processSection}>
          <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>조리 과정</h2>

          <div className={styles.steps}>
            {recipe.steps.map((step, index) => (
              <article
                key={step.step}
                className={`
                    ${styles.step}
                    ${index % 2 === 1 ? styles.stepReverse : ""}
                    ${!step.image ? styles.stepWithoutImage : ""}
                  `}
              >
                {/* =========================
                      단계 이미지

                      CreateAIRecipe에서 생성되고
                      Supabase Storage에 저장된
                      steps[].image를 그대로 출력
                  ========================= */}

                {step.image && (
                  <div className={styles.stepImageArea}>
                    <img
                      className={styles.stepImage}
                      src={step.image}
                      alt={`${step.step}단계 ${step.title}`}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* =========================
                      단계 내용
                  ========================= */}

                <div className={styles.stepContent}>
                  <div className={styles.stepHeader}>
                    <div className={styles.stepTitle}>
                      <span className="text-sm">{step.step}</span>

                      <h3 className="text-lg">{step.title}</h3>
                    </div>

                    {/*
                        나중에 steps[].time을
                        생성하도록 바꾸면 자동 표시 가능
                      */}
                    {step.time && <span className={`text-s ${styles.stepTime}`}>{step.time}</span>}
                  </div>

                  <p className={`text-sm ${styles.stepDescription}`}>{step.description}</p>

                  {/* =========================
                        단계별 조리 팁
                    ========================= */}

                  {step.tip && (
                    <div className={styles.stepTip}>
                      <LightbulbOutlined fontSize="small" />

                      <span className="text-sm">{step.tip}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =========================
          완성 후기
          아직 DB 연결 전
      ========================= */}

      <section className={styles.reviewSection}>
        <div className={styles.sectionHeader}>
          <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>완성 후기</h2>

          <button type="button" className={`text-sm ${styles.outlineButton}`}>
            요리 후기 남기기
          </button>
        </div>

        <div className={styles.reviewList}>
          <article className={styles.review}>
            <div className={styles.reviewHeader}>
              <div>
                <p className={`text-sm ${styles.reviewName}`}>집밥러버</p>

                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} fontSize="small" />
                  ))}
                </div>
              </div>

              <time className="text-s">2026.07.24</time>
            </div>

            <p className="text-sm">정말 맛있어요! 남편이 계속 해달래요.</p>

            <img src="https://picsum.photos/seed/review-1/300/220" alt="완성 요리 후기" />

            <div className={`text-s ${styles.reviewLike}`}>
              <FavoriteBorderOutlined fontSize="small" />
              <span>32</span>
            </div>
          </article>

          <article className={styles.review}>
            <div className={styles.reviewHeader}>
              <div>
                <p className={`text-sm ${styles.reviewName}`}>요리초보탈출</p>

                <div className={styles.reviewStars}>
                  {[1, 2, 3, 4].map(star => (
                    <Star key={star} fontSize="small" />
                  ))}
                </div>
              </div>

              <time className="text-s">2026.07.23</time>
            </div>

            <p className="text-sm">생각보다 쉽게 완성! 다음엔 새우 넣어볼게요.</p>

            <div className={`text-s ${styles.reviewLike}`}>
              <FavoriteBorderOutlined fontSize="small" />
              <span>12</span>
            </div>
          </article>
        </div>
      </section>

      {/* =========================
          댓글
          아직 DB 연결 전
      ========================= */}

      <section className={styles.commentSection}>
        <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>댓글</h2>

        <form className={styles.commentForm} onSubmit={event => event.preventDefault()}>
          <input className="text-sm" type="text" placeholder="댓글을 남겨보세요" />

          <button className="text-button" type="submit">
            등록
          </button>
        </form>
      </section>

      {/* =========================
          연관 레시피
      ========================= */}

      {relatedRecipes.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={`font-display dtext-2xl ${styles.relatedTitle}`}>
            이 레시피와 함께 보면 좋아요
          </h2>

          <div className={styles.relatedList}>
            {relatedRecipes.map(relatedRecipe => (
              <article
                key={relatedRecipe.id}
                className={styles.relatedCard}
                onClick={() => navigate(`/recipes/${relatedRecipe.id}`)}
              >
                <div className={styles.relatedImageArea}>
                  <img src={relatedRecipe.thumbnail_url} alt={relatedRecipe.title} />

                  <span className={`text-s ${styles.relatedTag}`}>{relatedRecipe.cuisine}</span>

                  {/*
                      북마크 기능 연결 전
                    */}
                  <button
                    type="button"
                    className={styles.cardFavorite}
                    aria-label="레시피 즐겨찾기"
                    onClick={event => {
                      event.stopPropagation();
                    }}
                  >
                    <FavoriteBorderOutlined fontSize="small" />
                  </button>
                </div>

                <div className={styles.relatedContent}>
                  <h3 className="text-lg">{relatedRecipe.title}</h3>

                  <div className={`text-s ${styles.relatedMeta}`}>
                    <span>
                      <AccessTimeOutlined fontSize="inherit" />

                      {relatedRecipe.cooking_time}
                    </span>

                    <span>
                      <LocalDiningOutlined fontSize="inherit" />

                      {relatedRecipe.difficulty}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
