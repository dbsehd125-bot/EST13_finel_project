import React from "react";
import { Link } from "react-router";
import "./Footer.css";

export default function Footer(): React.ReactElement {
  const handlePreventDefault = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    e.preventDefault();
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-info">
            <div className="footer-header-row">
              <Link to="/" className="footer-logo">
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
                <span className="logo-title">깃깔나는 레시피</span>
              </Link>
              <div className="footer-sns">
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
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
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
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
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
            <p className="footer-desc">
              한 끼의 생각이 레시피와 이미지로.
              <br className="mobile-br" />
              재료 한 줄이면 AI가 나만의 레시피를 만들어드려요.
            </p>
          </div>

          <div className="footer-links">
            <div className="link-col">
              <h4>서비스</h4>
              <ul>
                <li><Link to="/" onClick={handlePreventDefault}>서비스 소개</Link></li>
                <li><Link to="/" onClick={handlePreventDefault}>공지사항</Link></li>
                <li><Link to="/" onClick={handlePreventDefault}>고객센터</Link></li>
              </ul>
            </div>
            <div className="link-col">
              <h4>정책</h4>
              <ul>
                <li><Link to="/" onClick={handlePreventDefault}>이용약관</Link></li>
                <li><Link to="/" onClick={handlePreventDefault}>개인정보처리방침</Link></li>
                <li><Link to="/" onClick={handlePreventDefault}>문의하기</Link></li>
                <li><Link to="/" onClick={handlePreventDefault}>스타일 가이드</Link></li>
              </ul>
            </div>
            <div className="link-col">
              <h4>탐색</h4>
              <ul>
                <li><Link to="/recipes">레시피 둘러보기</Link></li>
                <li><Link to="/ai">AI 레시피</Link></li>
                <li><Link to="/community">커뮤니티</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 깃깔나는 레시피. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
