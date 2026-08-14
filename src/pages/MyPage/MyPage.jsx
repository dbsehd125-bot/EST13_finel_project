import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { Layout } from '../../components';
import { Pencil, MessageCircle, Search, ChevronDown, Eye, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

function MyRecipeCard({ recipe, onTogglePublic, isLikedCard }) {
  const navigate = useNavigate();

  return (
    <div 
      className={styles['recipe-card']} 
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles['recipe-image-container']} style={{ backgroundColor: 'var(--brand-light-gray)', backgroundImage: recipe.image ? `url(${recipe.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {!isLikedCard && (
          <span 
            className={`text-s ${styles['privacy-badge']} ${recipe.isPublic ? styles['public'] : styles['private']}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublic && onTogglePublic(recipe.id);
            }}
            style={{ cursor: 'pointer' }}
            title="공개/비공개 전환"
          >
            {recipe.isPublic ? '공개' : '비공개'}
          </span>
        )}
      </div>
      <div className={styles['recipe-content']}>
        <h3 className={`text-lg ${styles['recipe-title']}`}>{recipe.title}</h3>
        <div className={`text-sm ${styles['recipe-meta']}`}>
          <span><Eye size={14} /> {recipe.views}</span>
          <span><Heart size={14} /> {recipe.likes}</span>
        </div>
        {!isLikedCard && (
          <div className={styles['recipe-actions']}>
            <button className={`text-button ${styles['btn-card-action']}`} onClick={(e) => e.stopPropagation()}><Pencil size={14} /> 수정</button>
            <button className={`text-button ${styles['btn-card-action']}`} onClick={(e) => e.stopPropagation()}>🗑 삭제</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      alert("로그인이 필요한 페이지입니다.");
      navigate('/login', { state: { from: "/mypage" } });
    }
  }, [user, authLoading, navigate]);

  const [activeTab, setActiveTab] = useState('내가 작성한 레시피');
  const [sortOrder, setSortOrder] = useState('최신순');
  const [isSortOpen, setIsSortOpen] = useState(false);

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

  const [recipeData, setRecipeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loadingLiked, setLoadingLiked] = useState(false);

  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [loadingBookmarked, setLoadingBookmarked] = useState(false);

  // 저장한(즐겨찾기) 레시피 불러오기
  useEffect(() => {
    async function fetchBookmarkedRecipes() {
      if (!user) return;
      try {
        setLoadingBookmarked(true);
        // 1. 유저가 즐겨찾기한 recipe_id 목록 조회
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('recipe_bookmarks')
          .select('recipe_id')
          .eq('user_id', user.id);
          
        if (bookmarksError) throw bookmarksError;
        
        const recipeIds = bookmarksData.map(bookmark => bookmark.recipe_id);
        
        if (recipeIds.length === 0) {
          setBookmarkedRecipes([]);
          return;
        }

        // 2. 해당 id들의 레시피 데이터 조회
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds);
          
        if (recipesError) throw recipesError;

        const mappedRecipes = (recipesData || []).map(row => ({
          id: row.id,
          title: row.title,
          views: row.views || 0,
          likes: row.like_count || row.likes || 0,
          image: row.thumbnail_url || row.image_url || '',
          isPublic: row.is_public || false
        }));

        setBookmarkedRecipes(mappedRecipes);
      } catch (err) {
        console.error('저장한 레시피 목록 조회 오류:', err);
      } finally {
        setLoadingBookmarked(false);
      }
    }

    if (activeTab === '저장한 레시피') {
      fetchBookmarkedRecipes();
    }
  }, [user, activeTab]);

  // 좋아요한 레시피 불러오기
  useEffect(() => {
    async function fetchLikedRecipes() {
      if (!user) return;
      try {
        setLoadingLiked(true);
        // 1. 유저가 좋아요한 recipe_id 목록 조회
        const { data: likesData, error: likesError } = await supabase
          .from('recipe_likes')
          .select('recipe_id')
          .eq('user_id', user.id);
          
        if (likesError) throw likesError;
        
        const recipeIds = likesData.map(like => like.recipe_id);
        
        if (recipeIds.length === 0) {
          setLikedRecipes([]);
          return;
        }

        // 2. 해당 id들의 레시피 데이터 조회
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .in('id', recipeIds);
          
        if (recipesError) throw recipesError;

        const mappedRecipes = (recipesData || []).map(row => ({
          id: row.id,
          title: row.title,
          views: row.views || 0,
          likes: row.like_count || row.likes || 0,
          image: row.thumbnail_url || row.image_url || '',
          isPublic: row.is_public || false
        }));

        setLikedRecipes(mappedRecipes);
      } catch (err) {
        console.error('좋아요한 레시피 목록 조회 오류:', err);
      } finally {
        setLoadingLiked(false);
      }
    }

    if (activeTab === '좋아요한 레시피') {
      fetchLikedRecipes();
    }
  }, [user, activeTab]);

  useEffect(() => {
    async function fetchMyRecipes() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedRecipes = (data || []).map(row => ({
          id: row.id,
          title: row.title,
          views: row.views || 0,
          likes: row.likes || 0,
          image: row.thumbnail_url || row.image_url || '',
          isPublic: row.is_public || false
        }));

        setRecipeData(mappedRecipes);
      } catch (err) {
        console.error('내 레시피 목록 조회 오류:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyRecipes();
  }, [user]);

  const togglePublic = async (id) => {
    // 1. UI 먼저 업데이트 (Optimistic Update)
    setRecipeData(prev => prev.map(r => r.id === id ? { ...r, isPublic: !r.isPublic } : r));

    // 2. DB 업데이트
    const targetRecipe = recipeData.find(r => r.id === id);
    if (!targetRecipe) return;
    
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ is_public: !targetRecipe.isPublic })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('공개/비공개 상태 업데이트 오류:', err);
      // 에러 시 원래 상태로 롤백
      setRecipeData(prev => prev.map(r => r.id === id ? { ...r, isPublic: targetRecipe.isPublic } : r));
    }
  };

  // 최종 검색어(debouncedSearchTerm)가 포함된 레시피만 걸러냅니다.
  const filteredRecipes = recipeData.filter(recipe =>
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
              <h2 className={`font-display dtext-2xl ${styles['profile-name']}`}>{user?.user_metadata?.nickname || '사용자'}</h2>              <p className={`text-m ${styles['profile-handle']}`}>{user?.email ? `@${user.email.split('@')[0]}` : '@user'}</p>
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
              <span className={`font-display dtext-xl ${styles['stat-number']}`}>{recipeData.length}</span>
              <span className={`text-s ${styles['stat-label']}`}>레시피</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={`font-display dtext-xl ${styles['stat-number']}`}>0</span>
              <span className={`text-s ${styles['stat-label']}`}>팔로워</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={`font-display dtext-xl ${styles['stat-number']}`}>0</span>
              <span className={`text-s ${styles['stat-label']}`}>팔로잉</span>
            </div>
            <div className={styles['stat-item']}>
              <span className={`font-display dtext-xl ${styles['stat-number']}`}>
                {recipeData.reduce((sum, recipe) => sum + (recipe.likes || 0), 0).toLocaleString()}
              </span>
              <span className={`text-s ${styles['stat-label']}`}>좋아요</span>
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

        {/* 탭 콘텐츠 영역 */}
        {activeTab === '내가 작성한 레시피' && (
          <>
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
              <div className={styles['toolbar-right']} style={{ position: 'relative' }}>
                <button 
                  className={`text-button ${styles['sort-btn']}`}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                >
                  {sortOrder} <ChevronDown size={16} />
                </button>
                
                {isSortOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    marginTop: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    {['최신순', '인기순', '조회순', '좋아요순'].map(option => (
                      <button 
                        key={option} 
                        className="text-m"
                        style={{
                          padding: '10px', 
                          cursor: 'pointer',
                          backgroundColor: sortOrder === option ? '#f8f9fa' : 'white',
                          border: 'none',
                          textAlign: 'center',
                          width: '100%',
                          color: 'var(--brand-black)'
                        }}
                        onClick={() => {
                          setSortOrder(option);
                          setIsSortOpen(false);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = sortOrder === option ? '#f8f9fa' : 'white'}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                <button 
                  className={`text-button ${styles['btn-new-recipe']}`}
                  onClick={() => navigate('/register')}
                >
                  + 새 레시피 작성
                </button>
              </div>
            </div>

            <div className={styles['recipe-grid']}>
              {filteredRecipes.map(recipe => (
                <MyRecipeCard key={recipe.id} recipe={recipe} onTogglePublic={togglePublic} />
              ))}
            </div>
          </>
        )}

        {activeTab === '저장한 레시피' && (
          loadingBookmarked ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
              <p className="text-lg">로딩 중...</p>
            </div>
          ) : bookmarkedRecipes.length === 0 ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
              <p className="text-lg">아직 저장한 레시피가 없습니다.</p>
              <p className="text-sm" style={{ marginTop: '0.5rem' }}>마음에 드는 레시피를 저장해보세요!</p>
            </div>
          ) : (
            <div className={styles['recipe-grid']}>
              {bookmarkedRecipes.map(recipe => (
                <MyRecipeCard key={recipe.id} recipe={recipe} isLikedCard={true} />
              ))}
            </div>
          )
        )}

        {activeTab === '좋아요한 레시피' && (
          loadingLiked ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
              <p className="text-lg">로딩 중...</p>
            </div>
          ) : likedRecipes.length === 0 ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
              <p className="text-lg">아직 좋아요를 누른 레시피가 없습니다.</p>
            </div>
          ) : (
            <div className={styles['recipe-grid']}>
              {likedRecipes.map(recipe => (
                <MyRecipeCard key={recipe.id} recipe={recipe} isLikedCard={true} />
              ))}
            </div>
          )
        )}

        {activeTab === '요리 후기' && (
          <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
            <p className="text-lg">작성한 요리 후기가 없습니다.</p>
          </div>
        )}

        {activeTab === '주간 식단' && (
          <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
            <p className="text-lg">이번 주 식단이 비어있습니다.</p>
            <button className={`text-button ${styles['btn-new-recipe']}`} style={{ marginTop: '1rem' }}>+ 식단 계획하기</button>
          </div>
        )}

        {activeTab === '장보기 목록' && (
          <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
            <p className="text-lg">장보기 목록이 비어있습니다.</p>
            <button className={`text-button ${styles['btn-new-recipe']}`} style={{ marginTop: '1rem' }}>+ 품목 추가</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
