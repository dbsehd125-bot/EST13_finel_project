import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
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


  const recipes = [
    { id: 1, category: '양식', title: '매콤 크림 닭갈비 파스타', author: '주말의셰프', time: '30분', difficulty: '보통', rating: 4.9, views: '2,104', comments: '341', image: 'https://images.unsplash.com/photo-1645696301019-35adcb18cb4d?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80' },
    { id: 2, category: '다이어트', title: '냉장고 채소로 만드는 두부 덮밥', author: '초록식탁', time: '20분', difficulty: '쉬움', rating: 4.9, views: '1,567', comments: '288', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80' },
    { id: 3, category: '양식', title: '봉골레 오일 파스타', author: '미드나잇키친', time: '20분', difficulty: '보통', rating: 4.8, views: '1,330', comments: '202', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' },
    { id: 4, category: '한식', title: '아보카도 명란 비빔밥', author: '건강식탁', time: '15분', difficulty: '매우 쉬움', rating: 4.7, views: '1,120', comments: '156', image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    { id: 5, category: '분식', title: '매콤 달콤 떡볶이', author: '분식매니아', time: '25분', difficulty: '쉬움', rating: 4.9, views: '3,450', comments: '521', image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: 6, category: '일식', title: '바삭바삭 돈까스', author: '일식장인', time: '40분', difficulty: '보통', rating: 4.6, views: '890', comments: '112', image: 'https://images.unsplash.com/photo-1599321955726-e04842669811?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' },
    { id: 7, category: '디저트', title: '상큼한 베리 팬케이크', author: '달콤한하루', time: '20분', difficulty: '쉬움', rating: 4.8, views: '1,950', comments: '276', image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' },
    { id: 8, category: '한식', title: '구수한 된장찌개', author: '할머니손맛', time: '30분', difficulty: '쉬움', rating: 4.9, views: '2,740', comments: '412', image: 'https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?auto=format&fit=crop&w=400&q=80', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80' },
  ];

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

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    const parseNum = (str) => parseInt(String(str).replace(/,/g, '')) || 0;
    
    switch (sortBy) {
      case '최신순':
        return b.id - a.id;
      case '인기순':
        return b.rating - a.rating;
      case '조회순':
      case '좋아요순':
        return parseNum(b.views) - parseNum(a.views);
      case '댓글 많은 순':
        return parseNum(b.comments) - parseNum(a.comments);
      default:
        return 0;
    }
  });

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
              {sortedRecipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  isWished={wishedIds.includes(recipe.id)}
                  onToggleWish={() => toggleWish(recipe.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className={styles['pagination']}>
              <button className={`${styles['page-btn']} ${styles['nav-btn']}`}><ChevronLeft size={16} /></button>
              <button className={`${styles['page-btn']} ${styles['active']} text-button`}>1</button>
              <button className={`${styles['page-btn']} text-button`}>2</button>
              <button className={`${styles['page-btn']} text-button`}>3</button>
              <button className={`${styles['page-btn']} text-button`}>4</button>
              <button className={`${styles['page-btn']} text-button`}>5</button>
              <button className={`${styles['page-btn']} ${styles['nav-btn']}`}><ChevronRight size={16} /></button>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
