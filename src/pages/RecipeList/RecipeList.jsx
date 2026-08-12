import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Layout } from '../../components';
import { Search, X, List, Grid, LayoutGrid, Clock, Heart, MessageCircle, Eye, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Skeleton } from '@mui/material';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import styles from './RecipeList.module.css';

function FilterChip({ filterName, onRemove }) {
  return (
    <span className={`${styles['filter-chip']} text-button`}>
      {filterName}
      <button className={styles['remove-filter']} onClick={() => onRemove(filterName)}>
        <X size={14} />
      </button>
    </span>
  );
}

function RecipeCard({ recipe, isWished, onToggleWish }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className={styles['recipe-card']} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div 
        className={styles['recipe-image-container']} 
        style={{ 
          backgroundColor: 'var(--brand-light-gray)',
          backgroundImage: recipe.image ? `url(${recipe.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <span className={`${styles['category-badge']} text-s`}>{recipe.category}</span>
        <button 
          className={styles['like-btn']} 
          onClick={(e) => {
            e.preventDefault();
            onToggleWish();
          }}
        >
          <Heart 
            size={18} 
            fill={isWished ? "#FF5E36" : "none"} 
            color={isWished ? "#FF5E36" : "currentColor"} 
          />
        </button>
      </div>
      <div className={styles['recipe-content']}>
        <h3 className={`${styles['recipe-title']} text-lg`}>{recipe.title}</h3>
        <div className={`${styles['recipe-author']} text-sm`}>
          <div 
            className={styles['author-avatar']} 
            style={{ 
              backgroundColor: 'var(--brand-light-gray)',
              backgroundImage: `url(${recipe.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          <span>{recipe.author}</span>
        </div>
        <div className={`${styles['recipe-meta-info']} text-s`}>
          <span><Clock size={14} /> {recipe.time}</span>
          <span>{recipe.difficulty}</span>
        </div>
        <div className={`${styles['recipe-stats']} text-s`}>
          <span className={styles['rating']}><Star size={14} fill="currentColor" /> {recipe.rating}</span>
          <span className={styles['views']}><Heart size={14} /> {recipe.views}</span>
          <span className={styles['comments']}><MessageCircle size={14} /> {recipe.comments}</span>
        </div>
      </div>
    </Link>
  );
}

function RecipeCardSkeleton() {
  return (
    <div className={styles['recipe-card']}>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height={180} 
        style={{ borderRadius: '20px 20px 0 0' }}
      />
      <div className={styles['recipe-content']}>
        <Skeleton variant="text" width="80%" height={24} style={{ marginBottom: '12px' }} />
        <div className={styles['recipe-author']} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        <div className={styles['recipe-meta-info']} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <div className={styles['recipe-stats']} style={{ display: 'flex', gap: '12px' }}>
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
      </div>
    </div>
  );
}

// 메인 페이지
export default function RecipeList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [activeFilters, setActiveFilters] = useState([]);
  const [wishedIds, setWishedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('최신순');
  const [viewMode, setViewMode] = useState('recipe-grid-3col');

  const [openSections, setOpenSections] = useState({
    category: true,
    diet: true,
    difficulty: true,
    sort: true,
  });

  const ITEMS_PER_PAGE = 9;

  const filterCategories = ['한식', '양식', '일식', '중식', '분식', '디저트', '야식'];
  const filterDiets = ['다이어트', '고단백', '저탄수화물', '비건', '채식', '글루텐 프리', '저염식'];
  const filterDifficulties = ['매우 쉬움', '쉬움', '보통', '어려움'];
  const filterSortOptions = ['최신순', '평점순', '조회순', '좋아요순', '댓글순'];

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. 검색어 디바운스 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. 사용자의 좋아요(찜) 목록 조회
  useEffect(() => {
    if (!user) {
      setWishedIds([]);
      return;
    }
    const fetchUserLikes = async () => {
      try {
        const { data, error } = await supabase
          .from("recipe_likes")
          .select("recipe_id")
          .eq("user_id", user.id);
        if (error) throw error;
        setWishedIds((data || []).map(item => item.recipe_id));
      } catch (err) {
        console.error("좋아요 목록 조회 실패:", err);
      }
    };
    fetchUserLikes();
  }, [user]);

  // 3. 레시피 데이터 조회 (검색, 필터, 정렬, 페이지네이션 적용)
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("recipes").select("*", { count: "exact" });

        // 검색 조건 적용
        if (debouncedSearchTerm) {
          query = query.or(`title.ilike.%${debouncedSearchTerm}%,nickname.ilike.%${debouncedSearchTerm}%`);
        }

        // 음식 종류 필터 적용
        const activeCategories = activeFilters.filter(f => filterCategories.includes(f));
        if (activeCategories.length > 0) {
          query = query.in("cuisine", activeCategories);
        }

        // 난이도 필터 적용
        const activeDifficulties = activeFilters.filter(f => filterDifficulties.includes(f));
        if (activeDifficulties.length > 0) {
          query = query.in("difficulty", activeDifficulties);
        }

        // 건강/식단 필터 적용 (tags text[] 컬럼 매칭)
        const activeDiets = activeFilters.filter(f => filterDiets.includes(f));
        if (activeDiets.length > 0) {
          query = query.cs("tags", activeDiets);
        }

        // 정렬 적용
        switch (sortBy) {
          case '최신순':
            query = query.order('created_at', { ascending: false });
            break;
          case '평점순':
            query = query.order('rating', { ascending: false, nullsFirst: false });
            break;
          case '조회순':
            query = query.order('views', { ascending: false, nullsFirst: false });
            break;
          case '좋아요순':
            query = query.order('likes_count', { ascending: false, nullsFirst: false });
            break;
          case '댓글순':
            query = query.order('comments_count', { ascending: false, nullsFirst: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }

        // 페이지네이션 범위 설정
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, count, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        const normalized = (data || []).map(r => ({
          id: r.id,
          category: r.cuisine || "기타",
          title: r.title,
          author: r.nickname || "레시피 장인",
          avatar: r.author_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
          image: r.thumbnail_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
          time: r.cooking_time ? (String(r.cooking_time).includes("분") ? r.cooking_time : `${r.cooking_time}분`) : "30분",
          difficulty: r.difficulty || "보통",
          rating: r.rating || 4.8,
          views: r.likes_count !== undefined ? String(r.likes_count) : "0",
          comments: r.comments_count !== undefined ? String(r.comments_count) : "0"
        }));

        setRecipes(normalized);
        setTotalCount(count || 0);
      } catch (err) {
        console.error("레시피 목록 페칭 에러:", err);
        setError("레시피 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [debouncedSearchTerm, activeFilters, sortBy, currentPage]);

  const handleFilterChange = (filterName) => {
    setActiveFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (option) => {
    setSortBy(option);
    setCurrentPage(1);
  };

  const toggleWish = async (recipeId) => {
    if (!user) {
      if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        navigate("/login");
      }
      return;
    }

    const isWished = wishedIds.includes(recipeId);
    
    // UI 낙관적 업데이트
    setWishedIds(prev => 
      isWished ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
    setRecipes(prev => 
      prev.map(r => {
        if (r.id === recipeId) {
          const currentViews = parseInt(r.views) || 0;
          return {
            ...r,
            views: String(isWished ? Math.max(0, currentViews - 1) : currentViews + 1)
          };
        }
        return r;
      })
    );

    try {
      if (isWished) {
        const { error } = await supabase
          .from("recipe_likes")
          .delete()
          .eq("recipe_id", recipeId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("recipe_likes")
          .insert({
            recipe_id: recipeId,
            user_id: user.id
          });
        if (error) throw error;
      }

      // recipes 테이블의 likes_count 필드 동기화
      const targetRecipe = recipes.find(r => r.id === recipeId);
      if (targetRecipe) {
        const currentLikes = parseInt(targetRecipe.views) || 0;
        const nextLikes = isWished ? Math.max(0, currentLikes - 1) : currentLikes + 1;

        const { error: countError } = await supabase
          .from("recipes")
          .update({ likes_count: nextLikes })
          .eq("id", recipeId);
        if (countError) throw countError;
      }
    } catch (err) {
      console.error("좋아요 처리 에러:", err);
      // 실패 시 롤백
      setWishedIds(prev => 
        isWished ? [...prev, recipeId] : prev.filter(id => id !== recipeId)
      );
      setRecipes(prev => 
        prev.map(r => {
          if (r.id === recipeId) {
            const currentViews = parseInt(r.views) || 0;
            return {
              ...r,
              views: String(isWished ? currentViews + 1 : Math.max(0, currentViews - 1))
            };
          }
          return r;
        })
      );
      alert("좋아요 처리에 실패했습니다: " + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Layout activeMenu="레시피 둘러보기">
      <div className={styles['recipe-list-page']}>
        {/* 페이지 타이틀 헤더 */}
        <section className={styles['page-header']}>
          <div className={styles['title-area']}>
            <h1 className={`font-display dtext-5xl ${styles['title-h1']}`}>레시피 둘러보기</h1>
            <p className={`text-m ${styles['title-p']}`}>다양한 레시피를 검색하고 나만의 요리 영감을 찾아보세요.</p>
          </div>
        </section>

        {/* 검색 및 필터 영역 */}
        <div className={styles['search-section']}>
          <div className={styles['main-search-bar']}>
            <Search size={20} className={styles['search-icon']} />
            <input
              type="text"
              className="text-m"
              placeholder="요리명, 재료, 작성자를 검색해보세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles['active-filters']}>
            {activeFilters.map(filter => (
              <FilterChip
                key={filter}
                filterName={filter}
                onRemove={(name) => handleFilterChange(name)}
              />
            ))}
            <button className={`${styles['clear-filters']} text-button`} onClick={() => { setActiveFilters([]); setCurrentPage(1); }}>모두 지우기</button>
          </div>
        </div>

        <div className={styles['content-area']}>
          {/* 필터 사이드바 */}
          <aside className={styles['sidebar']}>
            <div className={styles['filter-group']}>
              <div className={`${styles['filter-header']} font-display dtext-xl`}>필터</div>

              <div className={styles['filter-category']}>
                <div 
                  className={`${styles['filter-title']} text-button`} 
                  onClick={() => toggleSection('category')}
                >
                  음식 종류 
                  <ChevronDown size={16} style={{ transform: openSections.category ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {openSections.category && filterCategories.map(cat => (
                  <label key={cat} className={`${styles['checkbox-label']} text-sm`}>
                    <input 
                      type="checkbox" 
                      checked={activeFilters.includes(cat)}
                      onChange={() => handleFilterChange(cat)}
                    /> 
                    {cat}
                  </label>
                ))}
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div 
                  className={`${styles['filter-title']} text-button`}
                  onClick={() => toggleSection('diet')}
                >
                  건강/식단 
                  <ChevronDown size={16} style={{ transform: openSections.diet ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {openSections.diet && filterDiets.map(diet => (
                  <label key={diet} className={`${styles['checkbox-label']} text-sm`}>
                    <input 
                      type="checkbox" 
                      checked={activeFilters.includes(diet)}
                      onChange={() => handleFilterChange(diet)}
                    /> 
                    {diet}
                  </label>
                ))}
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div 
                  className={`${styles['filter-title']} text-button`}
                  onClick={() => toggleSection('difficulty')}
                >
                  난이도 
                  <ChevronDown size={16} style={{ transform: openSections.difficulty ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {openSections.difficulty && filterDifficulties.map(diff => (
                  <label key={diff} className={`${styles['checkbox-label']} text-sm`}>
                    <input 
                      type="checkbox" 
                      checked={activeFilters.includes(diff)}
                      onChange={() => handleFilterChange(diff)}
                    /> 
                    {diff}
                  </label>
                ))}
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div 
                  className={`${styles['filter-title']} text-button`}
                  onClick={() => toggleSection('sort')}
                >
                  정렬 
                  <ChevronDown size={16} style={{ transform: openSections.sort ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {openSections.sort && filterSortOptions.map(option => (
                  <label key={option} className={`${styles['radio-label']} text-sm`}>
                    <input 
                      type="radio" 
                      name="sort" 
                      checked={sortBy === option}
                      onChange={() => handleSortChange(option)}
                    /> 
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* 메인 레시피 목록 */}
          <main className={styles['recipe-main']}>
            <div className={styles['results-header']}>
              <span className={`${styles['results-count']} text-sm`}>총 {totalCount}개의 레시피</span>
              <div className={styles['view-toggles']}>
                <button 
                  className={`${styles['view-btn']} ${viewMode === 'recipe-grid-2col' ? styles['active'] : ''}`}
                  onClick={() => setViewMode('recipe-grid-2col')}
                ><LayoutGrid size={18} /></button>
                <button 
                  className={`${styles['view-btn']} ${viewMode === 'recipe-grid-3col' ? styles['active'] : ''}`}
                  onClick={() => setViewMode('recipe-grid-3col')}
                ><Grid size={18} /></button>
              </div>
            </div>

            {loading ? (
              <div className={styles[viewMode]}>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <RecipeCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                <p>{error}</p>
                <button 
                  className="text-button" 
                  onClick={() => setCurrentPage(1)}
                  style={{
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                >
                  다시 시도
                </button>
              </div>
            ) : recipes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--brand-gray)' }}>
                검색 조건에 맞는 레시피가 존재하지 않습니다.
              </div>
            ) : (
              <div className={styles[viewMode]}>
                {recipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    isWished={wishedIds.includes(recipe.id)}
                    onToggleWish={() => toggleWish(recipe.id)}
                  />
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {!loading && !error && totalPages > 1 && (
              <div className={styles['pagination']} style={{ marginTop: '40px' }}>
                <button 
                  className={`${styles['page-btn']} ${styles['nav-btn']}`}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {pageNumbers.map(number => (
                  <button 
                    key={number}
                    className={`${styles['page-btn']} ${currentPage === number ? styles['active'] : ''} text-button`}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </button>
                ))}

                <button 
                  className={`${styles['page-btn']} ${styles['nav-btn']}`}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
