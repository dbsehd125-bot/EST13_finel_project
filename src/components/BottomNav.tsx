import React from "react";
import { NavLink } from "react-router";
import { Home, Search, Sparkles, MessageSquare, User } from "lucide-react";
import "./BottomNav.css";

export default function BottomNav(): React.ReactElement {
  return (
    <nav className="bottom-nav" aria-label="모바일 하단 네비게이션">
      <NavLink 
        to="/" 
        end 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Home aria-hidden="true" />
        <span>홈</span>
      </NavLink>
      <NavLink 
        to="/recipes" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Search aria-hidden="true" />
        <span>둘러보기</span>
      </NavLink>
      <NavLink 
        to="/ai" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Sparkles aria-hidden="true" />
        <span>AI 레시피</span>
      </NavLink>
      <NavLink 
        to="/community" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <MessageSquare aria-hidden="true" />
        <span>커뮤니티</span>
      </NavLink>
      <NavLink 
        to="/mypage" 
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <User aria-hidden="true" />
        <span>마이</span>
      </NavLink>
    </nav>
  );
}
