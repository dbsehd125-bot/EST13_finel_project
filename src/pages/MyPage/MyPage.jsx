import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import { Layout } from '../../components';
import { Pencil, MessageCircle, Search, ChevronDown, Eye, Heart, X, Camera, Trash2, UtensilsCrossed, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SEO from "../../components/SEO";
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

function MyRecipeCard({ recipe, onTogglePublic, isLikedCard, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div 
      className={styles['recipe-card']} 
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles['recipe-image-container']} style={{ backgroundColor: 'var(--brand-light-gray)', position: 'relative', overflow: 'hidden' }}>
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            loading="lazy" 
            decoding="async"
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', left: 0, top: 0, zIndex: 0 }} 
          />
        )}
        {!isLikedCard && (
          <button 
            type="button"
            className={`text-s ${styles['privacy-badge']} ${recipe.isPublic ? styles['public'] : styles['private']}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublic && onTogglePublic(recipe.id);
            }}
            title="공개/비공개 전환"
            aria-label={`레시피 ${recipe.isPublic ? "비공개로" : "공개로"} 전환`}
            style={{ zIndex: 1 }}
          >
            {recipe.isPublic ? '공개' : '비공개'}
          </button>
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
            <button className={`text-button ${styles['btn-card-edit']}`} onClick={(e) => { e.stopPropagation(); onEdit && onEdit(recipe); }}><Pencil size={14} /> 수정</button>
            <button className={`text-button ${styles['btn-card-delete']}`} onClick={(e) => { e.stopPropagation(); onDelete && onDelete(recipe.id); }}>
              <Trash2 size={16} />
              <span className={styles['desktop-only']}>삭제</span>
            </button>
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

  // 프로필 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileNickname, setProfileNickname] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const fileInputRef = useRef(null);

  // 디바운스
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 프로필 수정 모달 열기: 현재 프로필 데이터 가져오기
  const openEditModal = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!error && data) {
      setProfileNickname(data.nickname || '');
      setProfileAvatarUrl(data.avatar_url || '');
      setAvatarPreview(data.avatar_url || '');
    } else {
      setProfileNickname(user?.user_metadata?.nickname || '');
      setProfileAvatarUrl('');
      setAvatarPreview('');
    }
    setAvatarFile(null);
    setIsEditModalOpen(true);
  };

  // 프로필 수정 저장
  const saveProfile = async () => {
    if (!user) return;
    try {
      setProfileSaving(true);
      let finalAvatarUrl = profileAvatarUrl;

      // 새 이미지를 선택한 경우 Storage 업로드
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const filePath = `avatars/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath);
        finalAvatarUrl = urlData.publicUrl;
      }

      // 1) profiles 테이블 upsert
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          nickname: profileNickname,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (upsertError) {
        console.error('[프로필저장] profiles 오류:', upsertError.message, upsertError.code);
        throw upsertError;
      }

      // 2) recipes 테이블 nickname 업데이트
      const { data: recipesData, error: recipesNicknameError } = await supabase
        .from('recipes')
        .update({ nickname: profileNickname })
        .eq('user_id', user.id)
        .select();
      if (recipesNicknameError) {
        console.error('[프로필저장] recipes 오류:', recipesNicknameError.message, recipesNicknameError.code);
      }

      // 3) recipe_comments 테이블 nickname 업데이트
      const { data: commentsData, error: commentsNicknameError } = await supabase
        .from('recipe_comments')
        .update({ nickname: profileNickname })
        .eq('user_id', user.id)
        .select();
      if (commentsNicknameError) {
        console.error('[프로필저장] recipe_comments 오류:', commentsNicknameError.message, commentsNicknameError.code);
      }

      setProfileAvatarUrl(finalAvatarUrl);
      setIsEditModalOpen(false);
      alert(`프로필이 저장되었습니다!\n닉네임: ${profileNickname}\n레시피 업데이트: ${recipesData?.length ?? 0}건\n댓글 업데이트: ${commentsData?.length ?? 0}건`);
    } catch (err) {
      console.error('[프로필저장] 전체 오류:', err);
      alert(`프로필 저장 중 오류가 발생했습니다.\n오류: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  // 아바타 파일 선택 핸들러
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // 페이지 진입 시 profiles 테이블에서 최신 프로필 데이터 로드
  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) {
        setProfileNickname(data.nickname || user?.user_metadata?.nickname || '');
        setProfileAvatarUrl(data.avatar_url || '');
        setAvatarPreview(data.avatar_url || '');
      } else {
        // profiles 테이블에 데이터 없으면 auth 메타데이터 fallback
        setProfileNickname(user?.user_metadata?.nickname || '');
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
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
          ...row,
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

  const handleEdit = (recipe) => {
    navigate('/register', {
      state: {
        recipe: {
          id: recipe.id,
          title: recipe.title,
          summary: recipe.summary,
          cuisine: recipe.cuisine,
          cooking_time: recipe.cooking_time,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
          tags: recipe.tags,
          diets: recipe.diets,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          thumbnail_url: recipe.thumbnail_url,
          isPublic: recipe.is_public
        },
        isEditMode: true
      }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("정말로 이 레시피를 삭제하시겠습니까?")) {
      try {
        // 1. DB의 ON DELETE CASCADE 설정이 안 되어 있을 수 있으므로 연관 데이터 먼저 삭제 시도
        await Promise.all([
          supabase.from('recipe_likes').delete().eq('recipe_id', id),
          supabase.from('recipe_bookmarks').delete().eq('recipe_id', id),
          supabase.from('recipe_comments').delete().eq('recipe_id', id)
        ]);

        // 2. 레시피 테이블에서 삭제
        const { error, status } = await supabase.from('recipes').delete().eq('id', id);
        
        if (error) {
          console.error('[레시피 삭제 실패] Supabase Error:', error, 'Status:', status);
          throw Object.assign(new Error(error.message), { code: error.code, status });
        }

        setRecipeData(prev => prev.filter(r => r.id !== id));
        alert("레시피가 삭제되었습니다.");
      } catch (err) {
        console.error('[레시피 삭제 예외 발생]:', err);
        
        if (err.status === 401 || err.code === '401') {
          alert("권한이 없거나 세션이 만료되었습니다. 다시 로그인한 후 시도해주세요.");
        } else if (err.code === '23503') {
          alert("이 레시피와 연결된 데이터(다른 사용자의 댓글/좋아요 등)가 남아있어 삭제할 수 없습니다.\nDB의 CASCADE 설정을 확인해주세요.");
        } else {
          alert(`삭제 중 오류가 발생했습니다.\n상세 내용: ${err.message || '알 수 없는 오류'}`);
        }
      }
    }
  };

  // 최종 검색어(debouncedSearchTerm)가 포함된 레시피만 걸러냅니다.
  const filteredRecipes = recipeData.filter(recipe =>
    recipe.title.includes(debouncedSearchTerm)
  );

  return (
    <Layout activeMenu="커뮤니티">
      <SEO
        title="마이페이지 | 깃깔나는 레시피"
        description="나만의 깃깔나는 레시피 공간입니다."
        url="/mypage"
      />
      <div className={styles['mypage-container']}>
        {/* 사용자 프로필 영역 */}
        <div className={styles['profile-section']}>
          <div className={styles['profile-info']}>
            <div className={styles['profile-avatar']} style={{ backgroundColor: 'var(--brand-light-gray)' }}>
              <img 
                src={profileAvatarUrl || user?.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'} 
                alt="프로필" 
                fetchPriority="high"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
              />
            </div>
            <div className={styles['profile-details']}>
              <h2 className={styles['profile-name']}>{profileNickname || user?.user_metadata?.nickname || '사용자'}</h2>
              <p className={`text-m ${styles['profile-handle']}`}>
                @{user?.user_metadata?.handle || user?.email?.split('@')[0] || 'SarahCooks'}
              </p>
              <div className={styles['profile-actions']}>
                <button className={`text-button ${styles['btn-edit-profile']}`} onClick={openEditModal}>
                  <Pencil size={14} /> 프로필 수정
                </button>
                <button className={`text-button ${styles['btn-follow']}`}>팔로우</button>
                <button className={styles['btn-message']} aria-label="메시지 보내기">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles['profile-stats']}>
            <div className={styles['stat-item']}>
              <UtensilsCrossed size={20} className={styles['stat-icon']} />
              <span className={styles['stat-number']}>{recipeData.length}</span>
              <span className={styles['stat-label']}>레시피</span>
            </div>
            <div className={styles['stat-item']}>
              <Users size={20} className={styles['stat-icon']} />
              <span className={styles['stat-number']}>0</span>
              <span className={styles['stat-label']}>팔로워</span>
            </div>
            <div className={styles['stat-item']}>
              <UserPlus size={20} className={styles['stat-icon']} />
              <span className={styles['stat-number']}>0</span>
              <span className={styles['stat-label']}>팔로잉</span>
            </div>
            <div className={styles['stat-item']}>
              <Heart size={20} className={styles['stat-icon']} />
              <span className={styles['stat-number']}>
                {recipeData.length > 0 
                  ? (recipeData.reduce((sum, recipe) => sum + (recipe.likes || 0), 0) >= 1000
                    ? (recipeData.reduce((sum, recipe) => sum + (recipe.likes || 0), 0) / 1000).toFixed(1) + '천'
                    : recipeData.reduce((sum, recipe) => sum + (recipe.likes || 0), 0))
                  : 0}
              </span>
              <span className={styles['stat-label']}>받은 좋아요</span>
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
                <div className={styles['sort-wrapper']}>
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
                </div>

                <button 
                  className={`text-button ${styles['btn-new-recipe']}`}
                  onClick={() => navigate('/register')}
                >
                  + 새 레시피 작성
                </button>
              </div>
            </div>

            {filteredRecipes.length === 0 ? (
              <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--brand-gray)' }}>
                <p className="text-lg">아직 등록된 레시피가 없습니다.</p>
                <p className="text-sm" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>나만의 깃깔나는 첫 레시피를 작성해보세요!</p>
                <button 
                  className={`text-button ${styles['btn-new-recipe']}`}
                  style={{ display: 'inline-block', padding: '0.75rem 1.5rem', backgroundColor: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  onClick={() => navigate('/register')}
                >
                  + 첫 레시피 작성하러 가기
                </button>
              </div>
            ) : (
              <div className={styles['recipe-grid']}>
                {filteredRecipes.map(recipe => (
                  <MyRecipeCard key={recipe.id} recipe={recipe} onTogglePublic={togglePublic} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
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

      {/* 프로필 수정 모달 */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '40px',
            width: '100%',
            maxWidth: '480px',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--brand-gray)'
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ color: 'var(--brand-brown)', marginBottom: '32px', fontSize: '20px', fontWeight: 700 }}>
              프로필 수정
            </h2>

            {/* 아바타 업로드 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  backgroundColor: 'var(--brand-light-gray)',
                  backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  position: 'relative', cursor: 'pointer',
                  border: '3px solid var(--brand-cream)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '28px', height: '28px',
                  backgroundColor: 'var(--brand-primary)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff'
                }}>
                  <Camera size={14} color="#fff" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
              <p style={{ marginTop: '10px', fontSize: '13px', color: 'var(--brand-gray)' }}>
                이미지를 클릭하여 변경하세요
              </p>
            </div>

            {/* 닉네임 */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--brand-brown)', marginBottom: '8px' }}>
                닉네임
              </label>
              <input
                type="text"
                value={profileNickname}
                onChange={(e) => setProfileNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1px solid var(--brand-divider, #e0e0e0)',
                  borderRadius: '12px', fontSize: '15px',
                  outline: 'none', color: 'var(--brand-brown)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 저장 버튼 */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  flex: 1, padding: '14px',
                  border: '1px solid var(--brand-divider, #e0e0e0)',
                  borderRadius: '12px', background: 'none',
                  color: 'var(--brand-gray)', cursor: 'pointer', fontSize: '15px'
                }}
              >
                취소
              </button>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                style={{
                  flex: 1, padding: '14px',
                  backgroundColor: profileSaving ? '#ccc' : 'var(--brand-primary)',
                  color: '#fff', border: 'none',
                  borderRadius: '12px', cursor: profileSaving ? 'not-allowed' : 'pointer',
                  fontSize: '15px', fontWeight: 600
                }}
              >
                {profileSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
