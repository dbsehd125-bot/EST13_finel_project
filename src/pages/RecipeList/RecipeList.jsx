import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { Layout } from '../../components';
import { Search, X, List, Grid, LayoutGrid, Clock, Heart, MessageCircle, Eye, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
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
          backgroundImage: `url(${recipe.image})`,
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

// 디바운스
export default function RecipeList() {
  const [activeFilters, setActiveFilters] = useState([]);
  const [wishedIds, setWishedIds] = useState([]);

  const toggleWish = (id) => {
    setWishedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (filterName) => {
    setActiveFilters(prev =>
      prev.includes(filterName)
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    );
  };

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

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        console.log("레시피 목록 검색 실행 (디바운스 완료):", searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);

        let sortColumn = 'created_at';
        switch (sortBy) {
          case '인기순': sortColumn = 'rating'; break;
          case '조회순': sortColumn = 'views'; break;
          case '좋아요순': sortColumn = 'like_count'; break;
          case '댓글 많은 순': sortColumn = 'comment_count'; break;
          case '최신순':
          default: sortColumn = 'created_at'; break;
        }

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('is_public', true)
          .order(sortColumn, { ascending: false });

        if (error) throw error;

        const mappedRecipes = (data || []).map(row => ({
          id: row.id,
          category: row.cuisine || row.category || '기타',
          title: row.title,
          author: row.author_nickname || '사용자',
          time: row.cooking_time || row.time || '0분',
          difficulty: row.difficulty || '보통',
          rating: row.rating || 0,
          views: row.views || 0,
          comments: row.comment_count || row.comments_count || 0,
          image: row.thumbnail_url || row.image_url || '',
          avatar: row.author_avatar || '',
          diet: row.diet || ''
        }));

        setRecipes(mappedRecipes);
      } catch (err) {
        console.error('레시피 목록 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [sortBy]);

  const filterCategories = ['한식', '양식', '일식', '중식', '분식', '디저트', '야식'];
  const filterDiets = ['다이어트', '고단백', '저탄수화물', '비건', '채식', '글루텐 프리', '저염식'];
  const filterDifficulties = ['매우 쉬움', '쉬움', '보통', '어려움'];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.includes(debouncedSearchTerm) || recipe.author.includes(debouncedSearchTerm);

    const activeCategories = activeFilters.filter(f => filterCategories.includes(f));
    const activeDiets = activeFilters.filter(f => filterDiets.includes(f));
    const activeDifficulties = activeFilters.filter(f => filterDifficulties.includes(f));

    const matchesCategory = activeCategories.length === 0 || activeCategories.includes(recipe.category);
    const matchesDiet = activeDiets.length === 0 || activeDiets.includes(recipe.category) || (recipe.diet && activeDiets.includes(recipe.diet));
    const matchesDifficulty = activeDifficulties.length === 0 || activeDifficulties.includes(recipe.difficulty);

    return matchesSearch && matchesCategory && matchesDiet && matchesDifficulty;
  });

  const filterSortOptions = ['최신순', '인기순', '조회순', '좋아요순', '댓글 많은 순'];

  const sortedRecipes = filteredRecipes;

  // --- 페이지네이션 로직 ---
  const [currentPage, setCurrentPage] = useState(1);

  // 필터나 검색어가 변경되면 1페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, debouncedSearchTerm, sortBy]);

  const PAGE_SIZE = 12;
  const PAGEGP_SIZE = 5;

  const count = sortedRecipes.length;
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);

  const from = (safePage - 1) * PAGE_SIZE;
  const currentRecipes = sortedRecipes.slice(from, from + PAGE_SIZE);

  const pageGP = Math.ceil(safePage / PAGEGP_SIZE);
  const groupStart = (pageGP - 1) * PAGEGP_SIZE + 1;
  const groupEnd = Math.min(groupStart + (PAGEGP_SIZE - 1), pageCount);

  const pageCountArray = [];
  for (let i = groupStart; i <= groupEnd; i++) {
    pageCountArray.push(i);
  }

  const prevGP = groupStart - PAGEGP_SIZE;
  const nextGP = groupEnd + 1;

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

        {/* [검색 및 필터 영역: */}
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
                onRemove={(name) => setActiveFilters(activeFilters.filter(item => item !== name))}
              />
            ))}
            <button className={`${styles['clear-filters']} text-button`} onClick={() => setActiveFilters([])}>모두 지우기</button>
          </div>
        </div>

        <div className={styles['content-area']}>
          {/* 필터 사이드바*/}
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
                      onChange={() => setSortBy(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* 메인 레시피 목록*/}
          <main className={styles['recipe-main']}>
            <div className={styles['results-header']}>
              <span className={`${styles['results-count']} text-sm`}>총 {sortedRecipes.length}개의 레시피</span>
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

            <div className={styles[viewMode]}>
              {currentRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isWished={wishedIds.includes(recipe.id)}
                  onToggleWish={() => toggleWish(recipe.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {count > 0 && (
              <div className={styles['pagination']}>
                {pageGP > 1 && (
                  <button
                    className={`${styles['page-btn']} ${styles['nav-btn']}`}
                    onClick={() => setCurrentPage(prevGP)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                {pageCountArray.map(i => (
                  <button
                    key={i}
                    className={`${styles['page-btn']} ${safePage === i ? styles['active'] : ''} text-button`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i}
                  </button>
                ))}

                {groupEnd < pageCount && (
                  <button
                    className={`${styles['page-btn']} ${styles['nav-btn']}`}
                    onClick={() => setCurrentPage(nextGP)}
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
