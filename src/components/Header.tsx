import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import AuthGuardModal from "./AuthGuardModal";
import type { MenuItem } from "../types/navigation";

import "./Header.css";

const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "홈",
    path: "/",
    end: true,
  },
  {
    id: "recipes",
    label: "레시피 둘러보기",
    path: "/recipes",
  },
  {
    id: "ai",
    label: "AI 레시피",
    path: "/ai",
  },
  {
    id: "community",
    label: "커뮤니티",
    path: "/community",
  },
];

export default function Header(): React.ReactElement {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const { user, profile, isLoggedIn, authLoading, logoutLoading, logout } = useAuth();

  const displayName: string =
    profile?.nickname ||
    user?.user_metadata?.nickname ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "사용자";

  const avatarUrl: string | null =
    profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  function closeMenu(): void {
    setMenuOpen(false);
  }

  function closeSearch(): void {
    setSearchOpen(false);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const keyword = searchKeyword.trim();

    if (!keyword) {
      return;
    }

    closeMenu();
    closeSearch();
    setSearchKeyword("");

    navigate("/recipes", {
      state: {
        searchKeyword: keyword,
      },
    });
  }

  async function handleLogout(): Promise<void> {
    if (logoutLoading) return;

    const success = await logout();

    if (!success) {
      alert("로그아웃에 실패했습니다.");
      return;
    }

    closeMenu();
    closeSearch();
    navigate("/");
  }

  const handleRegisterClick = (): void => {
    closeMenu();
    closeSearch();

    if (isLoggedIn) {
      navigate("/register");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link
            to="/"
            className="logo"
            onClick={() => {
              closeMenu();
              closeSearch();
            }}
          >
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

          <nav className="nav" aria-label="주요 메뉴">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `text-sm ${isActive ? "active" : ""}`}
                onClick={closeSearch}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <div className={`header-search ${searchOpen ? "open" : ""}`}>
            {searchOpen && (
              <form className="header-search-form" onSubmit={handleSearchSubmit}>
                <label htmlFor="header-desktop-search" className="sr-only">
                  레시피 검색어
                </label>
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={event => setSearchKeyword(event.target.value)}
                  placeholder="레시피 검색"
                  aria-label="레시피 검색어"
                  autoFocus
                />

                <button
                  type="submit"
                  className="header-search-submit"
                  aria-label="검색 실행"
                  disabled={!searchKeyword.trim()}
                >
                  <svg
                    width="18"
                    height="18"
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
              </form>
            )}

            <button
              type="button"
              className={`icon-btn search-btn hide-on-mobile ${searchOpen ? "active" : ""}`}
              aria-label={searchOpen ? "검색창 닫기" : "검색"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(previous => !previous)}
            >
              {searchOpen ? (
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
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
              )}
            </button>
          </div>

          <button
            type="button"
            className="btn-create text-button hide-on-mobile"
            onClick={handleRegisterClick}
          >
            + 레시피 등록하기
          </button>

          {isLoggedIn && (
            <Link
              to="/mypage"
              className="header-avatar"
              aria-label={`${displayName} 마이페이지로 이동`}
              onClick={() => {
                closeMenu();
                closeSearch();
              }}
            >
              <UserAvatar src={avatarUrl} name={displayName} size="header" />
            </Link>
          )}

          <div className="auth-action">
            {!authLoading &&
              (isLoggedIn ? (
                <button
                  type="button"
                  className="login-link logout-button text-sm"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? "로그아웃 중..." : "로그아웃"}
                </button>
              ) : (
                <Link to="/login" className="login-link text-sm" onClick={closeSearch}>
                  로그인
                </Link>
              ))}
          </div>

          <button
            type="button"
            className={`menu-btn ${menuOpen ? "open" : ""}`}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              closeSearch();
              setMenuOpen(previous => !previous);
            }}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="header-mobile-search" className="sr-only">
            레시피 검색어
          </label>
          <input
            type="search"
            value={searchKeyword}
            onChange={event => setSearchKeyword(event.target.value)}
            placeholder="레시피를 검색해보세요"
            aria-label="레시피 검색어"
          />

          <button type="submit" aria-label="검색" disabled={!searchKeyword.trim()}>
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
        </form>

        <nav className="mobile-nav" aria-label="모바일 메뉴">
          {menuItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `text-m ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mobile-menu-actions">
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
                {logoutLoading ? "로그아웃 중..." : "로그아웃"}
              </button>
            ) : (
              <Link to="/login" className="mobile-login text-button" onClick={closeMenu}>
                로그인
              </Link>
            ))}
        </div>
      </div>

      <AuthGuardModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
}
