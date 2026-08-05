import React, { useState, useEffect } from 'react';
import { Layout } from '../components';
import { Search, X, List, Grid, LayoutGrid, Clock, Heart, MessageCircle, Eye, Star, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import styles from './RecipeList.module.css';

// [추가] 가독성과 재사용성을 위해 .map() 내부의 코드를 자식 컴포넌트로 분리했습니다.
// (팁에서 말씀드린 '삭제 기능(onClick)'까지 함께 구현해 두었습니다!)
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

// [추가] 메인 레시피 카드 부분을 자식 컴포넌트로 분리했습니다.
function RecipeCard({ recipe }) {
  return (
    <div className={styles['recipe-card']}>
      <div className={styles['recipe-image-container']} style={{ backgroundColor: 'var(--brand-light-gray)' }}>
        <span className={`${styles['category-badge']} text-s`}>{recipe.category}</span>
        <button className={styles['like-btn']}><Heart size={18} /></button>
      </div>
      <div className={styles['recipe-content']}>
        <h3 className={`${styles['recipe-title']} text-lg`}>{recipe.title}</h3>
        <div className={`${styles['recipe-author']} text-sm`}>
          <div className={styles['author-avatar']} style={{ backgroundColor: 'var(--brand-light-gray)' }}></div>
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
    </div>
  );
}

export default function RecipeList() {
  const [activeFilters, setActiveFilters] = useState(['한식', '30분 이하', '쉬움']);

  // [디바운스 관련 코드 시작]
  // 1. 사용자가 입력하는 검색어를 저장할 상태(state)입니다.
  const [searchTerm, setSearchTerm] = useState('');
  // 1-1. [추가] 타이머 대기가 끝난 '최종 검색어'를 저장할 상태입니다.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 2. 검색어(searchTerm)가 바뀔 때마다 실행되는 디바운스(Debounce) 로직입니다.
  useEffect(() => {
    // 3. 타이머 설정: 사용자가 입력을 멈추고 500ms(0.5초)가 지났을 때 내부 코드가 실행됩니다.
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm); // 타이머가 끝나면 최종 검색어로 업데이트!
      if (searchTerm) {
        console.log("레시피 목록 검색 실행 (디바운스 완료):", searchTerm);
        // TODO: 실제로 백엔드에 검색 API를 요청하거나 목록을 필터링하는 코드를 여기에 작성합니다.
      }
    }, 500);

    // 4. 클린업(Cleanup) 함수: 500ms가 지나기 전에 사용자가 새로운 글자를 입력하면
    // 이전에 설정된 타이머를 취소(clearTimeout)하여 중복 실행을 막아줍니다.
    return () => clearTimeout(timer);
  }, [searchTerm]);
  // [디바운스 관련 코드 끝]

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

  // 최종 검색어(debouncedSearchTerm)가 포함된 레시피만 걸러냅니다.
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.includes(debouncedSearchTerm) ||
    recipe.author.includes(debouncedSearchTerm)
  );

  return (
    <Layout activeMenu="레시피 둘러보기">
      <div className={styles['recipe-list-page']}>
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
                <div className={`${styles['filter-title']} text-button`}>음식 종류 <ChevronDown size={16} /></div>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 에피타이저</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 메인 요리</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 샐러드</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 수프</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 디저트</label>
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div className={`${styles['filter-title']} text-button`}>식단 <ChevronDown size={16} /></div>
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div className={`${styles['filter-title']} text-button`}>난이도 <ChevronDown size={16} /></div>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 쉬움</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 보통</label>
                <label className={`${styles['checkbox-label']} text-sm`}><input type="checkbox" /> 어려움</label>
              </div>

              <div className={`${styles['filter-category']} ${styles['border-top']}`}>
                <div className={`${styles['filter-title']} text-button`}>정렬 <ChevronDown size={16} /></div>
                <label className={`${styles['radio-label']} text-sm`}><input type="radio" name="sort" /> 최신순</label>
                <label className={`${styles['radio-label']} text-sm`}><input type="radio" name="sort" defaultChecked /> 인기순</label>
                <label className={`${styles['radio-label']} text-sm`}><input type="radio" name="sort" /> 평점순</label>
              </div>
            </div>
          </aside>

          {/* 메인 레시피 목록*/}
          <main className={styles['recipe-main']}>
            <div className={styles['results-header']}>
              <span className={`${styles['results-count']} text-sm`}>총 {filteredRecipes.length}개의 레시피</span>
              <div className={styles['view-toggles']}>
                <button className={styles['view-btn']}><List size={18} /></button>
                <button className={styles['view-btn']}><LayoutGrid size={18} /></button>
                <button className={`${styles['view-btn']} ${styles['active']}`}><Grid size={18} /></button>
              </div>
            </div>

            <div className={styles['recipe-grid-3col']}>
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
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
