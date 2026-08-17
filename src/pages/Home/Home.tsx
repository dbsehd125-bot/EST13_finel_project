import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { Layout } from "../../components";
import SEO from "../../components/SEO";
import { supabase } from "../../lib/supabaseClient";
import type {
  HomeRecipe,
  MatchRecipe,
  MealPlanItem,
  BackupMeal,
  HomeReview,
  ToastState,
} from "../../types/home";
import "./Home.css";

// --- 상수 및 더미 데이터 (컴포넌트 외부로 분리하여 렌더링 성능 최적화) ---
const categories: readonly string[] = [
  "전체",
  "한식",
  "양식",
  "중식",
  "일식",
  "디저트",
  "다이어트",
  "야식",
];

const recipeData: HomeRecipe[] = [
  {
    id: 1,
    category: "양식",
    title: "레몬 버터 연어 스테이크",
    author: "주말의셰프",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop",
    time: "30분",
    difficulty: "보통",
    rating: 4.9,
    likes: "2,104",
    comments: 341,
  },
  {
    id: 2,
    category: "다이어트",
    title: "채소로 만드는 두부 덮밥",
    author: "초록식탁",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
    time: "20분",
    difficulty: "쉬움",
    rating: 4.9,
    likes: "1,567",
    comments: 288,
  },
  {
    id: 3,
    category: "양식",
    title: "봉골레 오일 파스타",
    author: "미드나잇키친",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=600&auto=format&fit=crop",
    time: "20분",
    difficulty: "보통",
    rating: 4.8,
    likes: "1,330",
    comments: 202,
  },
  {
    id: 4,
    category: "한식",
    title: "아보카도 명란 비빔밥",
    author: "건강식탁",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=600&auto=format&fit=crop",
    time: "15분",
    difficulty: "매우 쉬움",
    rating: 4.7,
    likes: "1,120",
    comments: 156,
  },
  {
    id: 5,
    category: "중식",
    title: "바삭바삭 꿔바로우",
    author: "차이나키친",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop",
    time: "40분",
    difficulty: "보통",
    rating: 4.8,
    likes: "942",
    comments: 118,
  },
  {
    id: 6,
    category: "일식",
    title: "두툼한 수제 돈카츠",
    author: "도쿄키친",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1599321955726-e04842669811?q=80&w=600&auto=format&fit=crop",
    time: "35분",
    difficulty: "보통",
    rating: 4.9,
    likes: "1,205",
    comments: 184,
  },
  {
    id: 7,
    category: "디저트",
    title: "달콤 촉촉 바나나 푸딩",
    author: "달콤베이커리",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop",
    time: "15분",
    difficulty: "쉬움",
    rating: 4.7,
    likes: "863",
    comments: 92,
  },
  {
    id: 8,
    category: "야식",
    title: "매콤 달달 치즈 떡볶이",
    author: "야식마스터",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
    image: "https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop",
    time: "20분",
    difficulty: "쉬움",
    rating: 4.9,
    likes: "2,408",
    comments: 310,
  },
];

function formatRelativeTime(dateString: string): string {
  const createdAt = new Date(dateString);
  const diff = Date.now() - createdAt.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "방금 전";
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`;
  if (diff < day * 2) return "어제";

  return createdAt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const matchRecipes: MatchRecipe[] = [
  {
    title: "두부 닭가슴살 김치 볶음밥",
    desc: "보유하신 재료로 만들 수 있는 매콤 담백하고 단백질 가득한 한 그릇 메뉴에요.",
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=800&auto=format&fit=crop",
    time: "20분",
    difficulty: "쉬움",
    servings: "2인분",
  },
  {
    title: "백종원풍 파송송 계란국",
    desc: "계란 and 대파만으로 5분 만에 깊은 감칠맛을 내는 맑고 따뜻한 국 요리입니다.",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop",
    time: "10분",
    difficulty: "매우 쉬움",
    servings: "1인분",
  },
  {
    title: "두부 김치 조림",
    desc: "두부와 숙성된 김치에 대파, 양파를 팍팍 넣고 자글자글 끓여낸 밥도둑 반찬입니다.",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=800&auto=format&fit=crop",
    time: "25분",
    difficulty: "보통",
    servings: "2인분",
  },
  {
    title: "양파 가득 닭가슴살 볶음",
    desc: "양파와 닭가슴살을 굴소스와 마늘로 볶아 든든한 다이어트 도시락으로 추천합니다.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop",
    time: "15분",
    difficulty: "쉬움",
    servings: "1인분",
  },
];

const backupMeals: BackupMeal[] = [
  { title: "포치드 에그 브런치", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop" },
  { title: "봉골레 오일 파스타", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&auto=format&fit=crop" },
  { title: "버터 연어 스테이크", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop" },
  { title: "얼큰 순두부 계란탕", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&auto=format&fit=crop" },
  { title: "매콤 크림 파스타", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop" },
  { title: "든든 채소 샐러드 볼", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop" },
  { title: "밤 티라미수", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=400&auto=format&fit=crop" },
  { title: "돼지고기 김치찌개", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=400&auto=format&fit=crop" },
  { title: "스팸 무스비", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop" },
];

const reviewsData: HomeReview[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=600&auto=format&fit=crop",
    dishName: "레몬 버터 연어",
    recipeName: "레몬 버터 연어 스테이크",
    username: "집밥러버",
    time: "2시간 전",
    text: "레몬 버터 연어 처음으로 만들어봤는데 대성공? 레몬양만 조절하면 완벽해요",
    likes: 128,
    comments: 24,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
    dishName: "두부 덮밥",
    recipeName: "냉장고 채소로 만드는 두부덮밥",
    username: "요리초보탈출",
    time: "5시간 전",
    text: "두부 덮밥 다이어트 중인데 진짜 든든하고 맛있어요. 매일 해먹는 중!",
    likes: 98,
    comments: 18,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&auto=format&fit=crop",
    dishName: "김치전",
    recipeName: "바삭한 김치 치즈전",
    username: "저녁마다요리",
    time: "어제",
    text: "김치전 바삭하게 부치는 팁 덕분에 인생 김치전 완성했습니다",
    likes: 210,
    comments: 41,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop",
    dishName: "포치드 에그 브런치",
    recipeName: "포치드 에그 브런치 플레이트",
    username: "브런치소녀",
    time: "어제",
    text: "주말 브런치로 포치드 에그 플레이트를 만들었어요. 사진도 예쁘게 나옴!",
    likes: 174,
    comments: 33,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
  },
];

export default function Home(): React.ReactElement {
  // 오늘 뭐 먹지? 레시피 섹션 상태
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [wishedIds, setWishedIds] = useState<(number | string)[]>([]);
  const [dbRecipes, setDbRecipes] = useState<HomeRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDbRecipes = async (): Promise<void> => {
      try {
        setRecipesLoading(true);
        // Supabase에서 레시피 데이터 조회
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .order("like_count", { ascending: false, nullsFirst: false })
          .limit(8);

        if (error) throw error;

        if (data && data.length > 0) {
          // DB 데이터를 Home 레시피 카드가 읽을 수 있는 규격으로 정규화
          const normalized: HomeRecipe[] = data.map((r: any) => ({
            id: r.id,
            category: r.cuisine || "기타",
            title: r.title,
            author: r.nickname || "레시피 장인",
            avatar: r.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
            image: r.thumbnail_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
            time: r.cooking_time ? (String(r.cooking_time).includes("분") ? r.cooking_time : `${r.cooking_time}분`) : "30분",
            difficulty: r.difficulty || "보통",
            rating: r.rating || 4.8,
            likes: r.like_count !== undefined ? String(r.like_count) : "0",
            comments: r.comments_count || 0,
          }));
          setDbRecipes(normalized);
        }
      } catch (error) {
        console.warn("로컬 환경이거나 Supabase 조회에 실패하여 Fallback 더미 데이터를 사용합니다:", error);
      } finally {
        setRecipesLoading(false);
      }
    };

    fetchDbRecipes();
  }, []);

  const [communityReviews, setCommunityReviews] = useState<HomeReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCommunityReviews = async (): Promise<void> => {
      try {
        setReviewsLoading(true);
        // Supabase에서 커뮤니티 게시글 조회 (최신 10개)
        const { data, error } = await supabase
          .from("community_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted: HomeReview[] = data.map((r: any) => ({
            id: r.id,
            image: r.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop",
            dishName: r.recipe_name || "맛있는 요리",
            recipeName: r.recipe_name ? `${r.recipe_name} 레시피` : "자유 이야기",
            username: r.nickname || "요리러버",
            time: formatRelativeTime(r.created_at),
            text: r.content || "정말 맛있게 만들어졌어요!",
            likes: r.like_count || 0,
            comments: r.comment_count || 0,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
          }));
          setCommunityReviews(formatted);
        }
      } catch (error) {
        console.warn("커뮤니티 데이터를 가져오지 못해 로컬 더미 리뷰 데이터를 사용합니다:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchCommunityReviews();
  }, []);

  // AI 냉장고 털기 섹션 상태
  const [tags, setTags] = useState<string[]>(["계란", "양파", "대파", "김치", "두부", "닭가슴살"]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<MatchRecipe>({
    title: "두부 닭가슴살 김치 볶음밥",
    desc: "보유하신 재료로 만들 수 있는 매콤 담백하고 단백질 가득한 한 그릇 메뉴에요.",
    image: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=800&auto=format&fit=crop",
    time: "20분",
    difficulty: "쉬움",
    servings: "2인분",
  });

  // 이번 주 식단 미리보기 섹션 상태
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([
    { id: "mon", day: "월", type: "아침", title: "밤 티라미수", image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=400&auto=format&fit=crop" },
    { id: "tue", day: "화", type: "점심", title: "든든 채소 샐러드 볼", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop" },
    { id: "wed", day: "수", type: "저녁", title: "매콤 크림 파스타", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=400&auto=format&fit=crop" },
    { id: "thu", day: "목", type: "저녁", title: "얼큰 순두부 계란탕", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&auto=format&fit=crop" },
    { id: "fri", day: "금", type: "저녁", title: "버터 연어 스테이크", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop" },
    { id: "sat", day: "토", type: "점심", title: "봉골레 오일 파스타", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&auto=format&fit=crop" },
    { id: "sun", day: "일", type: "아침", title: "포치드 에그 브런치", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop" },
  ]);

  // 사용자 리뷰 섹션 상태
  const [likedReviews, setLikedReviews] = useState<(number | string)[]>([]);

  // 인라인 재료 추가 상태
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [newTagInput, setNewTagInput] = useState<string>("");

  // 토스트 메시지 상태
  const [toast, setToast] = useState<ToastState>({ message: "", visible: false, type: "success" });
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 토스트 보이기 함수
  const showToast = (message: string, type: ToastState["type"] = "success"): void => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, visible: true, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const activeRecipes: HomeRecipe[] = dbRecipes.length > 0 ? dbRecipes : recipeData;

  let filteredRecipes: HomeRecipe[] = activeRecipes.filter(
    recipe => selectedCategory === "전체" || recipe.category === selectedCategory,
  );

  // 💡 스마트 하이브리드 Fallback: DB를 통해 받아온 결과 중 선택된 카테고리의 실제 레시피가 전혀 없는 경우,
  // 썰렁하게 비워두는 대신 로컬 mock 데이터에서 해당 카테고리 요리를 가져와 채워줍니다.
  if (dbRecipes.length > 0 && filteredRecipes.length === 0 && selectedCategory !== "전체") {
    filteredRecipes = recipeData.filter(
      recipe => recipe.category === selectedCategory,
    );
  }

  const activeReviews: HomeReview[] = communityReviews.length > 0 ? communityReviews : reviewsData;

  const toggleWish = (id: number | string): void => {
    const isWished = wishedIds.includes(id);
    setWishedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
    if (!isWished) {
      showToast("관심 레시피에 추가되었습니다.", "success");
    } else {
      showToast("관심 레시피에서 제외되었습니다.", "info");
    }
  };

  // 재료 태그 제어 함수들
  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter(t => t !== tagToRemove));
    showToast(`"${tagToRemove}" 재료를 삭제했습니다.`, "info");
  };

  const handleAddTagSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      showToast("이미 등록된 재료입니다.", "warning");
    } else {
      setTags([...tags, trimmed]);
      showToast(`"${trimmed}" 재료를 추가했습니다.`, "success");
      setNewTagInput("");
      setIsAddingTag(false);
    }
  };

  // 사진 업로드 제어
  const handleUploadClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`[AI 인식 완료] '${file.name}' 분석을 통해 '파프리카', '양배추'가 추가되었습니다!`, "success");
      const extraTags = ["파프리카", "양배추"];
      const updatedTags = [...tags];
      extraTags.forEach(t => {
        if (!updatedTags.includes(t)) {
          updatedTags.push(t);
        }
      });
      setTags(updatedTags);
    }
  };

  // AI 레시피 추천 시뮬레이션
  const handleRecommend = (): void => {
    if (tags.length === 0) {
      showToast("최소 한 개 이상의 재료를 입력해 주세요!", "warning");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const filtered = matchRecipes.filter(r => r.title !== recommendation.title);
      const chosen = filtered[Math.floor(Math.random() * filtered.length)] || matchRecipes[0];
      setRecommendation(chosen);
      showToast("새로운 AI 추천 레시피가 생성되었습니다. ✨", "success");
    }, 1200);
  };

  // 식단 개별 교체 상태
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // 식단 개별 교체 제어
  const handleReplaceMeal = (id: string): void => {
    setReplacingId(id);
    const currentMeal = mealPlan.find(m => m.id === id);
    if (!currentMeal) return;

    const filteredBackup = backupMeals.filter(b => b.title !== currentMeal.title);
    const randomMeal = filteredBackup[Math.floor(Math.random() * filteredBackup.length)] || backupMeals[0];
    
    setMealPlan(prev => 
      prev.map(m => m.id === id ? { ...m, title: randomMeal.title, image: randomMeal.image } : m),
    );
    showToast(`${currentMeal.day}요일 식단이 교체되었습니다.`, "success");

    setTimeout(() => {
      setReplacingId(null);
    }, 400);
  };

  // AI 일주일 식단 생성 제어
  const handleGeneratePlan = (): void => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
      setIsGeneratingPlan(false);
      setMealPlan(prev => prev.map(m => {
        const randomMeal = backupMeals[Math.floor(Math.random() * backupMeals.length)];
        return { ...m, title: randomMeal.title, image: randomMeal.image };
      }));
      showToast("AI가 새로운 일주일 맞춤형 식단을 구성했습니다! ✨", "success");
    }, 1200);
  };

  // 사용자 리뷰 좋아요 제어
  const toggleLikeReview = (id: number | string): void => {
    const isLiked = likedReviews.includes(id);
    setLikedReviews(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
    if (!isLiked) {
      showToast("리뷰를 추천했습니다.", "success");
    }
  };

  return (
    <Layout activeMenu="홈" fullWidth={true}>
      <SEO
        title="깃깔나는 레시피 - AI 냉장고 털기 및 맞춤형 식단 추천"
        description="남은 재료나 떠오른 메뉴를 입력하면 AI가 레시피와 요리 이미지를 추천해 드립니다. 일주일 맞춤형 식단과 인기 레시피를 만나보세요!"
        url="/"
      />
      {/* 1. 메인 히어로 섹션 */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* 왼쪽 텍스트 콘텐츠 */}
          <div className="hero-content">
            {/* 뱃지 태그 */}
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>한 끼의 생각이 레시피와 이미지로</span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="hero-title">
              오늘의 생각을<br />
              맛있는 레시피로
            </h1>

            {/* 서브 설명글 */}
            <p className="hero-description">
              남은 재료나 떠오른 메뉴를 입력하면 AI가 나만의 레시피<br className="mobile-br" />와 완성 이미지<br className="desktop-br" />
              를 만들어드려요
            </p>

            {/* 버튼 영역 */}
            <div className="hero-buttons">
              <Link to="/ai" className="btn btn-primary">
                <span className="btn-icon">✨</span>
                AI로 레시피 만들기
              </Link>
              <Link to="/recipes" className="btn btn-secondary">
                인기 레시피 둘러보기
              </Link>
            </div>
          </div>

          {/* 오른쪽 이미지 영역 */}
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop" 
              alt="음식 레시피 대표 이미지" 
              className="hero-image"
              fetchPriority="high"
              decoding="async"
            />
            {/* 태블릿용 보라색 플로팅 버튼 */}
            <Link to="/ai" className="fab-btn-purple" aria-label="AI 레시피 액션">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                <path d="m10 9 5 3-5 3z"/>
              </svg>
            </Link>
          </div>

        </div>
      </section>

      {/* 2. 오늘 뭐 먹지? 레시피 섹션 */}
      <section className="recipe-section">
        <div className="recipe-container">
          
          {/* 우측 상단 플로팅 버튼 */}
          <Link to="/ai" className="fab-btn" title="AI 레시피 생성" aria-label="AI 레시피 생성">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <path d="m10 9 5 3-5 3z" />
            </svg>
          </Link>

          {/* 섹션 헤더 */}
          <header className="section-header">
            <div className="header-titles">
              <h2 className="main-title">오늘 뭐 먹지?</h2>
              <p className="sub-title">지금 가장 인기 있는 레시피를 만나보세요.</p>
            </div>
            <Link to="/recipes" className="view-all-link">
              전체보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </header>

          {/* 카테고리 필터 */}
          <nav className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </nav>

          {/* 레시피 리스트 그리드 */}
          <div className="recipe-grid">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => {
                const isWished = wishedIds.includes(recipe.id);
                return (
                  <article key={recipe.id} className="recipe-card">
                    <div className="card-image-wrap">
                      <span className="category-badge">{recipe.category}</span>
                      <button 
                        className={`wish-btn ${isWished ? "active" : ""}`}
                        onClick={() => toggleWish(recipe.id)}
                        aria-label="관심 레시피 등록"
                      >
                        <svg 
                          width="18" 
                          height="18" 
                          viewBox="0 0 24 24" 
                          fill={isWished ? "#FF5E36" : "none"} 
                          stroke={isWished ? "#FF5E36" : "currentColor"} 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                      <Link to={`/recipes/${recipe.id}`} className="card-image-link">
                        <img src={recipe.image} alt={recipe.title} className="card-image" loading="lazy" decoding="async" />
                      </Link>
                    </div>
                    <div className="card-info">
                      <h3 className="card-title">
                        <Link to={`/recipes/${recipe.id}`} className="card-title-link">
                          {recipe.title}
                        </Link>
                      </h3>
                      <div className="author-info">
                        <div 
                          className="author-avatar" 
                          style={{ backgroundImage: `url('${recipe.avatar}')` }}
                          role="img"
                          aria-label={`${recipe.author} 아바타`}
                        ></div>
                        <span className="author-name">{recipe.author}</span>
                      </div>
                      <div className="meta-info">
                        <span className="time">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg> 
                          {` ${recipe.time}`}
                        </span>
                        <span className="difficulty">{recipe.difficulty}</span>
                      </div>
                      <div className="stats-info">
                        <span className="stat-item rating">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5E36" stroke="#FF5E36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg> 
                          {` ${recipe.rating}`}
                        </span>
                        <span className="stat-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg> 
                          {` ${recipe.likes}`}
                        </span>
                        <span className="stat-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg> 
                          {` ${recipe.comments}`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 0", color: "#888" }}>
                <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>✨</span>
                해당 카테고리의 레시피가 준비 중입니다.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. 에디터 추천 섹션 */}
      <section className="editor-pick-section">
        <div className="editor-pick-container">
          
          {/* 헤더 영역 */}
          <header className="section-header">
            <h2 className="main-title">에디터 추천</h2>
            <p className="sub-title">계절과 기분에 어울리는 레시피를 골라봤어요.</p>
          </header>

          {/* 그리드 레이아웃 영역 */}
          <div className="editor-grid">
            
            {/* 왼쪽 큰 카드 (2x2 크기) */}
            <Link to="/recipes" className="editor-card card-large">
              <img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop" alt="비 오는 날 생각나는 따뜻한 국물 요리" className="card-bg" loading="lazy" decoding="async" />
              <div className="card-overlay">
                <span className="badge">에디터 추천</span>
                <h3 className="title">비 오는 날 생각나는 따뜻한 국물 요리</h3>
                <p className="desc">뜨끈한 국물 한 그릇으로 마음까지 데우는 레시피 모음</p>
              </div>
            </Link>

            {/* 우측 상단 카드 1 */}
            <Link to="/recipes" className="editor-card">
              <img src="https://images.unsplash.com/photo-1553163147-622ab57be1c7?q=80&w=600&auto=format&fit=crop" alt="10분 만에 완성하는 자취 요리" className="card-bg" loading="lazy" decoding="async" />
              <div className="card-overlay">
                <span className="badge">자취</span>
                <h3 className="title">10분 만에 완성하는 자취 요리</h3>
              </div>
            </Link>

            {/* 우측 상단 카드 2 */}
            <Link to="/recipes" className="editor-card">
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop" alt="냉장고 속 채소를 활용한 한 끼" className="card-bg" loading="lazy" decoding="async" />
              <div className="card-overlay">
                <span className="badge">냉파</span>
                <h3 className="title">냉장고 속 채소를 활용한 한 끼</h3>
              </div>
            </Link>

            {/* 우측 하단 카드 1 */}
            <Link to="/recipes" className="editor-card">
              <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop" alt="이번주 가장 사랑받는 레시피" className="card-bg" loading="lazy" decoding="async" />
              <div className="card-overlay">
                <span className="badge">위클리</span>
                <h3 className="title">이번주 가장 사랑받는 레시피</h3>
              </div>
            </Link>

            {/* 우측 하단 카드 2 */}
            <Link to="/recipes" className="editor-card">
              <img src="https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop" alt="주말에 천천히 만들고 싶은 디저트" className="card-bg" loading="lazy" decoding="async" />
              <div className="card-overlay">
                <span className="badge">디저트</span>
                <h3 className="title">주말에 천천히 만들고 싶은 디저트</h3>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 4. AI 냉장고 털기 섹션 */}
      <section className="ai-fridge-section">
        <div className="ai-fridge-container">
          
          {/* 왼쪽 콘텐츠 및 입력 영역 */}
          <div className="fridge-content">
            {/* 상단 뱃지 */}
            <div className="ai-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="m10 9 5 3-5 3z"/></svg>
              AI 냉장고 털기
            </div>

            {/* 타이틀 및 설명 */}
            <h2 className="main-title">냉장고 속 재료로 무엇을 만들 수 있을까요?</h2>
            <p className="sub-desc">가지고 있는 재료를 추가하면 AI가 어울리는 레시피를 추천해드려요.</p>

            {/* 재료 입력 박스 */}
            <div className="input-box">
              <div className="tag-list">
                {tags.map((tag) => (
                  <button 
                    key={tag} 
                    type="button"
                    className="tag tag-button"
                    onClick={() => handleRemoveTag(tag)}
                    title={`${tag} 삭제하기`}
                    aria-label={`${tag} 재료 삭제`}
                  >
                    {tag}
                    <span className="tag-remove-x" aria-hidden="true">&times;</span>
                  </button>
                ))}
                
                {isAddingTag ? (
                  <form onSubmit={handleAddTagSubmit} className="add-tag-form" onBlur={(e) => {
                    // input 밖을 클릭 시 자동 닫힘 (약간의 딜레이로 버튼 클릭 허용)
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setTimeout(() => setIsAddingTag(false), 200);
                    }
                  }}>
                    <input 
                      type="text" 
                      value={newTagInput} 
                      onChange={(e) => setNewTagInput(e.target.value)} 
                      placeholder="재료명 입력" 
                      className="add-tag-input"
                      autoFocus
                    />
                    <button type="submit" className="add-tag-submit-btn">추가</button>
                  </form>
                ) : (
                  <button className="add-tag-btn" onClick={() => setIsAddingTag(true)}>+ 재료 추가</button>
                )}
              </div>
              
              <div className="action-buttons">
                {/* 사진 업로드 버튼 및 숨겨진 file input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button className="btn-upload" onClick={handleUploadClick}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  냉장고 사진 업로드
                </button>
                <button className="btn-recommend" onClick={handleRecommend} disabled={isLoading}>
                  {isLoading ? "추천 중..." : "AI 레시피 추천받기"}
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽 결과 미리보기 영역 */}
          <div className={`fridge-preview ${isLoading ? "loading" : ""}`}>
            <div>
              <div className="preview-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><path d="m10 9 5 3-5 3z"/></svg>
                {isLoading ? "AI 분석 중..." : "AI 추천 레시피"}
              </div>
              
              {isLoading ? (
                <div className="preview-skeleton-wrapper">
                  <div className="skeleton-img pulse">
                    <span className="spinner-emoji">🍳</span>
                  </div>
                  <div className="skeleton-info">
                    <div className="skeleton-line title pulse"></div>
                    <div className="skeleton-line desc pulse"></div>
                    <div className="skeleton-line desc short pulse"></div>
                    <div className="skeleton-line meta pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/ai" className="preview-img-link">
                    <img src={recommendation.image} alt={recommendation.title} className="preview-img" loading="lazy" decoding="async" />
                  </Link>
                  <div className="preview-info">
                    <h3 className="preview-title">
                      <Link to="/ai" className="preview-title-link">
                        {recommendation.title}
                      </Link>
                    </h3>
                    <p className="preview-desc">{recommendation.desc}</p>
                    <div className="preview-meta">
                      <span>🕒 {recommendation.time}</span>
                      <span>⭐ {recommendation.difficulty}</span>
                      <span>👥 {recommendation.servings}</span>
                    </div>
                    <Link to="/ai" className="preview-action-btn">
                      상세 요리법 & AI 가이드 보기
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 5. 이번 주 식단 미리보기 섹션 */}
      <section className="meal-plan-section">
        <div className="meal-plan-container">
          
          {/* 상단 헤더 영역 */}
          <header className="plan-header">
            <div className="header-text">
              <h2 className="main-title">이번 주 식단 미리보기</h2>
              <p className="sub-desc">식단에 담긴 재료는 장보기 목록으로 바로 연결돼요.</p>
            </div>
            
            <button className="ai-plan-btn" onClick={handleGeneratePlan} disabled={isGeneratingPlan}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                <path d="m10 9 5 3-5 3z"/>
              </svg>
              {isGeneratingPlan ? "식단 구성 중..." : "AI로 일주일 식단 만들기"}
            </button>
          </header>

          {/* 식단 카드 그리드 영역 */}
          <div className="plan-grid">
            {mealPlan.map((plan) => (
              <article key={plan.id} className={`plan-card ${isGeneratingPlan ? "loading" : ""} ${replacingId === plan.id ? "flash" : ""}`}>
                {isGeneratingPlan ? (
                  <div className="plan-skeleton">
                    <div className="skeleton-img pulse">
                      <span className="spinner-icon">🔄</span>
                    </div>
                    <div className="card-body">
                      <div className="skeleton-line sm pulse"></div>
                      <div className="skeleton-line md pulse"></div>
                      <div className="skeleton-line lg pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/recipes" className="card-img-link">
                      <img src={plan.image} alt={plan.title} className="card-img" loading="lazy" decoding="async" />
                    </Link>
                    
                    <div className="card-body">
                      <div className="card-meta">
                        <span className="day">{plan.day}</span>
                        <span className="meal-type">{plan.type}</span>
                      </div>
                      <h3 className="recipe-title" title={plan.title}>
                        <Link to="/recipes" className="recipe-title-link">
                          {plan.title}
                        </Link>
                      </h3>
                      <button 
                        className="replace-btn"
                        onClick={() => handleReplaceMeal(plan.id)}
                        disabled={isGeneratingPlan}
                        title="다른 식단으로 교체하기"
                        aria-label={`${plan.day}요일 ${plan.title} 다른 식단으로 교체`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.6 5.6M2.5 22v-6h6M2.66 8.43a10 10 0 1 1 .59 9.21l-5.6-5.6"/>
                        </svg>
                        교체
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* 6. 사용자 리뷰 섹션 */}
      <section className="user-review-section">
        <div className="user-review-container">
          
          {/* 상단 헤더 영역 */}
          <header className="section-header">
            <div className="header-text">
              <h2 className="main-title">오늘도 맛있게 만들었어요</h2>
              <p className="sub-desc">다른 사용자의 요리 경험과 작은 팁을 확인해보세요</p>
            </div>
            
            <Link to="/community" className="more-link">
              더보기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </header>

          {/* 리뷰 카드 무한 롤링 슬라이더 영역 */}
          <div className="review-slider-track">
            <div className="review-slider-list animate-slide-left">
              {/* 첫 번째 카드 그룹 */}
              {activeReviews.map((review) => {
                const isLiked = likedReviews.includes(review.id);
                const totalLikes = isLiked ? review.likes + 1 : review.likes;
                return (
                  <article key={review.id} className="review-card">
                    <Link to="/community" className="review-img-link">
                      <img src={review.image} alt={review.dishName} className="card-img" loading="lazy" decoding="async" />
                    </Link>
                    <div className="card-content">
                      <div className="user-info">
                        <div 
                          className="avatar" 
                          style={{ backgroundImage: `url('${review.avatar}')` }}
                          role="img"
                          aria-label={`${review.username} 프로필 사진`}
                        ></div>
                        <span className="username">{review.username}</span>
                        <span className="time">{review.time}</span>
                      </div>
                      <p className="review-text">{review.text}</p>
                      
                      <Link to="/community" className="recipe-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                        {review.recipeName}
                      </Link>
                      
                      <div className="card-stats">
                        <button 
                          type="button"
                          className={`stat stat-btn ${isLiked ? "liked" : ""}`}
                          onClick={() => toggleLikeReview(review.id)}
                          title="좋아요 클릭"
                          aria-label={`리뷰 좋아요 ${totalLikes}개`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg> 
                          {` ${totalLikes}`}
                        </button>
                        <span className="stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg> 
                          {` ${review.comments}`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* 무한 롤링 구현을 위한 두 번째 (복제된) 카드 그룹 */}
              {activeReviews.map((review) => {
                const isLiked = likedReviews.includes(review.id);
                const totalLikes = isLiked ? review.likes + 1 : review.likes;
                return (
                  <article key={`clone-${review.id}`} className="review-card">
                    <Link to="/community" className="review-img-link">
                      <img src={review.image} alt={review.dishName} className="card-img" loading="lazy" decoding="async" />
                    </Link>
                    <div className="card-content">
                      <div className="user-info">
                        <div 
                          className="avatar" 
                          style={{ backgroundImage: `url('${review.avatar}')` }}
                          role="img"
                          aria-label={`${review.username} 프로필 사진`}
                        ></div>
                        <span className="username">{review.username}</span>
                        <span className="time">{review.time}</span>
                      </div>
                      <p className="review-text">{review.text}</p>
                      
                      <Link to="/community" className="recipe-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                        </svg>
                        {review.recipeName}
                      </Link>
                      
                      <div className="card-stats">
                        <button 
                          type="button"
                          className={`stat stat-btn ${isLiked ? "liked" : ""}`}
                          onClick={() => toggleLikeReview(review.id)}
                          title="좋아요 클릭"
                          aria-label={`리뷰 좋아요 ${totalLikes}개`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg> 
                          {` ${totalLikes}`}
                        </button>
                        <span className="stat">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg> 
                          {` ${review.comments}`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 7. 레시피 공유 배너 섹션 */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          
          {/* 배너 영역 */}
          <div className="cta-banner">
            {/* 텍스트 콘텐츠 */}
            <div className="cta-content">
              <h2 className="cta-title">나만의 레시피를<br className="mobile-br" /> 공유해보세요.</h2>
              <p className="cta-desc">사진이 없어도 괜찮아요. AI가 레시피 요약과<br className="mobile-br" /> 완성 이미지를 도와드려요.</p>
              
              <Link to="/register" className="btn-register">
                + 레시피 등록하기
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 커스텀 토스트 알림 컴포넌트 */}
      <div className={`custom-toast ${toast.type} ${toast.visible ? "show" : ""}`}>
        <span className="toast-icon">
          {toast.type === "success" && "✨"}
          {toast.type === "warning" && "⚠️"}
          {toast.type === "info" && "ℹ️"}
        </span>
        <span className="toast-message">{toast.message}</span>
      </div>
    </Layout>
  );
}
