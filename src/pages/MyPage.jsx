import React, { useState, useEffect } from 'react';
import { Layout } from '../components';
import { Pencil, MessageCircle, Search, ChevronDown, Eye, Heart } from 'lucide-react';
import styles from './MyPage.module.css';

function TabButton({ tab, activeTab, onClick }) {
  return (
    <button
      className={`text-button ${styles['tab-item']} ${activeTab === tab ? styles['active'] : ''}`}
      onClick={() => onClick(tab)}
    >
      {tab}
    </button>
  );
}

function MyRecipeCard({ recipe }) {
  return (
    <div className={styles['recipe-card']}>
      <div className={styles['recipe-image-container']} style={{ backgroundColor: 'var(--brand-light-gray)' }}>
        <span className={`text-s ${styles['privacy-badge']} ${recipe.isPublic ? styles['public'] : styles['private']}`}>
          {recipe.isPublic ? '공개' : '비공개'}
        </span>
      </div>
      <div className={styles['recipe-content']}>
        <h3 className={`text-lg ${styles['recipe-title']}`}>{recipe.title}</h3>
        <div className={`text-sm ${styles['recipe-meta']}`}>
          <span><Eye size={14} /> {recipe.views}</span>
          <span><Heart size={14} /> {recipe.likes}</span>
        </div>
        <div className={styles['recipe-actions']}>
          <button className={`text-button ${styles['btn-card-action']}`}><Pencil size={14} /> 수정</button>
          <button className={`text-button ${styles['btn-card-action']}`}>🗑 삭제</button>
        </div>
      </div>
    </div>
  );
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('내가 작성한 레시피');

  // 디바운스
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) {
        console.log("마이페이지 검색 실행 (디바운스 완료):", searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  const tabs = [
    '내가 작성한 레시피', '저장한 레시피', '좋아요한 레시피', '요리 후기', '주간 식단', '장보기 목록'
  ];

  const recipes = [
    { id: 1, title: '매콤 크림 닭갈비 파스타', views: '18.4k', likes: '1.2k', image: 'https://images.unsplash.com/photo-1645696301019-35adcb18cb4d?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 2, title: '반숙 계란을 올린 간장 버터밥', views: '12.0k', likes: '982', image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 3, title: '냉장고 채소로 만드는 두부 덮밥', views: '21.0k', likes: '1.5k', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 4, title: '매콤한 제육볶음 쌈밥', views: '8.2k', likes: '642', image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 5, title: '정갈한 전주식 비빔밥', views: '15.7k', likes: '1.1k', image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 6, title: '진한 국물의 명품 갈비탕', views: '24.3k', likes: '2.2k', image: 'https://images.unsplash.com/photo-1520209268518-aec60b8bb5ca?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 7, title: '해물 듬뿍 바삭 파전', views: '11.2k', likes: '890', image: 'https://images.unsplash.com/photo-1605298135832-6bb5050f2da3?auto=format&fit=crop&w=400&q=80', isPublic: true },
    { id: 8, title: '나만의 시크릿 레시피', views: '0', likes: '0', image: 'https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=400&q=80', isPublic: false },
  ];

  // 최종 검색어(debouncedSearchTerm)가 포함된 레시피만 걸러냅니다.
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.includes(debouncedSearchTerm)
  );

  return (
    <Layout activeMenu="커뮤니티">
      <div className={styles['mypage-container']}>
        {/* 사용자 프로필 영역 */}
        <div className={styles['profile-section']}>
          <div className={styles['profile-info']}>
            <div className={styles['profile-avatar']} style={{ backgroundColor: 'var(--brand-light-gray)' }}>
            </div>
            <div className={styles['profile-details']}>
              <h2 className={`font-display dtext-2xl ${styles['profile-name']}`}>정서윤</h2>              <p className={`text-m ${styles['profile-handle']}`}>@SarahCooks</p>
              <div className={styles['profile-actions']}>
                <button className={`text-button ${styles['btn-edit-profile']}`}>
                  <Pencil size={14} /> 프로필 수정
                </button>
                <button className={`text-button ${styles['btn-follow']}`}>팔로우</button>
                <button className={styles['btn-message']}>
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles['profile-stats']}>
            <div className={styles['stat-item']}>
              <span className={styles['stat-icon']} style={{ color: 'var(--brand-primary)' }}>🍴</span>
              <span className={`text-lg ${styles['stat-value']}`}>148</span>
              <span className={`text-sm ${styles['stat-label']}`}>레시피</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={styles['stat-icon']} style={{ color: 'var(--brand-primary)' }}>👥</span>
              <span className={`text-lg ${styles['stat-value']}`}>2.1k</span>
              <span className={`text-sm ${styles['stat-label']}`}>팔로워</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={styles['stat-icon']} style={{ color: 'var(--brand-primary)' }}>👤+</span>
              <span className={`text-lg ${styles['stat-value']}`}>695</span>
              <span className={`text-sm ${styles['stat-label']}`}>팔로잉</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={styles['stat-icon']} style={{ color: 'var(--brand-primary)' }}>❤️</span>
              <span className={`text-lg ${styles['stat-value']}`}>9.4k</span>
              <span className={`text-sm ${styles['stat-label']}`}>좋아요</span>
            </div>
          </div>
        </div>

        {/* 메뉴 이동 탭 */}
        <div className={styles['tabs-container']}>
          {tabs.map(tab => (
            <TabButton
              key={tab}
              tab={tab}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* 내 레시피 검색 및 정렬 */}
        <div className={styles['toolbar']}>
          <div className={styles['search-bar']}>
            <Search size={18} className={styles['search-icon']} />
            <input
              type="text"
              className="text-m"
              placeholder="내 레시피 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles['toolbar-right']}>
            <button className={`text-button ${styles['sort-btn']}`}>
              최신순 <ChevronDown size={16} />
            </button>
            <button className={`text-button ${styles['btn-new-recipe']}`}>+ 새 레시피 작성</button>
          </div>
        </div>

        {/* 레시피 목록 결과 화면 */}
        <div className={styles['recipe-grid']}>
          {filteredRecipes.map(recipe => (
            <MyRecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
