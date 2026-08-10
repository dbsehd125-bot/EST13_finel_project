import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';

import { useAuth } from '../context/AuthContext';
import './Header.css';
import AuthGuardModal from '../components/AuthGuardModal';

export default function Header() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoggedIn, authLoading, logoutLoading, logout } = useAuth();

  const menuItems = [
    {
      id: 'home',
      label: '홈',
      path: '/',
      end: true,
    },
    {
      id: 'recipes',
      label: '레시피 둘러보기',
      path: '/recipes',
    },
    {
      id: 'ai',
      label: 'AI 레시피',
      path: '/ai',
    },
    {
      id: 'community',
      label: '커뮤니티',
      path: '/community',
    },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    if (logoutLoading) return;

    const success = await logout();

    if (!success) {
      alert('로그아웃에 실패했습니다.');
      return;
    }

    closeMenu();
    navigate('/');
  }

  const handleRegisterClick = () => {
    closeMenu();

    if (isLoggedIn) {
      navigate('/register');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          {/* 로고 */}
          <Link to="/" className="logo" onClick={closeMenu}>
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
                aria-hidden="true"
              >
                <path d="M12 2v3M8 3v2M16 3v2" />
                <path d="M4 11h16v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z" />
                <path d="M3 11h18" />
              </svg>
            </div>

            <span className="logo-title font-display dtext-xl">깃깔나는 레시피</span>
          </Link>

          {/* 데스크톱 내비게이션 */}
          <nav className="nav" aria-label="주요 메뉴">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `text-sm ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="header-right">
          {/* 검색 */}
          <button type="button" className="icon-btn search-btn hide-on-mobile" aria-label="검색">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* 알림 */}
          <button type="button" className="icon-btn alarm-btn hide-on-mobile" aria-label="알림">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            <span className="alarm-dot">1</span>
          </button>

          {/* 레시피 등록 */}
          {/* <Link to="/register" className="btn-create text-button">
            + 레시피 등록하기
          </Link> */}
          <button type="button" className="btn-create text-button hide-on-mobile" onClick={handleRegisterClick}>
            + 레시피 등록하기
          </button>

          {/* 로그인 상태일 때만 마이페이지 표시 */}
          {isLoggedIn && (
            <Link to="/mypage" className="avatar" aria-label="마이페이지로 이동" onClick={closeMenu}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand-gray)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}

          {/* 데스크톱 로그인 / 로그아웃 */}
          <div className="auth-action">
            {!authLoading &&
              (isLoggedIn ? (
                <button
                  type="button"
                  className="login-link logout-button text-sm"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? '로그아웃 중...' : '로그아웃'}
                </button>
              ) : (
                <Link to="/login" className="login-link text-sm">
                  로그인
                </Link>
              ))}
          </div>

          {/* 태블릿·모바일 햄버거 버튼 */}
          <button
            type="button"
            className={`menu-btn ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((previous) => !previous)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* 태블릿·모바일 펼침 메뉴 */}
      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav" aria-label="모바일 메뉴">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `text-m ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-actions">
          {/* <Link to="/register" className="mobile-create text-button" onClick={closeMenu}>
            레시피 등록하기
          </Link> */}
          <button type="button" className="mobile-create text-button" onClick={handleRegisterClick}>
            레시피 등록하기
          </button>

          {!authLoading &&
            (isLoggedIn ? (
              <button
                type="button"
                className="mobile-login mobile-logout text-button"
                onClick={handleLogout}
                disabled={logoutLoading}
              >
                {logoutLoading ? '로그아웃 중...' : '로그아웃'}
              </button>
            ) : (
              <Link to="/login" className="mobile-login text-button" onClick={closeMenu}>
                로그인
              </Link>
            ))}
        </div>
      </div>

      {/* 로그인 안내 공통 모달 렌더링 추가 */}
      <AuthGuardModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
