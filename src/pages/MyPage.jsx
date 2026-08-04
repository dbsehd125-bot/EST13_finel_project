import React, { useState } from 'react';
import { Layout } from '../components';
import { Pencil, MessageCircle, Search, ChevronDown, Eye, Heart } from 'lucide-react';
import './MyPage.css';

export default function MyPage() {
  const [activeTab, setActiveTab] = useState('내가 작성한 레시피');
  
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

  return (
    <Layout activeMenu="커뮤니티">
      <div className="mypage-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-avatar" style={{ backgroundColor: 'var(--brand-light-gray)' }}>
            </div>
            <div className="profile-details">
              <h2 className="font-display dtext-2xl profile-name">정서윤</h2>
              <p className="text-m profile-handle">@SarahCooks</p>
              <div className="profile-actions">
                <button className="text-button btn-edit-profile">
                  <Pencil size={14} /> 프로필 수정
                </button>
                <button className="text-button btn-follow">팔로우</button>
                <button className="btn-message">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-icon" style={{color: 'var(--brand-primary)'}}>🍴</span>
              <span className="text-lg stat-value">148</span>
              <span className="text-sm stat-label">레시피</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon" style={{color: 'var(--brand-primary)'}}>👥</span>
              <span className="text-lg stat-value">2.1k</span>
              <span className="text-sm stat-label">팔로워</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon" style={{color: 'var(--brand-primary)'}}>👤+</span>
              <span className="text-lg stat-value">695</span>
              <span className="text-sm stat-label">팔로잉</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon" style={{color: 'var(--brand-primary)'}}>❤️</span>
              <span className="text-lg stat-value">9.4k</span>
              <span className="text-sm stat-label">좋아요</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-container">
          {tabs.map(tab => (
            <button 
              key={tab} 
              className={`text-button tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" className="text-m" placeholder="내 레시피 검색" />
          </div>
          <div className="toolbar-right">
            <button className="text-button sort-btn">
              최신순 <ChevronDown size={16} />
            </button>
            <button className="text-button btn-new-recipe">+ 새 레시피 작성</button>
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-image-container" style={{ backgroundColor: 'var(--brand-light-gray)' }}>
                <span className={`text-s privacy-badge ${recipe.isPublic ? 'public' : 'private'}`}>
                  {recipe.isPublic ? '공개' : '비공개'}
                </span>
              </div>
              <div className="recipe-content">
                <h3 className="text-lg recipe-title">{recipe.title}</h3>
                <div className="text-sm recipe-meta">
                  <span><Eye size={14} /> {recipe.views}</span>
                  <span><Heart size={14} /> {recipe.likes}</span>
                </div>
                <div className="recipe-actions">
                  <button className="text-button btn-card-action"><Pencil size={14} /> 수정</button>
                  <button className="text-button btn-card-action">🗑 삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
