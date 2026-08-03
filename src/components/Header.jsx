import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import './Header.css';

export default function Header({ activeMenu = '커뮤니티' }) {
  const [active, setActive] = useState(activeMenu);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: '홈', path: '/' },
    { id: 'explore', label: '레시피 둘러보기', path: '/explore' },
    { id: 'ai', label: 'AI 레시피', path: '/ai' },
    { id: 'community', label: '커뮤니티', path: '/community' },
  ];

  /**추가: id를 통한 라우팅 함수 */
  const handleNavigation = (path) => navigate(path);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <a href="/" className="logo">
            <div className="logo-badge">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v3M8 3v2M16 3v2" />
                <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z" />
                <path d="M3 11h18" />
              </svg>
            </div>
            <span className="logo-title">깃깔나는 레시피</span>
          </a>

          <nav className="nav">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.label ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setActive(item.label);
                  handleNavigation(item.path)
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <button type="button" className="icon-btn" aria-label="검색">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <button type="button" className="icon-btn alarm-btn" aria-label="알림">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="alarm-dot">1</span>
          </button>

          <a href="#register" className="btn-create">
            + 레시피 등록하기
          </a>

          <a href="#profile" className="user-profile">
            <div className="avatar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8E8E93"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>로그인</span>
          </a>
        </div>
      </div>
    </header>
  );
}
