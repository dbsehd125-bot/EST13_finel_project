import {
  AccessTimeOutlined,
  BookmarkBorderOutlined,
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  GroupOutlined,
  LightbulbOutlined,
  LocalDiningOutlined,
  RemoveRedEyeOutlined,
  ShareOutlined,
  Star,
} from "@mui/icons-material";

import styles from "./RecipeDetail.module.css";
import Layout from "../../components/Layout";

const cookingSteps = [
  {
    id: 1,
    title: "재료 손질하기",
    time: "5분",
    description: "닭다리살은 한 입 크기로 자르고, 양파는 채썰어 준비합니다.",
    tip: "닭고기는 키친타월로 물기를 제거하면 잡내가 줄어요.",
    image: "https://picsum.photos/seed/recipe-step-1/700/500",
  },
  {
    id: 2,
    title: "양념에 볶기",
    time: "8분",
    description: "달군 팬에 닭고기와 양념을 넣고 겉면이 익을 때까지 충분히 볶습니다.",
    tip: "센 불에서 빠르게 볶아야 육즙이 살아있어요.",
    image: "https://picsum.photos/seed/recipe-step-2/700/500",
  },
  {
    id: 3,
    title: "크림소스 만들기",
    time: "7분",
    description: "생크림과 삶은 면을 넣고 소스가 면에 배도록 졸입니다.",
    tip: "면수를 조금씩 넣어 농도를 맞추세요.",
    image: "https://picsum.photos/seed/recipe-step-3/700/500",
  },
  {
    id: 4,
    title: "완성하기",
    time: "3분",
    description: "치즈와 파슬리를 올리고 한소끔 더 익힌 뒤 그릇에 담습니다.",
    image: "https://picsum.photos/seed/recipe-step-4/700/500",
  },
];

const relatedRecipes = [
  {
    id: 1,
    tag: "양식",
    title: "레몬 버터 연어 스테이크",
    author: "주말의셰프",
    image: "https://picsum.photos/seed/related-1/500/380",
    rating: "4.9",
    likes: "2,104",
    comments: "341",
    time: "30분",
    level: "보통",
  },
  {
    id: 2,
    tag: "디저트",
    title: "꾸덕한 초코 바나나 오트밀",
    author: "달콤한아침",
    image: "https://picsum.photos/seed/related-2/500/380",
    rating: "4.8",
    likes: "1,120",
    comments: "173",
    time: "10분",
    level: "매우 쉬움",
  },
  {
    id: 3,
    tag: "양식",
    title: "든든한 감자 로즈마리 스튜",
    author: "느린부엌",
    image: "https://picsum.photos/seed/related-3/500/380",
    rating: "4.7",
    likes: "856",
    comments: "121",
    time: "40분",
    level: "보통",
  },
  {
    id: 4,
    tag: "양식",
    title: "봉골레 오일 파스타",
    author: "미드나잇키친",
    image: "https://picsum.photos/seed/related-4/500/380",
    rating: "4.8",
    likes: "1,330",
    comments: "202",
    time: "20분",
    level: "보통",
  },
];

export default function RecipeDetail() {
  return (
    <Layout activeMenu="레시피 둘러보기">
      {/* 대표 이미지 */}
      <section className={styles.hero}>
        <img src="https://picsum.photos/seed/cream-pasta/1400/600" alt="매콤 크림 닭갈비 파스타" />
      </section>

      {/* 레시피 기본 정보 */}
      <section className={styles.intro}>
        <p className={`text-sm ${styles.category}`}>양식</p>

        <h1 className={`font-display dtext-4xl ${styles.title}`}>매콤 크림 닭갈비 파스타</h1>

        <p className={`text-m ${styles.description}`}>
          부드러운 크림소스와 매콤한 닭갈비를 함께 즐기는 간단한 퓨전 파스타입니다.
        </p>

        <div className={styles.authorRow}>
          <div className={styles.author}>
            <div className={styles.authorImage} />

            <div>
              <p className={`text-sm ${styles.authorName}`}>요리하는정원</p>
              <p className={`text-s ${styles.date}`}>2026.07.20</p>
            </div>
          </div>

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

      {/* 레시피 요약 정보 */}
      <section className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <AccessTimeOutlined />
          <div>
            <span className="text-s">조리 시간</span>
            <strong className="text-sm">25분</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <LocalDiningOutlined />
          <div>
            <span className="text-s">난이도</span>
            <strong className="text-sm">쉬움</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <GroupOutlined />
          <div>
            <span className="text-s">인분</span>
            <strong className="text-sm">2인분</strong>
          </div>
        </div>

        <div className={styles.infoItem}>
          <RemoveRedEyeOutlined />
          <div>
            <span className="text-s">조회 수</span>
            <strong className="text-sm">18,420</strong>
          </div>
        </div>
      </section>

      {/* 액션 버튼 */}
      <section className={styles.actions}>
        <button type="button" className="text-sm">
          <FavoriteBorderOutlined />
          좋아요 1,248
        </button>

        <button type="button" className="text-sm">
          <BookmarkBorderOutlined />
          즐겨찾기
        </button>

        <button type="button" className="text-sm">
          <ShareOutlined />
          공유
        </button>
      </section>

      {/* AI 요약 */}
      <section className={styles.aiSummary}>
        <h2 className="text-lg">✨ AI가 정리한 핵심 조리 과정</h2>

        <ol>
          <li className="text-sm">
            <span className="text-s">1</span>
            닭고기와 채소를 먹기 좋은 크기로 손질합니다.
          </li>
          <li className="text-sm">
            <span className="text-s">2</span>
            팬에 닭고기와 양념을 넣고 충분히 볶습니다.
          </li>
          <li className="text-sm">
            <span className="text-s">3</span>
            생크림과 삶은 면을 넣어 농도를 맞춥니다.
          </li>
          <li className="text-sm">
            <span className="text-s">4</span>
            치즈와 파슬리를 올려 완성합니다.
          </li>
        </ol>
      </section>

      {/* 조리 과정 */}
      <section className={styles.processSection}>
        <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>조리 과정</h2>

        <div className={styles.steps}>
          {cookingSteps.map((step, index) => (
            <article
              key={step.id}
              className={`${styles.step} ${index % 2 === 1 ? styles.stepReverse : ""}`}
            >
              <img
                className={styles.stepImage}
                src={step.image}
                alt={`${step.id}단계 ${step.title}`}
              />

              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepTitle}>
                    <span className="text-sm">{step.id}</span>
                    <h3 className="text-lg">{step.title}</h3>
                  </div>

                  <span className={`text-s ${styles.stepTime}`}>{step.time}</span>
                </div>

                <p className={`text-sm ${styles.stepDescription}`}>{step.description}</p>

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

      {/* 작성자 팁 */}
      <section className={styles.writerTip}>
        <h2 className="font-display dtext-2xl">작성자의 요리 팁</h2>

        <p className="text-sm">
          크림소스가 너무 되직하면 면수를 조금씩 넣어 농도를 조절하세요. 닭다리살 대신 베이컨이나
          새우를 사용해도 잘 어울립니다.
        </p>
      </section>

      {/* 완성 후기 */}
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

      {/* 댓글 */}
      <section className={styles.commentSection}>
        <h2 className={`font-display dtext-2xl ${styles.sectionTitle}`}>댓글</h2>

        <form className={styles.commentForm} onSubmit={event => event.preventDefault()}>
          <input className="text-sm" type="text" placeholder="댓글을 남겨보세요" />
          <button className="text-button" type="submit">
            등록
          </button>
        </form>
      </section>

      {/* 연관 레시피 */}
      <section className={styles.relatedSection}>
        <h2 className={`font-display dtext-2xl ${styles.relatedTitle}`}>
          이 레시피와 함께 보면 좋아요
        </h2>

        <div className={styles.relatedList}>
          {relatedRecipes.map(recipe => (
            <article key={recipe.id} className={styles.relatedCard}>
              <div className={styles.relatedImageArea}>
                <img src={recipe.image} alt={recipe.title} />

                <span className={`text-s ${styles.relatedTag}`}>{recipe.tag}</span>

                <button type="button" className={styles.cardFavorite} aria-label="레시피 즐겨찾기">
                  <FavoriteBorderOutlined fontSize="small" />
                </button>
              </div>

              <div className={styles.relatedContent}>
                <h3 className="text-lg">{recipe.title}</h3>
                <p className="text-s">{recipe.author}</p>

                <div className={`text-s ${styles.relatedMeta}`}>
                  <span>
                    <AccessTimeOutlined fontSize="inherit" />
                    {recipe.time}
                  </span>

                  <span>
                    <LocalDiningOutlined fontSize="inherit" />
                    {recipe.level}
                  </span>
                </div>

                <div className={`text-s ${styles.relatedStats}`}>
                  <span className={styles.relatedRating}>
                    <Star fontSize="inherit" />
                    {recipe.rating}
                  </span>

                  <span>
                    <FavoriteBorderOutlined fontSize="inherit" />
                    {recipe.likes}
                  </span>

                  <span>
                    <ChatBubbleOutlineOutlined fontSize="inherit" />
                    {recipe.comments}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
